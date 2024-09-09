import { Button, Logo } from '@components';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { AuthService } from '@services';
import type React from 'react';
import { useNavigate } from 'react-router-dom';

export const Header: React.FC = (): React.ReactNode => {
  const navigate = useNavigate();

  return (
    <div className="w-full h-[100px] bg-bgblue shadow-md mb-5 ">
      <div className="flex items-center max-w-screen-2xl justify-between mx-auto h-[100px]">
        <div
          onClick={() => {
            navigate('/games');
          }}
          className="h-[60px] w-[60px] cursor-pointer"
        >
          <Logo />
        </div>
        <div className="flex items-center justify-end">
          <>
            <Button className=" flex justify-center items-center mr-2" onClick={() => navigate('/join')}>
              <p className="font-bold uppercase tracking-wide text-sm">Join Room</p>
            </Button>
            <Button className=" flex justify-center items-center mr-2" onClick={() => navigate('/saves')}>
              <p className="font-bold uppercase tracking-wide text-sm">Saves</p>
            </Button>
          </>
          <Button
            className=" flex justify-center items-center mr-2"
            onClick={() => navigate(AuthService.authorized() ? '/profile' : '/login')}
          >
            <p className="font-bold uppercase tracking-wide text-sm mr-3">Profile</p>
            <AccountCircleIcon />
          </Button>
        </div>
      </div>
    </div>
  );
};
