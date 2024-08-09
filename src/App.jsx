import './index.css';
import logo from './images/logo.png';
import { useState, useEffect } from 'react';
import welcomeBackground from './images/good health, more $mtt !_20240808_005428_0000.png';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js';
import { getFirestore, collection, addDoc } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js';
import { v4 as uuidv4 } from 'https://jspm.dev/uuid';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

const firebaseConfig = {
  apiKey: "AIzaSyBzaz4dSfndXEVbA7KVok43cx1jUltglDE",
  authDomain: "mounttech-4bd7e.firebaseapp.com",
  projectId: "mounttech-4bd7e",
  storageBucket: "mounttech-4bd7e.appspot.com",
  messagingSenderId: "936990456790",
  appId: "1:936990456790:web:9bffc733845b681a20c277",
  measurementId: "G-1DKLMNX3QT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function App() {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
  }, []);

  const handleGetStarted = async (name) => {
    const uniqueId = `mt${uuidv4().slice(0,10)}`;
    const point = 12000;
    try {
      await addDoc(collection(db, "users"), {
        id: uniqueId,
        name: name,
        point: point,
        timestamp: new Date()
      });
      const userData = { id: uniqueId, name, point: point };
      localStorage.setItem('userData', JSON.stringify(userData));
      setUserData(userData);
      setTimeout(() => {
        <customModal>
        <h3>You have been given {userData.point} 🥰</h3>
      </customModal>
      },3000)
    } catch (error) {
      console.error("Error saving user data: ", error);
    }
  };

  return (
    <Router>
      <Navbar userData={userData} />
      <Routes>
        <Route path="/" element={userData ? <Navigate to="/dashboard" /> : <WelcomeSection handleGetStarted={handleGetStarted} />} />
        <Route path="/dashboard" element={userData ? <Home userData={userData} /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

function Navbar({ userData }) {
  return (
    <div className="w-[100%] h-32 flex flex-row justify-between items-center">
      <Logo />
      {userData ? <Profile userData={userData} /> : null}
    </div>
  );
}

function Logo() {
  return <img className='w-32 py-4 px-3' src={logo} alt="Mountech Logo" />;
}

function WelcomeSection({ handleGetStarted }) {
  const [input, setInput] = useState('');

  const saveInput = (e) => {
    e.preventDefault();
    if (input.trim()) {
      handleGetStarted(input);
    }
  };

  function customModal({children}){
    return <div className='w-40 h-20 bg-yellow-500 fixed right-1 top-0'>
        {children}
    </div>
  }

  return (
    <div
      style={{ backgroundImage: `linear-gradient(to top, rgba(4, 0, 31, 0.5) 50%, rgba(4, 0, 31, 0.5) 50%), url(${welcomeBackground})` }}
      className={`bg-slate-950 bg-blend-soft-light h-screen w-full bg-cover xl:bg-center flex justify-center items-center flex-col`}
    >
      <h1 className='text-white uppercase px-3 md:text-2xl'>Let's get started for your reward🥰</h1>
      <div className='mx-4'>
        <input
          className='w-96 my-3 rounded-full px-4 py-2 bg-slate-300 text-sm placeholder:text-stone-950 focus:outline-none focus:ring focus:ring-yellow-400 border-none focus:ring-opacity-50'
          type="text"
          value={input}
          placeholder='Input your name'
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          className='mx-3 uppercase inline-block bg-yellow-400 rounded-full px-4 py-2 hover:bg-yellow-400 transition-colors duration-300 focus:outline-none focus:ring focus:ring-yellow-300 focus:ring-offset-2'
          onClick={saveInput}
        >
          Get started
        </button>
      </div>
    </div>
  );
}

function Home({ userData }) {
  return (
    <div className="container w-96">
      <HomeSection>
      <Tasks />
      <Reward userData={userData} />
      </HomeSection>
      <ButtonBar />
    </div>
  );
}

function Profile({ userData }) {
  return (
    <div className="py-4 px-3">
      <div className="flex px-3 items-center">
        <i className="bi bi-person-circle text-yellow-400 text-normal mx-1"></i>
        <div className="flex flex-col mx-3">
          <h3 className="text-yellow-400 text-sm">{userData.name.toLowerCase()}</h3>
          <h3 className="text-yellow-400 text-sm">{userData.id.toLowerCase()}</h3>
          <h3 className="text-yellow-400 text-sm">{new Intl.NumberFormat('en-NG').format((userData.point).toFixed(1))} points</h3>
        </div>
      </div>
    </div>
  );
}

function HomeSection({children}) {
  return (
    <div className='xl:h-[600px] w-full overflow-auto'>
      {children}
    </div>
  );
}

function Tasks() {
  return (
    <div className='w-full mt-40 h-auto'>
      <div className='mx-3'>
        <h3 className='text-white'>Tasks</h3>
        <ul>
          <li>
            <button className='w-80 bg-yellow-500 my-6 rounded-full flex flex-row justify-around px-5 py-2'>
              <h3>Follow us</h3>
              <a href=""><i className="bi bi-twitter"></i></a>
            </button>
          </li>
          <li>
            <button className='w-80 bg-yellow-500 my-6 rounded-full flex flex-row justify-around px-5 py-2'>
              <h3>Follow us</h3>
              <a href=""><i className="bi bi-telegram"></i></a>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}

function Reward({userData}) {
  return (
    <div className='w-full mb-20 h-auto'>
      <div className='mx-3'>
        <h3 className='text-white'>Reward</h3>
        <ul>
          <li>
            <button className='w-80 bg-yellow-500 my-6 rounded-full flex flex-row justify-around px-5 py-2'>
              <h3>Your total earning is {userData.point} points</h3>
            </button>
          </li>
        </ul>
        <div className='mx-4'>
          <input className='md:w-64 my-3 rounded-full px-4 py-2 bg-white text-sm placeholder:text-stone-950 focus:outline-none focus:ring focus:ring-yellow-400 border-none focus:ring-opacity-50' type="text" placeholder='input your wallet address' />
          <button className='mx-3 uppercase inline-block bg-yellow-400 rounded-full px-4 py-2 hover:bg-yellow-400 transition-colors duration-300 focus:outline-none focus:ring focus:ring-yellow-300 focus:ring-offset-2'>Send</button>
        </div>
      </div>
    </div>
  );
}

function ButtonBar() {
  return (
    <div className='fixed bottom-0 w-full mx-auto left-0 h-14 bg-yellow-600 grid'>
      <ul className='flex flex-row justify-around items-center'>
        <li><i className="bi bi-house text-white text-3xl cursor-pointer hover:text-yellow-400 transition-colors duration-300"></i></li>
        <li><i className="bi bi-bar-chart text-white text-3xl cursor-pointer hover:text-yellow-400 transition-colors duration-300"></i></li>
        <li><i className="bi bi-people-fill text-white text-3xl cursor-pointer hover:text-yellow-400 transition-colors duration-300"></i></li>
      </ul>
    </div>
  );
}

export default App;
