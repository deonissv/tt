import type { IProps } from '@components';
import type React from 'react';
import { useState } from 'react';

export interface InputProps extends IProps {
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
  valitaion?: (value?: string | number) => boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  required,
  type = 'text',
  value,
  onChange,
  className,
  error,
  valitaion,
}): React.ReactNode => {
  const [isValid, setIsValid] = useState(true);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (required) {
      setIsValid(e.target.value.trim() !== '');
    }

    onChange?.(e);
  };

  const showRed = () => {
    const valid = valitaion ? valitaion(value) : true;
    return !!error || !isValid || !valid;
  };

  return (
    <>
      <p className="font-bold mb-2">
        {label}
        {required && <span className="text-red"> *</span>}
      </p>
      <input
        placeholder={placeholder}
        type={type}
        className={
          'p-3 rounded border-2 border-[#A2A6B0] focus:outline-green mb-6 w-full ' +
          (className ?? '') +
          (showRed() ? ' border-red ' : '')
        }
        value={value}
        onChange={onInputChange}
      />
    </>
  );
};
