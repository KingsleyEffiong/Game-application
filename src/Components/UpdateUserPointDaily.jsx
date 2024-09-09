import mounttechCoin from '../images/mount tech silver.png';


function UpdateUserPointDaily({ userData }) {

    return (
      <div className='h-10 flex flex-col justify-center items-center py-24 animate-scaleUp'>
        <img className='w-52 animate-spinSlow' src={mounttechCoin} alt="" /> {/* Replace with your image path */}
        <h2>
        <h3 className="text-yellow-400 text-sm">
              {new Intl.NumberFormat('en-NG').format(userData.point)} Points.
            </h3>
        </h2>
      </div>
    );
  }

export default UpdateUserPointDaily