import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { RoomPreviewDto } from '@tt/dto';

import { PromiseModal, RoomCard, Spinner, useToast } from '@components';
import { AuthService, RoomService } from '@services';
import { getErrorMsg } from '../../utils';

export const Saves: React.FC = (): React.ReactNode => {
  const { addToast } = useToast();

  const navigate = useNavigate();
  const user = useMemo(() => AuthService.getJWT(), []);

  const [rooms, setRooms] = useState<RoomPreviewDto[] | null>(null);

  const loadPreviews = useCallback(async () => {
    const roomPreviews = await RoomService.getUserRooms(user!.code);
    setRooms(roomPreviews);
  }, [user]);

  useEffect(() => {
    loadPreviews().catch(e => addToast(`Failed load save previews: ${getErrorMsg(e)}`));
  }, []);

  const { openModal, Modal } = PromiseModal({
    title: 'Confirm Delete',
    message: 'Are you sure you want to delete this room?',
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
  });

  const onCreateRoom = async (roomCode: string) => {
    try {
      const roomId = await RoomService.startRoom(roomCode);
      navigate(`/room/${roomId}`);
    } catch (e) {
      addToast(`Failed to create game: ${getErrorMsg(e)}`);
    }
  };

  const onDeleteRoom = async (roomCode: string) => {
    const confirmed = await openModal();
    if (!confirmed) return;
    await RoomService.deleteRoom(roomCode);
    await loadPreviews().catch(e => addToast(`Failed to delete a room: ${e}`));
  };

  return (
    <div className="text-white flex flex-col items-center py-6">
      <div className="w-[1000px] flex flex-col bg-bgblue p-11">
        {rooms ? (
          rooms.length > 0 ? (
            rooms.map(room => (
              <RoomCard key={room.roomCode} room={room} onCreateRoom={onCreateRoom} onRemoveRoom={onDeleteRoom} />
            ))
          ) : (
            <div className="text-center text-gray-500">No rooms available</div>
          )
        ) : (
          <div className="w-full py-6">
            <Spinner />
          </div>
        )}

        <Modal />
      </div>
    </div>
  );
};
