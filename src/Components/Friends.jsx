import { useState } from "react";
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
        <h2 className="text-white uppercase">Invite Friends and get 1000 $MTT Points</h2>
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
  
  

export default Friends