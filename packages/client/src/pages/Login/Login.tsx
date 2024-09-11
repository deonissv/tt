import { getErrorMsg } from '@client/src/utils';
import { Button, Input, useToast } from '@components';
import { AuthService } from '@services';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const MIN_PASSWD_LENGTH = 8;

interface Props {
  onLogin?: () => void;
}

export const Login: React.FC<Props> = ({ onLogin }): React.ReactNode => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const onRegisterSubmit = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    if (email === '' || password === '') {
      addToast('Please fill in all fields');
      return;
    }
    if (password.length < MIN_PASSWD_LENGTH) {
      addToast('Password is too short');
      return;
    }

    AuthService.signin({
      email,
      password,
    })
      .then(() => {
        if (onLogin) onLogin();
      })
      .catch(e => addToast(`Failed to sign in: ${getErrorMsg(e)}`));
  };

  return (
    <div className="flex justify-center sm:items-center lg:items-stretch sm:flex-col lg:flex-row w-full">
      <div className="bg-[#E6EAFF] w-[30rem] p-5 m-5">
        <h1 className="text-xl font-bold mb-3">Registered Customers</h1>
        <h5 className="mb-6">If you have an account, sign in with your email address.</h5>
        <Input
          label="Email"
          placeholder="Email"
          type="email"
          required
          value={email}
          onChange={e => setEmail((e.target as HTMLInputElement).value)}
        />
        <Input
          label="Password"
          placeholder="Password"
          type="password"
          required
          value={password}
          onChange={e => setPassword((e.target as HTMLInputElement).value)}
        />
        <Button className="mr-2" onClick={onRegisterSubmit}>
          <p className="font-bold uppercase tracking-wide text-sm">Login</p>
        </Button>
      </div>
      <div className="bg-[#E6EAFF] w-[30rem] p-5  m-5">
        <h1 className="text-xl font-bold mb-3">New customer?</h1>
        <h5 className="mb-6">Creating an account has many benefits:</h5>
        <ul className="list-disc ml-4 mb-6">
          <li>Host rooms</li>
          <li>Save game progress</li>
          <li>Add new templates</li>
        </ul>
        <Button className="mr-2" onClick={() => navigate('/signup')}>
          <p className="font-bold uppercase tracking-wide text-sm">Create An Account</p>
        </Button>
      </div>
    </div>
  );
};
