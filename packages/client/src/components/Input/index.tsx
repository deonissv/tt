import React from 'react';
import IProps from '@components/IProps';

interface InputProps extends IProps {
  label?: string;
  placeholder?: string;
  required?: boolean;
  type?:
    | 'button'
    | 'checkbox'
    | 'color'
    | 'date'
    | 'datetime-local'
    | 'email'
    | 'file'
    | 'hidden'
    | 'image'
    | 'month'
    | 'number'
    | 'password'
    | 'radio'
    | 'range'
    | 'reset'
    | 'search'
    | 'submit'
    | 'tel'
    | 'text'
    | 'time'
    | 'url'
    | 'week';
  value?: string | number;
  error?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  required,
  type,
  value,
  onChange,
  className,
  error,
}: InputProps): React.ReactNode => {
  return (
    <>
      <p className="font-bold mb-2">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </p>
      <input
        placeholder={placeholder}
        type={type}
        className={
          'p-3 rounded border-2 border-[#A2A6B0] focus:outline-green mb-6 w-full ' +
          (className ?? '') +
          (error ? ' border-red-500 ' : '')
        }
        value={value}
        onChange={onChange}
      />
    </>
  );
};

Input.defaultProps = {
  type: 'text',
};

export default Input;
