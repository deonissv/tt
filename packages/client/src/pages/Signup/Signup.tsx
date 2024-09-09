import { getErrorMsg } from '@client/src/utils';
import { Button, Input, useToast } from '@components';
import { AuthService } from '@services';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';

export const Signup: React.FC = (): React.ReactNode => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [email, setEmail] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [rePassword, setRePassword] = React.useState('');
  const [reqRes, setReqRes] = React.useState('');

  const onRegisterSubmit = async (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (password !== rePassword) {
      setReqRes('Password not match');
      return;
    }

    if (email === '' || username === '' || password === '' || rePassword === '') {
      setReqRes('Please fill all fields');
      return;
    }

    await AuthService.signup({
      email,
      username,
      password,
    })
      .then(() => navigate('/'))
      .catch(e => addToast(`Failed to create game: ${getErrorMsg(e)}`));
  };

  return (
    <div className="flex justify-center w-full mb-5">
      <div className="bg-light-blue p-11">
        <h4 className="text-center !text-2xl !font-bold mb-6">Registration</h4>
        <h4 className="text-center !text-2xl !font-bold mb-2 text-red-500">{reqRes}</h4>
        <div className="flex">
          <div className="p-3 w-1/2">
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
          </div>
          <div className="p-3 w-1/2">
            <Input
              label="Username"
              placeholder="Username"
              type="text"
              required
              value={username}
              onChange={e => setUsername((e.target as HTMLInputElement).value)}
            />
            <Input
              label="Repeat password"
              placeholder="Repeat password"
              type="password"
              required
              error={password !== rePassword}
              value={rePassword}
              onChange={e => setRePassword((e.target as HTMLInputElement).value)}
            />
          </div>
        </div>
        <div className=" flex justify-center">
          <Button onClick={onRegisterSubmit}>
            <p className="font-bold uppercase tracking-wide text-sm">Sign Up</p>
          </Button>
        </div>
      </div>
    </div>
  );
};
