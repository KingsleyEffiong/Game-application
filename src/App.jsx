import './index.css';
import { useState, useEffect } from 'react';
import WelcomeSection from './Components/WelcomeSection';
import Navbar from './Components/Navbar';
import CongratulationsPopup from './Components/CongratulationsPopup';
import UpdateUserPointDaily from './Components/UpdateUserPointDaily';
import Friends from './Components/Friends';
import Reward from './Components/Reward';
import ButtonBars from './Components/ButtonBars';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs, query, where, updateDoc, doc } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js';

import { v4 as uuidv4 } from 'https://jspm.dev/uuid';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

const firebaseConfig = {

  apiKey: "AIzaSyDouH-h62GP84wQjZqscMW-9hL3AWbGkCY",
  authDomain: "mount-tech-solutions.firebaseapp.com",
  projectId: "mount-tech-solutions",
  storageBucket: "mount-tech-solutions.appspot.com",
  messagingSenderId: "782166734038",
  appId: "1:782166734038:web:dc9b60e809ecb3564f8577",
  measurementId: "G-H7J103HCNV"

};



// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function App() {
  const [userData, setUserData] = useState(null);
  const [showPopup, SetShowPopup] = useState(false); 
  const [popupMesage, SetpopupMessage] = useState('');

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
              SetShowPopup(false);
              localStorage.setItem('userData', JSON.stringify(updatedUserData));
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
      SetShowPopup(true);
      SetpopupMessage('Congratulation!!!!! You have earned 5000 Points! Points can be redeemed for $MTT once a snapshot has been taken of the leaderboard.')
    } catch (error) {
      SetShowPopup(true);
      SetpopupMessage(`Error saving user data: ", ${error.message}`);
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
        });
      }
    } catch (error) {
      SetShowPopup(true);
      SetpopupMessage(`${error.message}`);
    }
  };

  return (
    <Router>
      {showPopup && <CongratulationsPopup onClose={() => setShowPopup(false)}>
          <p className="mb-4 text-white">
            {popupMesage}
          </p>
        </CongratulationsPopup>}
      <Routes>
        <Route index
          path="/" 
          element={userData ? <Navigate  to="/dashboard" /> : <WelcomeSection handleGetStarted={handleGetStarted} />} 
        />
        <Route index
          path="/dashboard" 
          element={userData ? <Home userData={userData} showPopup={showPopup} popupMesage={popupMesage} SetShowPopup={SetShowPopup} SetpopupMessage={SetpopupMessage} /> : <Navigate to="/" />} 
        />
      </Routes>
    </Router>
  );
}



function LeadershipBoard({ userData, onLeadershipClick, SetShowPopup, SetpopupMessage }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const usersCollection = collection(db, 'users');
        const usersSnapshot = await getDocs(usersCollection);
        const usersList = usersSnapshot.docs.map(doc => doc.data());

        // Sort users by points in descending order and get top 30 users
        const rankedUsers = usersList.sort((a, b) => b.point - a.point);
        setLeaderboard(rankedUsers.slice(0, 30)); // Display top 30 users

        // Find the user's rank
        const userIndex = rankedUsers.findIndex(user => user.id === userData.id);
        setUserRank(userIndex !== -1 ? userIndex + 1 : null); // Rank is 1-based
      } catch (e) {
        SetShowPopup(true);
        SetpopupMessage(`Error fetching leaderboard:, ${e.message}`);
      }
    };

    fetchLeaderboard();
  }, [userData.id]);

  return (
    <div className="fixed w-full h-full bg-slate-950 z-50 top-0 left-0 flex flex-col items-center justify-center">
      <div className='h-[800px] overflow-auto px-6'>
        <div className="text-white mb-8">
          <h2 className="text-white text-2xl mb-4 uppercase text-center">Leadership Board</h2>
          <li className="w-[22rem] bg-yellow-500 my-6 rounded-full flex flex-row justify-between px-5 py-2">
  <span className="text-black">
    {userRank ? `${userRank}` : 'Unranked'}. {userData.name}
  </span>
  <span className="float-right text-black">{userData.point} points</span>
</li>
        </div>
        <div className='flex justify-between items-center w-full'>
          <h5 className="text-white mb-4">Top Chat</h5>
          <button 
            className="mt-6 bg-yellow-400 text-black px-4 py-2 rounded-full hover:bg-yellow-300 transition-colors duration-300"
            onClick={onLeadershipClick}
          >
            Close
          </button>
        </div>
        <ul>
  {(!leaderboard || leaderboard.length === 0) ? (
    <li className='w-[22rem] bg-yellow-500 my-6 rounded-full flex flex-row justify-between px-5 py-2'>No user available</li>
  ) : (
    leaderboard.slice(0, 100).map((user, index) => (
      <li key={index} className="w-[22rem] bg-yellow-500 my-6 rounded-full flex flex-row justify-between px-5 py-2">
        <span className="text-black">{index + 1}. {user.name}</span>
        <span className="float-right text-black">{user.point} points</span>
      </li>
    ))
  )}
</ul>
      </div>
    </div>
  );
}



