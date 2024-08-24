import { useState, useEffect } from "react";

function Reward({ userData }) {
  const [percent, setPercentage] = useState('');
  const [mttCoins, setMttCoins] = useState(0);

  useEffect(() => {
    function calculateMTTCoins(points) {
      const conversionRate = 10 / 1000; // 10 MTT coins for every 1000 points
      return points * conversionRate;
    }

    if (userData?.point) {
      const coins = calculateMTTCoins(userData.point);
      setMttCoins(coins);
    }
  }, [userData]);

  return (
    <div className='w-full mb-2 xl:mx-20 h-auto'>
      <div className='mx-3'>
        <h3 className='text-white my-6'>Available Rewards</h3>
        <div className='w-80 h-14 bg-yellow-500 my-6 rounded-full flex flex-row justify-between items-center px-5 py-2'>
          <h3 className="w-80">
            {new Intl.NumberFormat('en-NG').format((userData.point).toFixed(1))} points 
          </h3>
          <i className="bi bi-trophy"></i>
        </div>
        <div className='w-80 h-14 bg-yellow-500 my-6 rounded-full flex flex-row justify-between items-center px-5 py-2' >
          <h3 className="w-80">
            {new Intl.NumberFormat('en-NG').format(mttCoins.toFixed(1))} MTT coins
          </h3>
          <i className="bi bi-coin"></i>
        </div>
      </div>
    </div>
  );
}

export default Reward;
