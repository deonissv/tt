import type { IProps } from '@components';

interface ButtonProps extends IProps {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export const Button: React.FC<ButtonProps> = ({ children, onClick, className }): React.ReactNode => {
  return (
    <button
      className={`bg-[#064663] rounded-full px-5 py-3 text-white hover:shadow-lg hover:scale-105 transition duration-300 ease-in-out ${className ?? ''}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
