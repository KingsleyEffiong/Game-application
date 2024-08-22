
function ButtonBars({ onFriendsClick, onLeadershipClick, setShowQuestion, setShowDailyPoint }) {
    return (
      <div className='fixed bottom-0 w-full h-20 xl:mx-20 bg-slate-950'>
        <div className='flex justify-center items-center space-x-2'>
          <button className='text-white'>
            <i className="bi bi-house-fill text-xs font-thin"></i>
            <h6 className="text-xs">Home</h6>
          </button>
          <button className='text-white' onClick={onLeadershipClick}>
            <i className="bi bi-bar-chart-fill text-xs"></i>
            <h6 className="text-xs">Leadership board</h6>
          </button>
          <button className='text-white' onClick={() =>setShowQuestion(true)}>
            <i className="bi bi-joystick text-xs"></i>
            <h6 className="text-xs" >Play game</h6>
          </button>
          <button className='text-white' onClick={()=>{setShowDailyPoint(true)}}>
            <i className="bi bi-rocket text-xs"></i>
            <h6 className="text-xs">Daily boast</h6>
          </button>
          <button className='text-white' onClick={onFriendsClick}>
            <i className="bi bi-people-fill text-xs"></i>
            <h6 className="text-xs">Invite Friends</h6>
          </button>
        </div>
      </div>
    );
  }
  

export default ButtonBars