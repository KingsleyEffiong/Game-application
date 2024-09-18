
function ButtonBars({ onFriendsClick, onLeadershipClick, setShowQuestion, setShowDailyPoint, setShowLeadershipBoard, setShowFriends }) {
    return (
      <div className='fixed bottom-0 z-50 px-2 py-2 w-full h-20 bg-slate-950'>
        <div className='flex justify-center items-center space-x-2'>
          <button className='text-slate-950 bg-yellow-500 rounded py-1 px-1 animate-scaleUp' onClick={()=>{
            setShowLeadershipBoard(false);
            setShowFriends(false);
            setShowDailyPoint(false);
            setShowQuestion(false)
          }}>
            <i className="bi bi-house-fill text-xs font-thin"></i>
            <h6 className="text-xs">Home</h6>
          </button>
          <button className='text-slate-950 bg-yellow-500 rounded py-1 px-1 animate-scaleUp' onClick={()=>
            {
              onLeadershipClick
              setShowLeadershipBoard(true);
              setShowFriends(false);
              setShowDailyPoint(false);
              setShowQuestion(false)
            }
            }
        >
            <i className="bi bi-bar-chart-fill text-xs"></i>
            <h6 className="text-xs">Leadership board</h6>
          </button>
          <button className='text-slate-950 bg-yellow-500 rounded py-1 px-1 animate-scaleUp' onClick={() =>
          {
            setShowLeadershipBoard(false);
            setShowFriends(false);
            setShowDailyPoint(false);
            setShowQuestion(true)
            }}>
            <i className="bi bi-joystick text-xs"></i>
            <h6 className="text-xs" >Play game</h6>
          </button>
          <button className='text-slate-950 bg-yellow-500 rounded py-1 px-1 animate-scaleUp' onClick={()=>{
            
            setShowDailyPoint(true)
            setShowLeadershipBoard(false);
            setShowFriends(false);
            setShowQuestion(false)
            }}>
            <i className="bi bi-rocket text-xs"></i>
            <h6 className="text-xs">Daily boost</h6>
          </button>
          <button className='text-slate-950 bg-yellow-500 rounded py-1 px-1 animate-scaleUp' onClick={() => {
          setShowDailyPoint(false)
          setShowLeadershipBoard(false);
          setShowQuestion(false)
            onFriendsClick
            setShowFriends(true);
          }}>
            <i className="bi bi-people-fill text-xs"></i>
            <h6 className="text-xs">Invite Friends</h6>
          </button>
        </div>
      </div>
    );
  }
  

export default ButtonBars