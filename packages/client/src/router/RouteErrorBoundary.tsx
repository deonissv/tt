import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useNavigate } from 'react-router-dom';

// Route failures (rendering, and later loaders or actions) land here instead of
// React Router's default error screen. Error details stay out of the UI; the
// only exposed recovery path is returning to the games list.
export const RouteErrorBoundary: React.FC = (): React.ReactNode => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-bgblue via-bg-green-500 to-bg-green-100 text-white p-4">
      <WarningAmberIcon className="w-56 h-56 mb-8 animate-bounce" fontSize="inherit" />
      <p className="text-2xl mb-8">Something went wrong</p>
      <div className="text-center">
        <p className="mb-4">An unexpected error occurred while displaying this page.</p>
        <p className="mb-4">You can return to your games and try again.</p>
      </div>
      <button
        className="bg-[#064663] w-[200px] h-[50px] rounded-full mr-3 px-4 py-1 text-white hover:shadow-lg hover:scale-105 transition duration-300 ease-in-out flex justify-center items-center"
        onClick={() => {
          void navigate('/games');
        }}
      >
        <p className="font-bold uppercase tracking-wide text-sm">Back to games</p>
      </button>
    </div>
  );
};
