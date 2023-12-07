import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Link, IconButton } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

export const Header: React.FC = (): React.ReactNode => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState(-1);

  const onActiveMenu = (index: number) => {
    setActiveMenu(index);
  };

  const navMenu = ['nav1', 'nav2', 'nav3', 'nav4'];

  return (
    <div className="w-full shadow-md mb-5">
      <div className="flex items-center max-w-screen-2xl justify-between mx-auto h-16">
        <div className="flex items-center">
          <img
            onClick={() => {
              navigate('/');
              setActiveMenu(-1);
            }}
            src="/logo.png"
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
          <button className="bg-blue w-max rounded-full mr-3 px-4 py-1 text-white" onClick={() => navigate('/join')}>
            Join Room
          </button>
          <button className="bg-blue w-max rounded-full px-4 py-1 text-white" onClick={() => navigate('/')}>
            Create Room
          </button>
          <IconButton component={Link} onClick={() => navigate('/login')}>
            <AccountCircleIcon className="text-black hover:text-sky-500" />
          </IconButton>
        </div>
      </div>
    </div>
  );
};
