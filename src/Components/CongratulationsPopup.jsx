import mounttechCoin from '../images/mount tech silver.png';
function CongratulationsPopup({ children, onClose, congratulationText }) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-950 z-[100]">
        <div className="bg-slate-950 p-6 w-80 rounded  text-center shadow-lg shadow-indigo-500/50">
          <img src={mounttechCoin} alt="Logo" className="mx-auto mb-4 w-32 animate-spinSlow" />
          {/* <h2 className="text-xl font-semibold mb-2 text-white">{congratulationText}</h2> */}
         {children}
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