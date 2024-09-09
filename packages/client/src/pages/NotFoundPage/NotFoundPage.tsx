import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useNavigate } from 'react-router-dom';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-bgblue via-bg-green-500 to-bg-green-100 text-white p-4">
      <WarningAmberIcon className="w-56 h-56 mb-8 animate-bounce" fontSize="inherit" />
      <p className="text-2xl mb-8">Oops! Page not found</p>
      <div className="text-center">
        <p className="mb-4">The page you are looking for might have been removed,</p>
        <p className="mb-4">had its name changed, or is temporarily unavailable.</p>
      </div>
      <button
        className="bg-[#064663] w-[150px] h-[50px] rounded-full mr-3 px-4 py-1 text-white hover:shadow-lg hover:scale-105 transition duration-300 ease-in-out flex justify-center items-center"
        onClick={() => navigate('/games')}
      >
        <p className="font-bold uppercase tracking-wide text-sm">Back</p>
      </button>
    </div>
  );
};
