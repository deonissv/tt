import VideogameAssetIcon from '@mui/icons-material/VideogameAsset';
import type { RoomPreviewDto } from '@shared/dto/rooms';
import { isURL } from '@shared/utils';

interface RoomCardProps {
  room: RoomPreviewDto;
  onCreateRoom: (roomCode: string) => Promise<void>;
  onRemoveRoom: (roomCode: string) => Promise<void>;
}

export const RoomCard: React.FC<RoomCardProps> = ({ room, onCreateRoom, onRemoveRoom }): React.ReactNode => {
  return (
    <div className="flex items-center w-full m-1 p-3 border-2 rounded-xl border-gray-500" key={room.roomCode}>
      <div className="w-[15%] h-[100px] object-cover">
        {isURL(room.gameBannerUrl) ? (
          <img
            src={room.gameBannerUrl ?? 'https://www.svgrepo.com/show/126178/question-mark.svg'}
            alt={room.gameName}
            className=" inset-0 w-full h-full object-cover p-0 m-0"
          />
        ) : (
          <VideogameAssetIcon
            sx={{
              width: '100%',
              height: '100%',
              fontSize: '5rem',
            }}
          />
        )}
      </div>

      <div className="flex flex-col w-[65%]">
        <h2>{room.gameName}</h2>
        <div>{room.roomCode}</div>
      </div>
      <div className="flex flex-col w-[20%] space-y-4">
        <button
          className="w-full bg-[#ECB365] text-black hover:font-bold text-lg uppercase font-semibold py-2 transition duration-300 ease-in-out shadow-md hover:shadow-xl"
          onClick={() => onCreateRoom(room.roomCode)}
        >
          Create
        </button>
        <button
          className="w-full bg-[#B23B3B] text-white hover:text-gray-200 font-semibold py-2 transition duration-300 ease-in-out shadow-md hover:shadow-lg"
          onClick={() => onRemoveRoom(room.roomCode)}
        >
          Delete
        </button>
      </div>
    </div>
  );
};
