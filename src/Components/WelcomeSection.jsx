import { useState } from "react";
import Logo from "./Logo";
import mounttechCoin from '../images/mount tech silver.png';
import welcomeBackground from '../images/good health, more $mtt !_20240808_005428_0000.png';


function WelcomeSection({ handleGetStarted }) {
    const [input, setInput] = useState('');
    const [IsLoading, setIsLoading] = useState(false);
  
    const saveInput = (e) => {
      e.preventDefault();
      if (input.trim()) {
        setIsLoading(true)
        handleGetStarted(input);
      }
    };
  
    return (
      <div
        style={{ backgroundImage: `linear-gradient(to top, rgba(4, 0, 31, 0.5) 50%, rgba(4, 0, 31, 0.5) 50%), url(${welcomeBackground})` }}
        className={`bg-slate-950 bg-blend-soft-light h-screen w-full bg-cover xl:bg-center flex justify-center items-center flex-col`}
      >
        <Logo />
        <img className='w-24 fixed top-10 right-3' src={mounttechCoin} alt="coin" />
        <h1 className='text-white uppercase px-3 md:text-2xl'>Let's get started for your reward🥰</h1>
        <div className='mx-4'>
          <input
            className='w-80 my-3 rounded-full px-4 py-2 bg-slate-300 text-sm placeholder:text-stone-950 focus:outline-none focus:ring focus:ring-yellow-400 border-none focus:ring-opacity-50'
            type="text"
            value={input}
            placeholder='Input your telegram username'
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            className='mx-3 uppercase inline-block bg-yellow-400 rounded-full px-4 py-2 hover:bg-yellow-400 transition-colors duration-300 focus:outline-none focus:ring focus:ring-yellow-300 focus:ring-offset-2'
            onClick={saveInput} disabled={IsLoading}
          >
            {IsLoading ? 'Please wait........' : 'Get Started'}
          </button>
        </div>
      </div>
    );
  }
  

export default WelcomeSection