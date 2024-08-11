
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
export default Reward