function Home({ userData, showPopup, SetShowPopup, popupMesage, SetpopupMessage }) {
  const [showFriends, setShowFriends] = useState(false);
  const [showLeadershipBoard, setShowLeadershipBoard] = useState(false);

  const handleLeadershipClick = () => {
    setShowLeadershipBoard(!showLeadershipBoard);
  };

  return (
    <>
      <Navbar userData={userData} />
      <div className="flex flex-col items-center">
        <div className="w-full mt-20 xl:mx-20 h-auto border-white border-b-2">
        <UpdateUserPointDaily userData={userData}/>
          <Tasks userData={userData} showPopup={showPopup} popupMesage={popupMesage} SetShowPopup={SetShowPopup} SetpopupMessage={SetpopupMessage}/>
        </div>
        {showLeadershipBoard && (
          <div className="w-full mt-20 xl:mx-20 h-auto border-white border-b-2">
            <LeadershipBoard userData={userData} onLeadershipClick={handleLeadershipClick} SetShowPopup={SetShowPopup} SetpopupMessage={SetpopupMessage} />
          </div>
        )}
        <div className="w-full mb-2 xl:mx-20 h-auto">
          <Reward userData={userData} />
        </div>
        <SubmitWalletAddress userData={userData} SetShowPopup={SetShowPopup} SetpopupMessage={SetpopupMessage} />
        <Overlay />
        {showFriends && (
          <Friends
            referralLink={userData.referralLink}
            onClose={() => setShowFriends(false)}
          />
        )}
      </div>
      <ButtonBars onFriendsClick={() => setShowFriends(true)} onLeadershipClick={handleLeadershipClick} />
    </>
  );
}

function HomeSection({children}) {
  return (
    <div className=''>
      {children}
    </div>
  );
}


function Tasks({ userData, showPopup, SetShowPopup, popupMesage, SetpopupMessage }) {
  const handleTaskClick = async (task) => {
    try {
      const userRef = query(collection(db, "users"), where("id", "==", userData.id));
      const querySnapshot = await getDocs(userRef);

      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0]; // Assuming only one document matches the query
        const docRef = doc(db, "users", docSnap.id);
        const userTasks = docSnap.data().completedTasks || [];

        if (userTasks.includes(task)) {
          SetShowPopup(true);
          SetpopupMessage(`You have already completed this task`);
        } else {
          const newPoints = (userData.point || 0) + 500;
          const newTasks = [...userTasks, task];
          SetShowPopup(true);
          SetpopupMessage(`Point won't be added until you complete this task: and if you have done so, wait for your point to be updated within a few minute`);
          setTimeout(async function(){
            await updateDoc(docRef, { 
              point: newPoints,
              completedTasks: newTasks
            });
            SetShowPopup(true);
            SetpopupMessage(`500 points added for completing this task: ${task}`);
          },30000);
        }
      } else {
        SetShowPopup(true);
        SetpopupMessage(`User not found.`);
      }
    } catch (error) {
      SetShowPopup(true);
      SetpopupMessage(`There is a problem updating your point, pls check your internet connection.'`);
    }
  };

  return (
    <>
     {showPopup && <CongratulationsPopup onClose={() => SetShowPopup(false)}>
          <p className="mb-4 text-white">
            {popupMesage}
          </p>
        </CongratulationsPopup>}
    <div className='w-full mt-20 xl:mx-20 h-auto border-white border-b-2'>
      <div className='mx-3'>
        <h3 className='text-white'>Tasks</h3>
        <ul>
          <li>
          <a href="https://x.com/Mounttechsol1?t=bfEdrzQCM6cq2mwq8oF0aw&s=09" target="_blank" rel="noopener noreferrer">
            <button
              className='w-auto h-14 bg-yellow-500 my-6 rounded-full flex flex-row justify-between items-center px-5 py-2'
              onClick={() => handleTaskClick('Follow our Twitter account')}
            >
              <h3 className='text-left w-72 leading-tight'>Follow Mount Tech +500</h3>
                <i className="bi bi-twitter"></i>
            </button>
            </a>
          </li>
          <li>
          <a href="https://t.me/mounttechcolutions" target="_blank" rel="noopener noreferrer">
            <button
              className='w-auto h-14 bg-yellow-500 my-6 rounded-full flex flex-row justify-between items-center px-5 py-2'
              onClick={() => handleTaskClick('Follow our Telegram announcement page')}
            >
              <h3 className='text-left  w-72 leading-tight'>Subscribe to Mount Tech Channel +500</h3>
                <i className="bi bi-telegram"></i>
            </button>
              </a>
          </li>
          <li>
          <a href="https://youtube.com/@mounttechsolutions" target="_blank" rel="noopener noreferrer">
            <button
              className='w-auto h-14 bg-yellow-500 my-6 rounded-full flex flex-row justify-between items-center px-5 py-2'
              onClick={() => handleTaskClick('Follow our Youtube page')}
            > 
              <h3 className='text-left w-72 leading-tight'>Subscribe to Mount Tech Channel +500</h3>
                <i className="bi bi-youtube"></i>
            </button>
              </a>
          </li>
          <li>
          <a href="https://t.me/+o0-w-_44_rdkYTQ0" target="_blank" rel="noopener noreferrer">
            <button
              className='w-auto h-14 bg-yellow-500 my-6 rounded-full flex flex-row justify-between items-center px-5 py-2'
              onClick={() => handleTaskClick('Follow our Telegram community')}
            >
              <h3 className='text-left  w-72 leading-tight'>Join Mount Tech Community +500</h3>
                <i className="bi bi-telegram"></i>
            </button>
              </a>
          </li>
          <li>
            <button
              className='w-auto h-14 bg-yellow-500 my-6 rounded-full flex flex-row justify-between items-center px-5 py-2'
            >
              <h3 className='text-left  w-72 leading-tight'>Play to earn +500</h3>
              <i className="bi bi-joystick"></i>
            </button>
          </li>
        </ul>
      </div>
    </div>
    </>
    
  );
}







