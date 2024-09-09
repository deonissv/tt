import { getErrorMsg } from '@client/src/utils';
import { Button, Input, useToast } from '@components';
import { AuthService } from '@services';
import type { UpdateUserDto } from '@shared/dto/users';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const Profile = () => {
  const navigate = useNavigate();
  const userJWT = AuthService.getJWT();

  const { addToast } = useToast();

  const [username, setUsername] = useState(userJWT?.username);
  const [password, setPassword] = useState('');

  const onModify = (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!userJWT?.code || (!username && !password)) return;

    const updatedContent: UpdateUserDto = {};
    if (username !== userJWT.username) updatedContent.username = username;
    if (password) updatedContent.password = password;

    if (Object.keys(updatedContent).length > 0) {
      AuthService.updateUser(userJWT.code, updatedContent)
        .then(() => navigate('/games'))
        .catch(e => addToast(`Failed to modify user: ${getErrorMsg(e)}`));
    } else {
      navigate('/games');
    }
  };

  const onLogout = () => {
    AuthService.logout();
    navigate('/games');
  };
  return (
    <div className="flex justify-center w-full mb-5">
      <div className="flex flex-col bg-light-blue w-[1000px]">
        <div className="flex flex-col  p-11">
          <h4 className="text-center !text-2xl !font-bold mb-6">Profile</h4>
          <div className="p-3">
            <Input
              label="Username"
              placeholder="Username"
              type="text"
              value={username}
              onChange={e => setUsername((e.target as HTMLInputElement).value)}
            />
            <Input
              label="Password"
              placeholder="Password"
              type="password"
              value={password}
              onChange={e => setPassword((e.target as HTMLInputElement).value)}
            />
            <div className="mt-3 flex flex-col justify-center">
              <Button onClick={onModify}>
                <p className="font-bold uppercase tracking-wide text-sm">Modify</p>
              </Button>
            </div>
          </div>
        </div>
        <button
          className="relative bottom-0 w-full bg-accent text-black hover:font-bold text-lg uppercase font-semibold py-5 transition duration-300 ease-in-out shadow-md hover:shadow-xl"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
};
