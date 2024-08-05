import './index.css'
import imageLogo from './images/mountech_cypto_logo-removebg-preview.png'
import boastIcon from './images/boaaee-removebg-preview.png'
import earnIcon from './images/earn_logo_crypto-removebg-preview.png'
import socaialTaskIcon from './images/social_task_logo_cypto-removebg-preview.png'
import challengeTask from './images/challenge-removebg-preview.png'

function App() {
  return (
    <>
      <div className='bg-orange-600 h-full w-full'>
      <UserLevel />
      <Tapping />
      <Tasks />
       </div>
    </>
  )
}


function UserLevel(){
  return(
    <div className="bg-zinc-900 h-24 grid place-items-center">
    <button className="flex rounded-full w-11/12 px-4 py-4 h-[60px] bg-orange-600 justify-around items-center">
     <div className="grid place-items-center sm:flex items-center">
        <h3 className="text-base text-slate-100 font-semibold md:text-xl">Game Level</h3>
        <img className="w-10 sm:w-12" src={imageLogo} alt="app--logo"/>
      </div>
     <div className="grid place-items-center sm:flex items-center">
        <h3 className="text-base text-slate-100 font-semibold md:text-xl">Max Level</h3>
        <img className="w-10 sm:w-12 lg:w-12" src={imageLogo} alt="app--logo"/>
      </div>
     {/* <div className="grid place-items-center sm:flex items-center ">
        <h3 className="text-base text-slate-100 font-semibold md:text-xl">Next Level - </h3>
        <p className="text-base text-slate-100 font-semibold md:text-xl"> 50000</p>
      </div> */}
    </button>
    </div>
  )
}

function Tapping(){
  return(
    <div className="w-full h-auto grid place-items-center py-3 my-20 border-solid border-2">
      <div className="flex justify-center items-center">
      <img className="w-10 sm:w-12 lg:w-24" src={imageLogo} alt="app--logo"/>
      <h3 className="text-3xl text-white font-semibold md:text-5xl">0</h3>
      </div>
    <img className="cursor-pointer" src={imageLogo} alt="app--logo"/>
    <Boaster />
  </div>
  )
}


function Boaster(){
  return(
    <div className="flex w-full h-auto py-3 my-5  justify-center items-center">
    <img className="w-8 md:w-12" src={boastIcon} alt="app--logo"/>
    <Loader />
   </div>
  )
}

function Loader(){
  return(
    <div className="w-3/6 bg-amber-400 h-6 rounded-full  text-base font-extrabold italic flex items-center justify-center  text-red-700 md:text-lg">
      <h3>Boast: 1500</h3>
    </div>
  )
}

function Tasks(){
  return(
    <div className="bg-zinc-900 h-24 grid place-items-center">
    <button className="flex rounded-full w-11/12 px-4 py-4 h-[60px] bg-white justify-around items-center">
     <div className="grid place-items-center sm:flex items-center">
        <img className="w-10 sm:w-14" src={earnIcon} alt="app--logo"/>
        <h3 className="text-base text-zinc-950 font-semibold md:text-xl">Earn</h3>
      </div>
     <div className="grid place-items-center sm:flex items-center">
        <img className="w-10 sm:w-14 lg:w-14" src={challengeTask} alt="app--logo"/>
        <h3 className="text-base text-zinc-950 font-semibold md:text-xl">Game Challenge</h3>
      </div>
     <div className="grid place-items-center sm:flex items-center ">
        <img className="w-10 sm:w-14 lg:w-14" src={socaialTaskIcon} alt="app--logo"/>
        <h3 className="text-base text-zinc-950 font-semibold md:text-xl">Social Task</h3>
      </div>
    </button>
    </div>
  )
 
}
export default App
