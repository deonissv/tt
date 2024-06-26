import type { FC, ReactNode } from 'react';

import type { RoomPreviewDto } from '@shared/dto/rooms';

interface Props {
  rooms: RoomPreviewDto[];
  onRoomClick: (code: string) => void;
}

const RoomsGallery: FC<Props> = ({ rooms, onRoomClick }): ReactNode => {
  return (
    <div className="inline-block">
      {rooms.map(room => (
        <div
          className="w-24 m-1 p-3 text-center border-solid rounded border-black hover:border-2 float-left"
          key={room.roomCode}
        >
          <div>{room.roomCode}</div>
          <button
            className="bg-blue w-full rounded-full mb-5 py-1 text-white text-center"
            onClick={() => {
              onRoomClick(room.roomCode);
            }}
          >
            Create
          </button>
        </div>
      ))}
    </div>
  );
};

export default RoomsGallery;
