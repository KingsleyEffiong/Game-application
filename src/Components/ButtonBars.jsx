
function ButtonBars({ onFriendsClick, onLeadershipClick }) {
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
  

export default ButtonBars