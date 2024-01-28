import RoomsGallery from '@components/RoomsGallery/RoomsGallery';
import { AuthService } from '@services/auth.service';
import { RoomService } from '@services/room.service';
import { RoomPreviewDto } from '@shared/dto/rooms/room-preview.dto';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();
  const user = AuthService.authorized();
  const [rooms, setRooms] = useState<RoomPreviewDto[]>([]);

  const onLogout = () => {
    AuthService.logout();
    navigate('/');
  };

  const onRoomClick = async (roomCode: string) => {
    const roomId = await RoomService.startRoom(roomCode);

    localStorage.setItem('tt-nickname', '');
    navigate(`/room/${roomId}`);
  };

  useEffect(() => {
    const loadPreviews = async () => {
      const roomPreviews = await RoomService.getUserRooms(user!.code);
      setRooms(roomPreviews);
    };

    // eslint-disable-next-line no-console
    loadPreviews().catch(console.error);
  }, []);

  return (
    <>
      <div className="flex justify-center sm:items-center lg:items-stretch sm:flex-col lg:flex-row w-full">
        <div className="bg-[#E6EAFF] w-[30rem] p-5 m-5">
          <h1>Profile</h1>
          <h1>{user?.username}</h1>
          <button className="bg-blue w-max rounded-full px-4 py-1 text-white" onClick={onLogout}>
            Logout
          </button>
          <div>
            <RoomsGallery onRoomClick={onRoomClick} rooms={rooms} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
