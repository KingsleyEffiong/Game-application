
import Logo from '../Components/Logo';
import Profile from './Profile';

function Navbar({ userData }) {
    return (
      <div className="w-[100%] h-32 flex flex-row justify-between items-center">
        <Logo />
        {userData ? <Profile userData={userData} /> : null}
      </div>
    );
  }

export default Navbar