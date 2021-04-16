import { useState } from 'react';
import { ethers } from 'ethers';
import Greeter from './artifacts/contracts/Greeter.sol/Greeter.json';
import Token from './artifacts/contracts/Token.sol/Token.json';

const greeterAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
const tokenAddress = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0';

function App() {
  const [greetingValue, setGreetingValue] = useState('');
  const [userAccount, setUserAccount] = useState('');
  const [amount, setAmount] = useState(0);

  const setGreeting = async (e) => {
    e.preventDefault();
    if (!greetingValue.trim()) return;
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      // this instance of the contract will need a signer instead of a provider
      // as the third argument since we are modifying something within the contract
      const contract = new ethers.Contract(greeterAddress, Greeter.abi, signer);
      // call method on contract
      const transaction = await contract.setGreeting(greetingValue);
      setGreetingValue('');
      // wait for transaction to be confirmed on the blockchain
      await transaction.wait();
      fetchGreeting();
    }
  };

  const fetchGreeting = async () => {
    if (typeof window.ethereum !== 'undefined') {
      // Create Provider
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      // Create instance of contract using contract in artifacts folder, address, and provider
      const contract = new ethers.Contract(
        greeterAddress,
        Greeter.abi,
        provider
      );
      try {
        // now we can call methods on the contract were reading from the blockchain
        const data = await contract.greet();
        console.log('data: ', data);
      } catch (error) {
        console.error('error fetching greeting', error);
      }
    }
  };

  const requestAccount = async () => {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
  };

  const fetchCurrentBalance = async () => {
    if (typeof window.ethereum !== 'undefined') {
      const [account] = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      // Create Provider
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      // Create instance of contract using contract in artifacts folder, address, and provider
      const contract = new ethers.Contract(tokenAddress, Token.abi, provider);
      // call methods from contract
      const balance = await contract.balanceOf(account);
      console.log('Balance: ', balance.toString());
    }
  };

  const sendCoins = async (e) => {
    e.preventDefault();
    if (!amount.trim()) return;
    if (typeof window.ethereum !== 'undefined') {
      // make sure we have access to account
      await requestAccount();
      // Create Provider
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      // create signer needed for transaction
      const signer = provider.getSigner();
      // create instance of contract with signer
      const contract = new ethers.Contract(tokenAddress, Token.abi, signer);
      // call transfer method on contract
      const transaction = await contract.transfer(userAccount, amount);
      // wait for transaction to be confirmed on the blockchain
      await transaction.wait();
      console.log(`${amount} coins successfully sent to ${userAccount}`);
      // reset local state
      setUserAccount('');
      setAmount(0);
    }
  };

  return (
    <>
      <form onSubmit={setGreeting}>
        <input
          placeholder="Greeting"
          value={greetingValue}
          onChange={(e) => setGreetingValue(e.target.value)}
        />
        <button type="submit">Update Greeting</button>
      </form>
      <div style={{ marginTop: 25 }}>
        <button onClick={fetchGreeting}>Check Greeting</button>
      </div>

      <br />
      <hr />
      <br />
      <form onSubmit={sendCoins}>
        <input
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <input
          placeholder="Recipient"
          value={userAccount}
          onChange={(e) => setUserAccount(e.target.value)}
        />
        <button disabled={!userAccount || !amount} type="submit">
          Send Coins
        </button>
      </form>
      <div style={{ marginTop: 25 }}>
        <button onClick={fetchCurrentBalance}>Check Balance</button>
      </div>
    </>
  );
}

export default App;
