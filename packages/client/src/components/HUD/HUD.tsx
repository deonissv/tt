import { Slider } from '@components';
import ExitToApp from '@mui/icons-material/ExitToApp';
import RoomPreferencesIcon from '@mui/icons-material/RoomPreferences';
import { AuthService } from '@services';
import { PICK_HIGHT, ROTATION_STEP } from '@tt/actors';
import { RoomwDto } from '@tt/dto';
import { radToDeg } from '@tt/utils';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export interface HUDProps {
  room?: RoomwDto;
  onCloseRoom: () => void;
  onSetPickHeight: (height: number) => void;
  onSetRotateStep: (step: number) => void;
}

export const HUD: React.FC<HUDProps> = ({ onCloseRoom, room, onSetPickHeight, onSetRotateStep }): React.ReactNode => {
  const navigate = useNavigate();
  const [simOptions, setSimOptions] = useState(false);
  const [pickHeight, setPickHeight] = useState(PICK_HIGHT);
  const [rotateStep, setRotateStep] = useState(radToDeg(ROTATION_STEP));

  const showStopRoom = useMemo(() => {
    return AuthService.getJWT()!.sub === room?.authorId;
  }, [room]);

  const toggleOptions = useCallback(() => {
    setSimOptions(prev => !prev);
  }, []);

  const onBgClick = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (e.target !== e.currentTarget) return;
    toggleOptions();
  }, []);

  const onLeaveRoom = useCallback(() => {
    navigate('/games');
  }, []);

  const onSetPickHeightChange = useCallback((value: number) => {
    setPickHeight(value);
    onSetPickHeight(value);
  }, []);

  const onSetRotateStepChange = useCallback((value: number) => {
    setRotateStep(value);
    onSetRotateStep(value);
  }, []);

  return (
    <>
      <span onClick={toggleOptions}>
        <RoomPreferencesIcon
          className="z-20 fixed right-5 top-5 text-white rounded-lg cursor-pointer outline outline-2 outline-offset-2 outline-transparent  hover:outline-white"
          fontSize="large"
        />
      </span>
      <span onClick={onLeaveRoom}>
        <ExitToApp
          className="z-20 fixed left-5 top-5 text-white rounded-lg cursor-pointer outline outline-2 outline-offset-2 outline-transparent  hover:outline-white"
          fontSize="large"
        />
      </span>
      {simOptions && (
        <div
          className="z-20 absolute top-0 left-0 w-full h-full flex justify-center content-center flex-wrap"
          onClick={onBgClick}
        >
          <div className="z-20 w-[500px] bg-light-blue">
            <h4 className="text-center !text-2xl !font-bold mb-6">Room menu</h4>
            <div className="w-full mb-5 p-3">
              <Slider
                min={0.3}
                max={3}
                step={0.1}
                label="Actor pick height"
                value={pickHeight}
                onChange={onSetPickHeightChange}
              />
              <Slider
                min={5}
                max={90}
                step={5}
                label="Actor rotate step"
                value={rotateStep}
                onChange={onSetRotateStepChange}
              />
            </div>
            {showStopRoom && (
              <button
                className="relative bottom-0 w-full bg-accent text-black hover:font-bold text-lg uppercase font-bold py-5 transition duration-300 ease-in-out shadow-md hover:shadow-xl"
                onClick={onCloseRoom}
              >
                Stop room
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};
