import './index.css';
import logo from './images/logo.png';
import { useState, useEffect } from 'react';
import welcomeBackground from './images/good health, more $mtt !_20240808_005428_0000.png';
import mounttechCoin from './images/mount tech silver.png';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs, query, where, updateDoc, doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js';

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
  const [showPopup, setShowPopup] = useState(false); 

  useEffect(() => {
    // Load userData from localStorage on initial render
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }

    // Check for referral link
    const searchParams = new URLSearchParams(window.location.search);
    const refId = searchParams.get('ref');
    if (refId) {
      handleReferral(refId);
    }
  }, []);

  useEffect(() => {
    // Update localStorage whenever userData changes
    if (userData) {
      localStorage.setItem('userData', JSON.stringify(userData));
    }
  }, [userData]);

  useEffect(() => {
    // Poll the database every 5 seconds to check for updates
    const pollDatabase = setInterval(async () => {
      if (userData) {
        const userRef = query(collection(db, "users"), where("id", "==", userData.id));
        const querySnapshot = await getDocs(userRef);
        if (!querySnapshot.empty) {
          querySnapshot.forEach(docSnap => {
            const updatedUserData = docSnap.data();
            if (updatedUserData.point !== userData.point) {
              // Update state and localStorage with new data
              setUserData(updatedUserData);
              setShowPopup(false);
              localStorage.setItem('userData', JSON.stringify(updatedUserData));
              console.log("User data updated from polling");
            }
          });
        }
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(pollDatabase); // Cleanup the interval on unmount
  }, [userData]);

  const handleGetStarted = async (name) => {
    const uniqueId = `mt${uuidv4().slice(0, 10)}`;
    const point = 5000;
    const referralLink = `${window.location.origin}?ref=${uniqueId}`;

    try {
      const newUser = {
        id: uniqueId,
        name: name,
        point: point,
        referralLink: referralLink,
        timestamp: new Date()
      };
      await addDoc(collection(db, "users"), newUser);
      setUserData(newUser);
      setShowPopup(true);
    } catch (error) {
      console.error("Error saving user data: ", error);
    }
  };

  const handleReferral = async (refId) => {
    try {
      const storedUserData = localStorage.getItem('userData');
      if (storedUserData) {
        const currentUserData = JSON.parse(storedUserData);
        
        // Prevent adding points if the referral ID matches the current user's ID
        if (currentUserData.id === refId) {
          console.log("Referral link belongs to the current user. Points not added.");
          return;
        }
      }
  
      const q = query(collection(db, "users"), where("id", "==", refId));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        querySnapshot.forEach(async (docSnap) => {
          const userRef = doc(db, "users", docSnap.id);
          const newPoints = docSnap.data().point + 1000;
  
          // Update points in the database
          await updateDoc(userRef, { point: newPoints });
  
          // Update the referrer's localStorage with the new points
          const updatedUserData = {
            ...docSnap.data(),
            point: newPoints,
          };
  
          localStorage.setItem('userData', JSON.stringify(updatedUserData));
          window.localStorage.setItem('userDataUpdated', Date.now().toString());
  
          console.log(`Added 10 points to user with ID: ${refId}`);
        });
      }
    } catch (error) {
      console.error("Error handling referral: ", error);
    }
  };
  
  return (
    <Router>
      {showPopup && <CongratulationsPopup onClose={() => setShowPopup(false)} />}
      <Routes>
        <Route 
          path="/" 
          element={userData ? <Navigate to="/dashboard" /> : <WelcomeSection handleGetStarted={handleGetStarted} />} 
        />
        <Route 
          path="/dashboard" 
          element={userData ? <Home userData={userData} /> : <Navigate to="/" />} 
        />
      </Routes>
    </Router>
  );
}

function CongratulationsPopup({ onClose }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[100]">
      <div className="bg-slate-950 p-6 rounded shadow-lg text-center">
        <img src={logo} alt="Logo" className="mx-auto mb-4 w-32 animate-bounce" />
        <h2 className="text-xl font-semibold mb-2 text-white">Congratulations!</h2>
        <p className="mb-4 text-white">You just earned 5000 points.</p>
        <button 
          className="px-4 py-2 bg-yellow-400 text-white rounded hover:bg-yellow-500"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
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
          onClick={saveInput}
        >
          Get started
        </button>
      </div>
    </div>
  );
}

