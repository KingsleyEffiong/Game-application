import './index.css';
import logo from './images/logo.png';
import { useState, useEffect } from 'react';
import welcomeBackground from './images/good health, more $mtt !_20240808_005428_0000.png';
import mounttechCoin from './images/mount tech silver.png';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs, query, where, updateDoc, doc } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js';

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
      alert("Error saving user data: ", error);
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
  
          alert(`A user has clicked on your referral link`);
        });
      }
    } catch (error) {
      alert("Error handling referral: ", error);
    }
  };
  
  return (
    <Router>
      {showPopup && <CongratulationsPopup onClose={() => setShowPopup(false)} />}
      <Routes>
        <Route index
          path="/" 
          element={userData ? <Navigate  to="/dashboard" /> : <WelcomeSection handleGetStarted={handleGetStarted} />} 
        />
        <Route index
          path="/dashboard" 
          element={userData ? <Home userData={userData} /> : <Navigate to="/" />} 
        />
      </Routes>
    </Router>
  );
}

function CongratulationsPopup({ onClose }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black z-[100]">
      <div className="bg-slate-950 p-6 rounded shadow-lg text-center">
        <img src={mounttechCoin} alt="Logo" className="mx-auto mb-4 w-32 animate-spinSlow" />
        <h2 className="text-xl font-semibold mb-2 text-white">Congratulations!</h2>
        <p className="mb-4 text-white">Congratulation you have earned 5000 Points <br/> Points can be redeemed for $MTT once a snapshort has been taken of the leaderboard</p>
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

function LeadershipBoard({ userData, onLeadershipClick }) {
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
        console.error("Error fetching leaderboard: ", e);
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
        {leaderboard.slice(0, 100).map((user, index) => (
        <li key={index} className="w-[22rem] bg-yellow-500 my-6 rounded-full flex flex-row justify-between px-5 py-2">
          <span className="text-black">{index + 1}. {user.name}</span>
          <span className="float-right text-black">{user.point} points</span>
        </li>
      ))}
        </ul>
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

function Home({ userData }) {
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
          <Tasks userData={userData} />
        </div>
        {showLeadershipBoard && (
          <div className="w-full mt-20 xl:mx-20 h-auto border-white border-b-2">
            <LeadershipBoard userData={userData} onLeadershipClick={handleLeadershipClick} />
          </div>
        )}
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
      <ButtonBar onFriendsClick={() => setShowFriends(true)} onLeadershipClick={handleLeadershipClick} />
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
            {/* {new Intl.NumberFormat('en-NG').format(userData.point)} points */}
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


function Tasks({ userData }) {
  const handleTaskClick = async (task) => {
    try {
      const userRef = query(collection(db, "users"), where("id", "==", userData.id));
      const querySnapshot = await getDocs(userRef);

      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0]; // Assuming only one document matches the query
        const docRef = doc(db, "users", docSnap.id);
        const userTasks = docSnap.data().completedTasks || [];

        if (userTasks.includes(task)) {
          alert(`You have already completed this task`);
        } else {
          const newPoints = (userData.point || 0) + 500;
          const newTasks = [...userTasks, task];

          await updateDoc(docRef, { 
            point: newPoints,
            completedTasks: newTasks
          });

          alert(`500 points added for completing this task`);
        }
      } else {
        alert('User not found.');
      }
    } catch (error) {
      alert('There is a proble updating your point, pls check your internet connection.');
    }
  };

  return (
    <div className='w-full mt-20 xl:mx-20 h-auto border-white border-b-2'>
      <div className='mx-3'>
        <h3 className='text-white'>Tasks</h3>
        <ul>
          <li>
          <a href="https://x.com/Mounttechsol1?t=bfEdrzQCM6cq2mwq8oF0aw&s=09" target="_blank" rel="noopener noreferrer">
            <button
              className='w-[22rem] bg-yellow-500 my-6 rounded-full flex flex-row justify-between px-5 py-2'
              onClick={() => handleTaskClick('Follow our Twitter account')}
            >
              <h3 className='text-left'>Follow Mount Tech +500</h3>
                <i className="bi bi-twitter"></i>
            </button>
            </a>
          </li>
          <li>
          <a href="https://t.me/mounttechcolutions" target="_blank" rel="noopener noreferrer">
            <button
              className='w-[22rem] bg-yellow-500 my-6 rounded-full flex flex-row justify-between px-5 py-2'
              onClick={() => handleTaskClick('Follow our Telegram announcement page')}
            >
              <h3 className='text-left'>Subscribe to Mount Tech Channel +500</h3>
                <i className="bi bi-telegram"></i>
            </button>
              </a>
          </li>
          <li>
          <a href="https://youtube.com/@mounttechsolutions" target="_blank" rel="noopener noreferrer">
            <button
              className='w-[22rem] bg-yellow-500 my-6 rounded-full flex flex-row justify-between px-5 py-2'
              onClick={() => handleTaskClick('Follow our Youtube page')}
            >
              <h3 className='text-left'>Subscribe to Mount Tech Channel +500</h3>
                <i className="bi bi-youtube"></i>
            </button>
              </a>
          </li>
          <li>
          <a href="https://t.me/+o0-w-_44_rdkYTQ0" target="_blank" rel="noopener noreferrer">
            <button
              className='w-[22rem] bg-yellow-500 my-6 rounded-full flex flex-row justify-between px-5 py-2'
              onClick={() => handleTaskClick('Follow our Telegram community')}
            >
              <h3 className='text-left'>Join Mount Tech Community +500</h3>
                <i className="bi bi-telegram"></i>
            </button>
              </a>
          </li>
          <li>
            <button
              className='w-[22rem] bg-yellow-500 my-6 rounded-full flex flex-row justify-between px-5 py-2'
            >
              <h3>Play to earn +500</h3>
              <i class="bi bi-joystick"></i>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}

function UpdateUserPointDaily({ userData }) {

  return (
    <div className='h-10 flex flex-col justify-center items-center py-24'>
      <img className='w-52 animate-spinSlow' src={mounttechCoin} alt="" /> {/* Replace with your image path */}
      <h2>
      <h3 className="text-yellow-400 text-sm">
            {new Intl.NumberFormat('en-NG').format(userData.point)} Points.
          </h3>
      </h2>
    </div>
  );
}



function Reward({userData}) {
  return (
    <div className='w-full mb-2 xl:mx-20 h-auto'>
      <div className='mx-3'>
        <h3 className='text-white my-6'>Available Rewards</h3>
        <div className='w-80 bg-yellow-500 my-6 rounded-full flex flex-row justify-between px-5 py-2'>
          <h3>{new Intl.NumberFormat('en-NG').format((userData.point).toFixed(1))}</h3>
          <i className="bi bi-trophy"></i>
        </div>
      </div>
    </div>
  );
}

function SubmitWalletAddress({ userData }) {
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
        alert('Wallet address submitted successfully!');
        setWalletAddress('Your wallet has been submitted successfully');
        setIsDisabled(true);
      } else {
        alert('User not found.');
      }
    } catch (error) {
      console.error("Error submitting wallet address: ", error);
      alert('Error submitting wallet address.');
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



function Friends({ referralLink, onClose }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset copied state after 2 seconds
    }).catch((err) => {
      alert('Failed to copy referral link');
    });
  };

  return (
    <div className="fixed w-full h-full bg-slate-950 z-50  top-0 left-0 flex flex-col items-center justify-center">
      <h2 className="text-white uppercase">Invite Friends and get more $MTT POINT</h2>
      <div className="relative">
        <button
          className='w-72 bg-yellow-500 my-6 rounded-full flex flex-row justify-around px-5 py-2'
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

function ButtonBar({ onFriendsClick, onLeadershipClick }) {
  return (
    <div className='fixed bottom-0 w-full h-20 xl:mx-20 bg-slate-950'>
      <div className='flex justify-around items-center'>
        <button className='text-white'>
          <i className="bi bi-house-fill text-2xl"></i>
          <h4>Home</h4>
        </button>
        <button className='text-white' onClick={onLeadershipClick}>
          <i className="bi bi-bar-chart-fill text-2xl"></i>
          <h4>Leadership board</h4>
        </button>
        <button className='text-white' onClick={onFriendsClick}>
          <i className="bi bi-people-fill text-2xl"></i>
          <h4>Friends</h4>
        </button>
      </div>
    </div>
  );
}


export default App;
