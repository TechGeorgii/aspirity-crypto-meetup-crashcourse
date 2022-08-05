import { React } from 'react'
import './App.css';
import { ethers, Wallet } from "ethers";
import ERC20Abi from './ERC20.json'


function App() {
  const ERROR_CODE_TX_REJECTED_BY_USER = 4001;

  async function loadBalances() {
    const provider = new ethers.providers.JsonRpcProvider("https://eth-goerli.g.alchemy.com/v2/[API_KEY]")
    const signer = new Wallet('[WALLET_PRIVATE_KEY]', provider);

    const contract = new ethers.Contract("0xaE153f3fa1145b3A59b79F64b648cA4559D82ED2", ERC20Abi, signer);

    const [sym, dec, bal] = await Promise.all(
      [
        contract.symbol(),
        contract.decimals(),
        contract.balanceOf('0xee4bF39FAcFB200D2ED1263Be3cA14f57d8597B3')
      ]);

    alert(`Token ${sym} balance: ${ethers.utils.formatUnits(bal, dec)}`);

    const gasLimit = await contract.estimateGas.transfer('0xC9CD020B2C5e3906761A7Ac98cC56A4C6003188D', "1000");
    const gasPrice = await provider.getGasPrice();

    const txCount = await provider.getTransactionCount("0xee4bF39FAcFB200D2ED1263Be3cA14f57d8597B3");
    const tx = await contract.populateTransaction.transfer('0xC9CD020B2C5e3906761A7Ac98cC56A4C6003188D', "1000");
    tx.nonce = "0x" + txCount.toString(16);
    tx.gasPrice = gasPrice;
    tx.gasLimit = gasLimit;

    const signed = await signer.signTransaction(tx);

    const res = await provider.sendTransaction(signed);
    const receipt = await res.wait();

    if (receipt.status === 0)
      throw "Failed";

    alert('Completed');
  }

  async function metamaskClick() {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner(accounts[0])

    const contract = new ethers.Contract("0xaE153f3fa1145b3A59b79F64b648cA4559D82ED2", ERC20Abi, signer);

    const [sym, dec, bal] = await Promise.all(
      [
        contract.symbol(),
        contract.decimals(),
        contract.balanceOf('0xee4bF39FAcFB200D2ED1263Be3cA14f57d8597B3')
      ]);

    console.log(`Token ${sym} balance: ${ethers.utils.formatUnits(bal, dec)}`);

    try {
      const tx = await contract.transfer('0xC9CD020B2C5e3906761A7Ac98cC56A4C6003188D', "1000");
      console.log(`Transaction submitted at ${new Date().toLocaleTimeString()}`);
      const recept = tx.wait()
      console.log(`Transaction completed at ${new Date().toLocaleTimeString()}`);
      if (recept.status === 0)
        throw new Error("Transacton failed");
    }
    catch (err) {
      console.log(`Error handler at ${new Date().toLocaleTimeString()}, err=${err}`);
      if (err.code === ERROR_CODE_TX_REJECTED_BY_USER)
        console.log("Transaction cancelled")
      else
        console.error(err);
    }
  }


  return (
    <div>
      <button onClick={loadBalances}>Load balances and transfer (Alchemy)</button>
      <button onClick={metamaskClick}>Load balance and transfer (Metamask)</button>
    </div >
  );
}

export default App;