function Home({ userData }) {
  const [showFriends, setShowFriends] = useState(false);

  return (
    <>
      <Navbar userData={userData} />
      <div className="flex flex-col items-center">
        <div className="w-full mt-20 xl:mx-20 h-auto border-white border-b-2">
          <Tasks userData={userData}/>
        </div>
        <div className="w-full mb-2 xl:mx-20 h-auto">
          <Reward userData={userData} />
        </div>
        <SubmitWalletAddress userData={userData} />
        <Overlay />
        {showFriends && (
          <Friends 
            referralLink={userData.referralLink}
            onClose={() => setShowFriends(false)}
          />
        )}
      </div>
      <ButtonBar onFriendsClick={() => setShowFriends(true)} />
    </>
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
          <h3 className="text-yellow-400 text-sm">
            {new Intl.NumberFormat('en-NG').format(userData.point)} points
          </h3>
        </div>
      </div>
    </div>
  );
}


function HomeSection({children}) {
  return (
    <div className=''>
      {children}
    </div>
  );
}


function Tasks({ userData, setUserData }) {
  const handleTaskClick = async (taskName, taskUrl) => {
    if (!userData) return;

    try {
      const userRef = doc(db, "users", userData.id);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const completedTasks = userData.completedTasks || {};

        if (completedTasks[taskName]) {
          alert('You have already completed this task.');
          return;
        }

        const updatedPoints = userData.point + 500;
        const updatedCompletedTasks = {
          ...completedTasks,
          [taskName]: true
        };

        await updateDoc(userRef, {
          point: updatedPoints,
          completedTasks: updatedCompletedTasks
        });

        setUserData({ ...userData, point: updatedPoints, completedTasks: updatedCompletedTasks });
        localStorage.setItem('userData', JSON.stringify({ ...userData, point: updatedPoints, completedTasks: updatedCompletedTasks }));
        alert('Points added successfully!');
      }
    } catch (error) {
      console.error("Error updating points: ", error);
      alert('Error updating points.');
    }
  };

  return (
    <div className='w-full mt-20 xl:mx-20 h-auto border-white border-b-2'>
      <div className='mx-3'>
        <h3 className='text-white'>Tasks (500 points each)</h3>
        <ul>
          <li>
            <button 
              className='w-[22rem] bg-yellow-500 my-6 rounded-full flex flex-row justify-around px-5 py-2'
              onClick={() => handleTaskClick('Follow our Twitter account', 'https://x.com/Mounttechsol1?t=bfEdrzQCM6cq2mwq8oF0aw&s=09')}
            >
              <h3>Follow our Twitter account</h3>
              <a href="https://x.com/Mounttechsol1?t=bfEdrzQCM6cq2mwq8oF0aw&s=09" target="_blank" rel="noopener noreferrer">
                <i className="bi bi-twitter"></i>
              </a>
            </button>
          </li>
          <li>
            <button 
              className='w-[22rem] bg-yellow-500 my-6 rounded-full flex flex-row justify-around px-5 py-2'
              onClick={() => handleTaskClick('Follow our Telegram announcement page', 'https://t.me/mounttechcolutions')}
            >
              <h3>Follow our Telegram announcement page</h3>
              <a href="https://t.me/mounttechcolutions" target="_blank" rel="noopener noreferrer">
                <i className="bi bi-telegram"></i>
              </a>
            </button>
          </li>
          <li>
            <button 
              className='w-[22rem] bg-yellow-500 my-6 rounded-full flex flex-row justify-around px-5 py-2'
              onClick={() => handleTaskClick('Follow our Telegram community', 'https://t.me/+o0-w-_44_rdkYTQ0')}
            >
              <h3>Follow our Telegram community</h3>
              <a href="https://t.me/+o0-w-_44_rdkYTQ0" target="_blank" rel="noopener noreferrer">
                <i className="bi bi-telegram"></i>
              </a>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}


