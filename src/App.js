import { React } from 'react'
import './App.css';
import { ethers, Wallet } from "ethers";
import ERC20Abi from './ERC20.json'


function App() {
  async function loadBalances() {
    const provider = new ethers.providers.JsonRpcProvider("https://eth-goerli.g.alchemy.com/v2/[API_KEY]]")
    const signer = new Wallet('[WALLET_PRIVATE_KEY]', provider);

    const contract = new ethers.Contract("0xaE153f3fa1145b3A59b79F64b648cA4559D82ED2", ERC20Abi, signer);

    const [sym, dec, bal] = await Promise.all(
      [
        contract.symbol(),
        contract.decimals(),
        contract.balanceOf('0xee4bF39FAcFB200D2ED1263Be3cA14f57d8597B3')
      ]);

    alert(`Token ${sym} balance: ${ethers.utils.formatUnits(bal, dec)}`);

    const gasLimit = await contract.estimateGas.transfer('0xC9CD020B2C5e3906761A7Ac98cC56A4C6003188D', "10000");
    const gasPrice = await provider.getGasPrice();

    const txCount = await provider.getTransactionCount("0xee4bF39FAcFB200D2ED1263Be3cA14f57d8597B3");
    const tx = await contract.populateTransaction.transfer('0xC9CD020B2C5e3906761A7Ac98cC56A4C6003188D', "10000");
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


  return (
    <div>
      <button onClick={loadBalances}>Load balances and transfer</button>

    </div >
  );
}

export default App;
