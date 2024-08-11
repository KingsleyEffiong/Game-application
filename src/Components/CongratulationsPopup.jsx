import mounttechCoin from '../images/mount tech silver.png';
function CongratulationsPopup({ onClose }) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-950 z-[100]">
        <div className="bg-slate-950 p-6 w-80 rounded shadow-lg text-center shadow-lg shadow-indigo-500/50">
          <img src={mounttechCoin} alt="Logo" className="mx-auto mb-4 w-32 animate-spinSlow" />
          <h2 className="text-xl font-semibold mb-2 text-white">Congratulations!</h2>
          <p className="mb-4 text-white">Congratulation you have earned 5000 Points, <br/> Points can be redeemed for $MTT once a snapshort has been taken of the leaderboard.</p>
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

export default CongratulationsPopup