function Reward({userData}) {
  return (
    <div className='w-full mb-2 xl:mx-20 h-auto'>
      <div className='mx-3'>
        <h3 className='text-white my-6'>Available Rewards</h3>
        <div className='w-80 bg-yellow-500 my-6 rounded-full flex flex-row justify-around px-5 py-2'>
          <h3>{new Intl.NumberFormat('en-NG').format((userData.point).toFixed(1))}</h3>
          <i className="bi bi-trophy"></i>
        </div>
      </div>
    </div>
  );
}

function SubmitWalletAddress({ userData }) {
  const [walletAddress, setWalletAddress] = useState('');

  const handleSubmit = async () => {
    if (walletAddress.trim() === '') {
      alert('Please enter a wallet address.');
      return;
    }

    try {
      // Use the document ID as the reference for updating the user
      const userRef = query(collection(db, "users"), where("id", "==", userData.id));
      const querySnapshot = await getDocs(userRef);

      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0]; // Assuming only one document matches the query
        const docRef = doc(db, "users", docSnap.id);

        await updateDoc(docRef, { walletAddress: walletAddress });
        alert('Wallet address submitted successfully!');
      } else {
        alert('User not found.');
      }
    } catch (error) {
      console.error("Error submitting wallet address: ", error);
      alert('Error submitting wallet address.');
    }
  };

  return (
    <div className="w-full mb-2 xl:mx-20 h-auto ">
      <div className="mx-3">
        <h3 className="text-white">Submit your wallet address for airdrop🥰</h3>
        <input
          className='w-80 my-3 rounded-full px-4 py-2 bg-slate-300 text-sm placeholder:text-stone-950 focus:outline-none focus:ring focus:ring-yellow-400 border-none focus:ring-opacity-50'
          type="text"
          placeholder='wallet address'
          value={walletAddress}
          onChange={(e) => setWalletAddress(e.target.value)}
        />
        <button
          className='mx-3 uppercase inline-block bg-yellow-400 rounded-full px-4 py-2 hover:bg-yellow-400 transition-colors duration-300 focus:outline-none focus:ring focus:ring-yellow-300 focus:ring-offset-2'
          onClick={handleSubmit}
        >
          Submit
        </button>
      </div>
    </div>
  );
}



function Friends({ referralLink, onClose }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset copied state after 2 seconds
    }).catch((err) => {
      console.error('Failed to copy referral link:', err);
    });
  };

  return (
    <div className="fixed w-full h-full bg-slate-950 z-50 opacity-90 top-0 left-0 flex flex-col items-center justify-center">
      <h2 className="text-white">Share this link with your friends:</h2>
      <div className="relative">
        <button
          className='w-96 bg-yellow-500 my-6 rounded-full flex flex-row justify-around px-5 py-2'
          onClick={copyToClipboard}
        >
          {copied ? "Link copied!" : "Copy Link"}
        </button>
      </div>
      <button 
        className="mt-6 bg-yellow-400 text-black px-4 py-2 rounded-full hover:bg-yellow-300 transition-colors duration-300"
        onClick={onClose}
      >
        Close
      </button>
    </div>
  );
}



function Overlay() {
  return (
    <div className='w-full h-56 xl:mx-20 my-6 flex items-center justify-center'>
    </div>
  );
}

function ButtonBar({ onFriendsClick }) {
  return (
    <div className='fixed bottom-0 w-full h-20 xl:mx-20 bg-slate-950'>
      <div className='flex justify-around items-center'>
        <button className='text-white'><i className="bi bi-house-fill text-2xl"></i></button>
        <button className='text-white'><i className="bi bi-bar-chart-fill text-2xl"></i></button>
        <button className='text-white' onClick={onFriendsClick}><i className="bi bi-people-fill text-2xl"></i></button>
      </div>
    </div>
  );
}

export default App;
