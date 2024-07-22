import Input from '@components/Input';
import { AuthService } from '@services/auth.service';
import { saveAccessToken } from 'client/src/utils';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';

const Signup: React.FC = (): React.ReactNode => {
  const navigate = useNavigate();

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

    const token = await AuthService.signup({
      email,
      username,
      password,
    });

    saveAccessToken(token);
    navigate('/');
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
            <button
              className="bg-blue rounded-full px-10 py-3 text-white float-right"
              onClick={e => onRegisterSubmit(e)}
            >
              Sign Up
            </button>
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
            <div className="text-blue mt-[13px]">Forgot password?</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
