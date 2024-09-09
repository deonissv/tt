import type React from 'react';
import { useEffect, useRef } from 'react';

export interface ToastProps {
  id: string;
  message: string;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ id, message, onClose }) => {
  const timer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    timer.current = setTimeout(() => {
      onClose(id);
    }, 3000);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [timer, id, onClose]);

  const handleClick = () => {
    onClose(id);
  };

  return (
    <div className="bg-lightred text-white p-5 rounded shadow-lg" onClick={handleClick}>
      {message}
    </div>
  );
};
