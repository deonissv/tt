import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { IconButton, Link, Typography } from '@mui/material';
import type React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../../services/auth.service';

export const Header: React.FC = (): React.ReactNode => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState(-1);

  const onActiveMenu = (index: number) => {
    setActiveMenu(index);
  };

  const navMenu: string[] = [];

  return (
    <div className="w-full shadow-md mb-5">
      <div className="flex items-center max-w-screen-2xl justify-between mx-auto h-16">
        <div className="flex items-center">
          <img
            onClick={() => {
              navigate('/');
              setActiveMenu(-1);
            }}
            src="https://www.svgrepo.com/show/322168/dice-eight-faces-eight.svg"
            alt="Logo"
            className="h-11 w-auto cursor-pointer"
          />
          {navMenu.map((value, index) => (
            <Typography
              key={index}
              onClick={() => onActiveMenu(index)}
              className={
                activeMenu === index
                  ? 'text-sm text-white bg-blue rounded-2xl font-semibold cursor-pointer py-2 px-4 !ml-4'
                  : 'hover:text-white hover:bg-blue hover:rounded-3xl text-sm text-black font-semibold cursor-pointer py-2 px-4 !ml-4'
              }
            >
              {value}
            </Typography>
          ))}
        </div>
        <div className="flex items-center justify-end">
          {AuthService.authorized() && (
            <>
              <button
                className="bg-blue w-max rounded-full mr-3 px-4 py-1 text-white"
                onClick={() => navigate('/join')}
              >
                Join Room
              </button>
              <button className="bg-blue w-max rounded-full mr-3 px-4 py-1 text-white" onClick={() => navigate('/')}>
                Create Room
              </button>
            </>
          )}
          {AuthService.authorized() ? (
            <>
              <div data-popover-target="popover">
                {AuthService.authorized()?.avatar_url ? (
                  <img
                    src={AuthService.authorized()!.avatar_url!}
                    alt="Avatar"
                    className="h-11 w-auto cursor-pointer"
                    onClick={() => navigate('/profile')}
                  ></img>
                ) : (
                  <CheckCircleIcon className="text-black hover:text-sky-500" onClick={() => navigate('/profile')} />
                )}
              </div>
            </>
          ) : (
            <IconButton component={Link} onClick={() => navigate('/login')}>
              <AccountCircleIcon className="text-black hover:text-sky-500" />
            </IconButton>
          )}
        </div>
      </div>
    </div>
  );
};