function SubmitWalletAddress({ userData, SetShowPopup, SetpopupMessage }) {
  const [walletAddress, setWalletAddress] = useState('');
  const [IsDisable, setIsDisabled] = useState(false);
  const [IsLoading, setIsLoading] = useState(false);
  const handleSubmit = async () => {
    if (walletAddress.trim() === '') {
      alert('Please enter a wallet address.');
      return;
    }
    setIsLoading(true);
    try {
      // Use the document ID as the reference for updating the user
      const userRef = query(collection(db, "users"), where("id", "==", userData.id));
      const querySnapshot = await getDocs(userRef);

      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0]; // Assuming only one document matches the query
        const docRef = doc(db, "users", docSnap.id);

        await updateDoc(docRef, { walletAddress: walletAddress });
        SetShowPopup(true);
        SetpopupMessage(`Wallet address submitted successfully!`);
        setWalletAddress('Your wallet has been submitted successfully');
        setIsDisabled(true);
      } else {
        SetShowPopup(true);
        SetpopupMessage(`User not found.`);
      }
    } catch (error) {
      console.error("Error submitting wallet address: ", error);
      SetShowPopup(true);
      SetpopupMessage(`Error submitting wallet address.`);
    }finally{
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full mb-2 md:mx-20 h-auto">
      <div className="w-full mb-2 xl:mx-20 h-auto mx-3">
        <h3 className="text-white">Submit your wallet address</h3>
        <input
          className='w-56  md:w-80 my-3 rounded-full px-4 py-2 bg-slate-300 text-sm placeholder:text-stone-950 focus:outline-none focus:ring focus:ring-yellow-400 border-none focus:ring-opacity-50'
          type="text"
          placeholder='BSC (Bep 20) wallet address'
          value={walletAddress}
          disabled ={IsDisable}
          onChange={(e) => setWalletAddress(e.target.value)}
        />
        <button
        className='mx-3 uppercase inline-block bg-yellow-400 rounded-full px-4 py-2 hover:bg-yellow-400 transition-colors duration-300 focus:outline-none focus:ring focus:ring-yellow-300 focus:ring-offset-2'
        onClick={handleSubmit}
        disabled={IsDisable || IsLoading}
      >
        {IsLoading ? 'Please wait.........' : 'Submit'}
      </button>
      </div>
    </div>
  );
}


function Overlay() {
  return (
    <div className='w-full h-56 xl:mx-20 my-6 flex items-center justify-center'>
    </div>
  );
}


export default App;
