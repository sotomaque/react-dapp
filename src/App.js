import { useState } from 'react';
import { ethers } from 'ethers';
import Greeter from './artifacts/contracts/Greeter.sol/Greeter.json';

const greeterAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
console.log(``);
console.log('process.env', process.env);

function App() {
  const [greetingValue, setGreetingValue] = useState('');

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
    </>
  );
}

export default App;
