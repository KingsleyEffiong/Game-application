import './index.css';
import { useState, useEffect } from 'react';
import Gold from './images/leadership_1-removebg-preview.png';
import Silver from './images/silver_leadership-removebg-preview.png';
import Bronze from './images/bronze_leadership-removebg-preview.png';
import WelcomeSection from './Components/WelcomeSection';
import Navbar from './Components/Navbar';
import CongratulationsPopup from './Components/CongratulationsPopup';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import mounttechCoin from './images/mount tech silver.png';
import UpdateUserPointDaily from './Components/UpdateUserPointDaily';
import Friends from './Components/Friends';
import Logo from './Components/Logo';
import Reward from './Components/Reward';
import ButtonBars from './Components/ButtonBars';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs, query, where, updateDoc, doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js';
import { CryptoQuestions } from './Questions';
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
  const [showQuestion, setShowQuestion] = useState(false);


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
          element={userData ? <Home userData={userData} setUserData={setUserData} showPopup={showPopup} popupMesage={popupMesage} SetShowPopup={SetShowPopup} SetpopupMessage={SetpopupMessage} setShowQuestion={setShowQuestion} /> : <Navigate to="/" />} 
        />
      </Routes>
    </Router>
  );
}

function LeadershipBoard({ userData, onLeadershipClick, SetShowPopup, SetpopupMessage }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, SetLoading] = useState(true);
  const [userRank, setUserRank] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const usersCollection = collection(db, 'users');
        const usersSnapshot = await getDocs(usersCollection);
        const usersList = usersSnapshot.docs.map(doc => doc.data());

        // Sort users by points in descending order and get top 30 users
        const rankedUsers = usersList.sort((a, b) => b.point - a.point);
        setLeaderboard(rankedUsers.slice(0, 500)); // Display top 500 users

        // Find the user's rank
        const userIndex = rankedUsers.findIndex(user => user.id === userData.id);
        setUserRank(userIndex !== -1 ? userIndex + 1 : null); // Rank is 1-based
      } catch (e) {
        SetShowPopup(true);
        SetpopupMessage(`Error fetching leaderboard: ${e.message}`);
      } finally {
        SetLoading(false); // Set loading to false once data is fetched or in case of an error
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
          {loading ? (
            <li className='w-[22rem] bg-yellow-500 my-6 rounded-full flex flex-row justify-between px-5 py-2'>
              Loading users...
            </li>
          ) : leaderboard.length === 0 ? (
            <li className='w-[22rem] bg-yellow-500 my-6 rounded-full flex flex-row justify-between px-5 py-2'>
              No user available
            </li>
          ) : (
            leaderboard.slice(0, 20000).map((user, index) => (
              <li key={index} className="w-[22rem] bg-yellow-500 my-6 rounded-full flex flex-row justify-between items-center px-5 py-2">
                <span className="text-black">
                  {index + 1}. {user.name} 
                  </span>
                  <div className="flex flex-row justify-center items-center">

                <span className="float-right text-black">{user.point} points</span>
                  {index + 1 === 1 && <img src={Gold} className='w-8' alt="gold"/>}
                  {index + 1 === 2 && <img src={Silver} className='w-8' alt="silver" />}
                  {index + 1 === 3 && <img src={Bronze} className='w-8' alt='bronze'/>}
                  </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}


function Home({ userData, showPopup, SetShowPopup, popupMesage, SetpopupMessage, setUserData }) {
  const [showFriends, setShowFriends] = useState(false);
  const [showLeadershipBoard, setShowLeadershipBoard] = useState(false);
  const [showQuestion, setShowQuestion] = useState(false); // State for GameQuiz visibility
  const [showDailyPoint, setShowDailyPoint] = useState(false)

  const handleLeadershipClick = () => {
    setShowLeadershipBoard(!showLeadershipBoard);
  };

  return (
    <>
      <Navbar userData={userData} />
      <GameQuiz userData={userData} setUserData={setUserData} showQuestion={showQuestion} setShowQuestion={setShowQuestion} />
      <div className="flex flex-col items-center">
        <div className="w-fsetShowDailyPointull mt-20 xl:mx-20 h-auto border-white border-b-2">
          <UpdateUserPointDaily userData={userData} />
          <Tasks
            userData={userData}
            showPopup={showPopup}
            popupMesage={popupMesage}
            SetShowPopup={SetShowPopup}
            SetpopupMessage={SetpopupMessage}
            setShowQuestion={setShowQuestion} // Pass setShowQuestion to Tasks
            showQuestion={showQuestion}
          />
        </div>
        {showLeadershipBoard && (
          <div className="w-full mt-20 xl:mx-20 h-auto border-white border-b-2">
            <LeadershipBoard
              userData={userData}
              onLeadershipClick={handleLeadershipClick}
              SetShowPopup={SetShowPopup}
              SetpopupMessage={SetpopupMessage}
            />
          </div>
        )}
        <div className="w-full mb-2 xl:mx-20 h-auto">
          <Reward userData={userData} />
        </div>
        <SubmitWalletAddress userData={userData} SetShowPopup={SetShowPopup} SetpopupMessage={SetpopupMessage} />
        <DailyTask  showDailyPoint={showDailyPoint} userData={userData} setShowDailyPoint={setShowDailyPoint}/>
        <Overlay />
        {showFriends && (
          <Friends
            referralLink={userData.referralLink}
            onClose={() => setShowFriends(false)}
          />
        )}
      </div>
      <ButtonBars onFriendsClick={() => setShowFriends(true)} onLeadershipClick={handleLeadershipClick} setShowQuestion={setShowQuestion}  setShowDailyPoint={setShowDailyPoint}/>
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
  const [tick, setTick] = useState({}); // Tracks completed tasks
  const [isWaiting, setIsWaiting] = useState(false); // Tracks waiting state for tasks

  useEffect(() => {
    async function fetchCompletedTasks() {
      try {
        const userRef = query(collection(db, "users"), where("id", "==", userData.id));
        const querySnapshot = await getDocs(userRef);

        if (!querySnapshot.empty) {
          const docSnap = querySnapshot.docs[0];
          const userTasks = docSnap.data().completedTasks || [];

          // Set the tick status for each completed task
          const updatedTick = {};
          userTasks.forEach(task => {
            updatedTick[task] = true;
          });
          setTick(updatedTick);
        }
      } catch (error) {
        console.error("Error fetching completed tasks:", error);
      }
    }

    fetchCompletedTasks();
  }, [userData]);

  const handleTaskClick = async (task) => {
    try {
      const userRef = query(collection(db, "users"), where("id", "==", userData.id));
      const querySnapshot = await getDocs(userRef);

      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
        const docRef = doc(db, "users", docSnap.id);
        const userTasks = docSnap.data().completedTasks || [];

        if (userTasks.includes(task)) {
          SetShowPopup(true);
          SetpopupMessage(`You have already completed this task`);
          setTick(prevTick => ({ ...prevTick, [task]: true })); // Mark task as completed
        } else {
          if (task.includes("Telegram")) {
            // Immediate addition for Telegram tasks
            const newPoints = (userData.point || 0) + 500;
            const newTasks = [...userTasks, task];
            await updateDoc(docRef, {
              point: newPoints,
              completedTasks: newTasks
            });
            setTick(prevTick => ({ ...prevTick, [task]: true })); // Mark task as completed
            SetShowPopup(true);
            SetpopupMessage(`500 points added for completing this task: ${task}`);
          } else {
            // Delay for other tasks
            setIsWaiting(true);
            SetShowPopup(true);
            SetpopupMessage(`Please complete the task. Your points will be added after 30 minutes if you have completed the task.`);

            setTimeout(async function () {
              const newPoints = (userData.point || 0) + 500;
              const newTasks = [...userTasks, task];
              await updateDoc(docRef, {
                point: newPoints,
                completedTasks: newTasks
              });
              setTick(prevTick => ({ ...prevTick, [task]: true })); // Mark task as completed
              SetShowPopup(true);
              SetpopupMessage(`500 points added for completing this task: ${task}`);
              setIsWaiting(false);
            }, 1800000); // 30 minutes in milliseconds
          }
        }
      } else {
        SetShowPopup(true);
        SetpopupMessage(`User not found.`);
      }
    } catch (error) {
      SetShowPopup(true);
      SetpopupMessage(`There is a problem updating your point, please check your internet connection.`);
    }
  };

  return (
    <>
      {showPopup && (
        <CongratulationsPopup onClose={() => SetShowPopup(false)}>
          <p className="mb-4 text-white">
            {popupMesage}
          </p>
        </CongratulationsPopup>
      )}
      <div className='w-full mt-20 xl:mx-20 h-auto border-white border-b-2'>
        <div className='mx-3'>
          <h3 className='text-white'>Tasks</h3>
          <ul>
            <li>
              <a href="https://x.com/Mounttechsol1?t=bfEdrzQCM6cq2mwq8oF0aw&s=09" target="_blank" rel="noopener noreferrer">
                <button
                  className='w-auto h-14 bg-yellow-500 my-6 rounded-full flex flex-row space-x-4 items-center px-3 py-2 hover:bg-yellow-800 hover:text-white transition-colors duration-500 focus:outline-none focus:ring focus:ring-yellow-300 focus:ring-offset-2'
                  onClick={() => handleTaskClick('Follow our Twitter account')}
                >
                  <h3 className='text-left w-64 leading-tight'>Follow Mount Tech +500</h3>
                  <i className="bi bi-twitter"></i>
                  {tick['Follow our Twitter account'] && <i className="bi bi-check-circle-fill"></i>}
                </button>
              </a>
            </li>
            <li>
              <a href="https://t.me/mounttechcolutions" target="_blank" rel="noopener noreferrer">
                <button
                  className='w-auto h-14 bg-yellow-500 my-6 rounded-full flex flex-row space-x-4 items-center px-3 py-2 hover:bg-yellow-800 hover:text-white transition-colors duration-500 focus:outline-none focus:ring focus:ring-yellow-300 focus:ring-offset-2'
                  onClick={() => handleTaskClick('Follow our Telegram announcement page')}
                >
                  <h3 className='text-left  w-64 leading-tight'>Subscribe to Mount Tech Channel +500</h3>
                  <i className="bi bi-telegram"></i>
                  {tick['Follow our Telegram announcement page'] && <i className="bi bi-check-circle-fill"></i>}
                </button>
              </a>
            </li>
            <li>
              <a href="https://youtube.com/@mounttechsolutions" target="_blank" rel="noopener noreferrer">
                <button
                  className='w-auto h-14 bg-yellow-500 my-6 rounded-full flex flex-row space-x-4 items-center px-3 py-2 hover:bg-yellow-800 hover:text-white transition-colors duration-500 focus:outline-none focus:ring focus:ring-yellow-300 focus:ring-offset-2'
                  onClick={() => handleTaskClick('Follow our Youtube page')}
                > 
                  <h3 className='text-left w-64 leading-tight'>Subscribe to Mount Tech Channel +500</h3>
                  <i className="bi bi-youtube"></i>
                  {tick['Follow our Youtube page'] && <i className="bi bi-check-circle-fill"></i>}
                </button>
              </a>
            </li>
            <li>
              <a href="https://t.me/+o0-w-_44_rdkYTQ0" target="_blank" rel="noopener noreferrer">
                <button
                  className='w-auto h-14 bg-yellow-500 my-6 rounded-full flex flex-row space-x-4 items-center px-3 py-2 hover:bg-yellow-800 hover:text-white transition-colors duration-500 focus:outline-none focus:ring focus:ring-yellow-300 focus:ring-offset-2'
                  onClick={() => handleTaskClick('Join Mount Tech Community')}
                >
                  <h3 className='text-left  w-64 leading-tight'>Join Mount Tech Community +500</h3>
                  <i className="bi bi-telegram"></i>
                  {tick['Join Mount Tech Community'] && <i className="bi bi-check-circle-fill"></i>}
                </button>
              </a>
            </li>
            <li>
              <a href="https://www.tiktok.com/@mount.tech.soluti?_t=8p3i6VHhXTa&_r=1" target="_blank" rel="noopener noreferrer">
                <button
                  className='w-auto h-14 bg-yellow-500 my-6 rounded-full flex flex-row space-x-4 items-center px-3 py-2 hover:bg-yellow-800 hover:text-white transition-colors duration-500 focus:outline-none focus:ring focus:ring-yellow-300 focus:ring-offset-2'
                  onClick={() => handleTaskClick('Follow our Tiktok account')}
                >
                  <h3 className='text-left  w-64 leading-tight'>Follow Tiktok account +500</h3>
                  <i className="bi bi-tiktok"></i>
                  {tick['Follow our Tiktok account'] && <i className="bi bi-check-circle-fill"></i>}
                </button>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}





function GameQuiz({ userData, setUserData, showQuestion, setShowQuestion }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [countdown, setCountdown] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isClickable, setIsClickable] = useState(true);

  const cooldownTime = 20 * 60 * 1000; // 20 minutes in milliseconds
  const currentQuestion = CryptoQuestions[currentQuestionIndex];

  useEffect(() => {
    // Retrieve the stored game state
    const storedFailTime = localStorage.getItem('failTime');
    const storedFailedAttempts = localStorage.getItem('failedAttempts');

    if (storedFailedAttempts) {
      setFailedAttempts(parseInt(storedFailedAttempts, 10));
    }

    if (storedFailTime) {
      const remainingTime = cooldownTime - (Date.now() - new Date(storedFailTime).getTime());
      if (remainingTime > 0) {
        setIsClickable(false);
        startCountdown(remainingTime);
      } else {
        localStorage.removeItem('failTime');
        localStorage.removeItem('failedAttempts');
      }
    }

    // Select a random question on component mount
    setRandomQuestionIndex();
  }, []);

  const setRandomQuestionIndex = () => {
    const randomIndex = Math.floor(Math.random() * CryptoQuestions.length);
    setCurrentQuestionIndex(randomIndex);
  };

  const startCountdown = (remainingTime) => {
    const failTime = new Date(localStorage.getItem('failTime'));

    if (isNaN(failTime.getTime())) {
      console.error("Invalid failTime in localStorage");
      return;
    }

    const countdownInterval = setInterval(() => {
      const timeLeft = Math.max(0, remainingTime - (Date.now() - failTime.getTime()));
      const minutes = Math.floor(timeLeft / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

      setCountdown(`You can play again in: ${minutes}m ${seconds}s`);

      if (timeLeft <= 0) {
        clearInterval(countdownInterval);
        localStorage.removeItem('failTime');
        localStorage.removeItem('failedAttempts');
        setCountdown('');
        setFeedback('');
        setIsClickable(true);
      }
    }, 1000);
  };

  const handleAnswer = async (answer) => {
    if (!isClickable) return;

    setSelectedAnswer(answer);
    if (answer === currentQuestion.correctAnswer) {
      setFeedback('Correct!');

      try {
        const q = query(collection(db, "users"), where("id", "==", userData.id));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const userRef = doc(db, "users", userDoc.id);

          console.log('Updating points for user ID:', userData.id);

          const newPoints = userData.point + 50;
          await updateDoc(userRef, { point: newPoints });
          setUserData(prevData => ({
            ...prevData,
            point: newPoints
          }));
        } else {
          console.error("No such document with ID:", userData.id);
        }
      } catch (error) {
        console.error("Error updating points:", error.message);
      }
    } else {
      setFailedAttempts((prev) => {
        const newAttempts = prev + 1;
        if (newAttempts === 1) {
          setFeedback(`Incorrect. The correct answer is ${currentQuestion.correctAnswer}. You have 1 life left.`);
        } else if (newAttempts >= 2) {
          setIsClickable(false);
          const failTime = new Date();
          localStorage.setItem('failTime', failTime.toISOString());
          localStorage.setItem('failedAttempts', newAttempts);
          startCountdown(cooldownTime);
          setFeedback(`Incorrect. The correct answer is: ${currentQuestion.correctAnswer}.`);
        }
        return newAttempts;
      });
    }

    setTimeout(() => {
      setFeedback('');
      setSelectedAnswer(null);
      setRandomQuestionIndex(); // Select a random question for the next round
    }, 3000);
  };

  return (
    showQuestion && (
      <div className="fixed w-full h-full bg-slate-950 z-50 top-0 left-0 flex flex-col items-center p-4">
        <div className="shadow-lg shadow-indigo-500/50 max-w-md w-full bg-slate-950 py-3 px-3 h-28 flex items-center animate-drop">
        <h1 className='text-white font-bold text-2xl'>Play to earn 1 million point</h1>
        </div>
        <Logo className="animate-drop w-48"/>
        <div className="bg-slate-950 p-6 text-white  rounded text-center shadow-lg shadow-indigo-500/50 max-w-md w-full relative">
          <button className='absolute right-0 top-0 px-5 py-6 cursor-pointer' onClick={() => setShowQuestion(false)}>Close</button>
          <h2 className="text-xl font-bold mb-4">Crypto Quiz</h2>
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2 text-white">{currentQuestion.question}</h3>
            <div className="space-y-2">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(option)}
                  className={`block w-full text-left p-2 text-black rounded border ${
                    selectedAnswer === option
                      ? option === currentQuestion.correctAnswer
                        ? 'bg-green-700'
                        : 'bg-red-700'
                      : 'bg-yellow-500'
                  }`}
                  disabled={!isClickable}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          {feedback && <p className="mt-4 text-lg font-semibold">{feedback}</p>}
          {countdown && <p className="mt-4 text-lg font-semibold">{countdown}</p>}
        </div>
      </div>
    )
  );
}





function SubmitWalletAddress({ userData, SetShowPopup, SetpopupMessage }) {
  const [walletAddress, setWalletAddress] = useState('');
  const [IsDisabled, setIsDisabled] = useState(false);
  const [IsLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkWalletAddress = async () => {
      try {
        const userRef = query(collection(db, "users"), where("id", "==", userData.id));
        const querySnapshot = await getDocs(userRef);

        if (!querySnapshot.empty) {
          const docSnap = querySnapshot.docs[0];
          const userWalletAddress = docSnap.data().walletAddress;

          if (userWalletAddress) {
            setWalletAddress('Your wallet has been submitted successfully');
            setIsDisabled(true);
          }
        } else {
          SetShowPopup(true);
          SetpopupMessage(`User not found.`);
        }
      } catch (error) {
        console.error("Error checking wallet address: ", error);
        SetShowPopup(true);
        SetpopupMessage(`Error checking wallet address.`);
      }
    };

    checkWalletAddress();
  }, [userData.id, SetShowPopup, SetpopupMessage]);

  const handleSubmit = async () => {
    if (walletAddress.trim() === '') {
      SetShowPopup(true);
      SetpopupMessage(`Please enter a wallet address.`);
      return;
    }
    setIsLoading(true);
    try {
      const userRef = query(collection(db, "users"), where("id", "==", userData.id));
      const querySnapshot = await getDocs(userRef);

      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
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
    } finally {
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
          disabled={IsDisabled}
          onChange={(e) => setWalletAddress(e.target.value)}
        />
        <button
          className='mx-3 uppercase inline-block bg-yellow-400 rounded-full px-4 py-2 hover:bg-yellow-400 transition-colors duration-300 focus:outline-none focus:ring focus:ring-yellow-300 focus:ring-offset-2'
          onClick={handleSubmit}
          disabled={IsDisabled || IsLoading}
        >
          {IsLoading ? 'Please wait.........' : 'Submit'}
        </button>
      </div>
    </div>
  );
}

function DailyTask({ userData, showDailyPoint, setShowDailyPoint }) {
  const [clickedDays, setClickedDays] = useState([]);
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const loadClickedDays = async () => {
      try {
        const userQuery = query(collection(db, "users"), where("id", "==", userData.id));
        const querySnapshot = await getDocs(userQuery);
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const data = userDoc.data();
          setClickedDays(data.clickedDays || []);
          calculateTimeLeft(data.lastClickTime);
        }
      } catch (error) {
        console.error("Error loading clicked days: ", error);
      }
    };

    loadClickedDays();
    const intervalId = setInterval(() => {
      calculateTimeLeft(); // Update the time left every second
    }, 1000);
    return () => clearInterval(intervalId); // Cleanup the interval on component unmount
  }, [userData.id]);

  const calculateTimeLeft = (lastClickTime) => {
    const currentTime = new Date().getTime();

    // Find the most recent click time
    const recentClickTime = Math.max(...Object.values(lastClickTime || {}));
    
    if (recentClickTime) {
      const timeSinceLastClick = currentTime - recentClickTime;
      const timeLeft = 24 * 60 * 60 * 1000 - timeSinceLastClick;
      if (timeLeft > 0) {
        setTimeLeft(timeLeft);
        const hours = Math.floor(timeLeft / (60 * 60 * 1000));
        const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
        const seconds = Math.floor((timeLeft % (60 * 1000)) / 1000);
        
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s left`);
      }
    }
  };

  async function handleDailyPoint(day) {
    try {
      const userQuery = query(collection(db, "users"), where("id", "==", userData.id));
      const querySnapshot = await getDocs(userQuery);
  
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userDocRef = userDoc.ref;
  
        const data = userDoc.data();
        const lastClickTime = data.lastClickTime || {};
        const currentTime = new Date().getTime();
    

        // Check if any day has been clicked today
        const lastClickedDay = Object.values(lastClickTime).find(
          time => currentTime - time < 24 * 60 * 60 * 1000
        );

        if (lastClickedDay) {
          calculateTimeLeft(lastClickTime);
          return;
        }

        // Determine the points based on whether it's the last day
        const pointsToAdd = day === 10 
        ? (toast('You have gotten 3500 points'), 2100) 
        : (toast('You have gotten 100 points'), 100);
      

        // Update the points and set the last click time for the current day
        lastClickTime[day] = currentTime;
        await updateDoc(userDocRef, {
          point: (data.point || 0) + pointsToAdd,
          lastClickTime: lastClickTime,
          clickedDays: [...clickedDays, day],
        });

        // Update UI to reflect the changes
        setClickedDays([...clickedDays, day]);
        calculateTimeLeft(lastClickTime);
      } else {
        console.log("No user document found with the provided ID.");
      }
    } catch (error) {
      console.log("Error updating document: ", error);
    }
  }

  const isDayDisabled = (day) => {
    return clickedDays.some(clickedDay => {
      const currentTime = new Date().getTime();
      const lastClickTime = clickedDays[clickedDay];
      return currentTime - lastClickTime < 24 * 60 * 60 * 1000;
    }) || clickedDays.includes(day);
  };

  const getContainerStyle = (day) => {
    return isDayDisabled(day)
      ? "bg-gray-400 cursor-not-allowed"
      : "bg-yellow-500  cursor-pointer";
  };

  const getPointsForDay = (day) => {
    return day === 10 ? 2100 : 100;
  };

  return (
    showDailyPoint && (
      <div className="fixed w-full h-full bg-slate-950 z-50 top-0 left-0 flex flex-col items-center justify-center p-4">
        <div className="bg-slate-950 w-auto h-[500px] overflow-auto p-6 text-white rounded text-center shadow-lg shadow-indigo-500/50 max-w-md relative">
        <button className='text-yellow-500 text-lg absolute top-5 right-4' onClick={()=>setShowDailyPoint(false)}>Close</button>
          <img src={mounttechCoin} alt="Logo" className="mx-auto mb-1 w-28 animate-spinSlow" />
          <h1 className="uppercase font-semibold">$MTT Daily Boost</h1>
          <h3>Receive an $MTT for daily visiting</h3>
          {timeLeft && <p className="text-red-500 mb-4">{timeLeft}</p>}
          <div className="flex flex-row flex-wrap py-2 px-2 justify-center">
            {Array.from({ length: 10 }, (_, i) => (
              <div
                className={`w-[6rem] h-[6rem] rounded-md m-1 shadow-lg flex flex-col items-center justify-center text-black ${getContainerStyle(i + 1)}`}
                key={i + 1}
                onClick={() => !isDayDisabled(i + 1) && handleDailyPoint(i + 1)}
              >
                <img src={mounttechCoin} alt="Logo" className="mx-auto mb-1 w-8 animate-spinSlow" />
                <span>Day {i + 1}</span>
                <span className="">{getPointsForDay(i + 1)} points</span>
              </div>
            ))}
          </div>
        </div>
        <ToastContainer />
      </div>
    )
  );
}


function Overlay() {
  return (
    <div className='w-full h-56 xl:mx-20 my-6 flex items-center justify-center'></div>
  );
}


export default App;
