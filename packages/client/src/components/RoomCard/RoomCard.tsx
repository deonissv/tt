interface RoomCardProps {
  room: {
    roomCode: string;
  };
  onCreateRoom: (roomCode: string) => Promise<void>;
  onRemoveRoom: (roomCode: string) => Promise<void>;
}

export const RoomCard: React.FC<RoomCardProps> = ({ room, onCreateRoom, onRemoveRoom }): React.ReactNode => {
  return (
    <div className="flex items-center w-full m-1 p-3 border-2 rounded-xl border-gray-500" key={room.roomCode}>
      <img
        src="https://chvmpionmind.com/wp-content/uploads/2022/09/Crecimiento-personal.png"
        alt="Profile"
        className="w-[15%] h-[100px] object-cover border-2 mr-8"
      />
      <div className="flex flex-col w-[65%]">
        <h2>Name</h2>
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
