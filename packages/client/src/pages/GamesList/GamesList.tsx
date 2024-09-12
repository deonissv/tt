import { useCallback, useEffect, useState } from 'react';

import { getErrorMsg } from '@client/src/utils';
import { GameCard, PromiseModal, Spinner, useToast } from '@components';
import { GameService, RoomService } from '@services';
import type { GamePreviewDto } from '@shared/dto/games';
import { useNavigate } from 'react-router-dom';

export const GamesList = () => {
  const { addToast } = useToast();

  const [games, setGames] = useState<GamePreviewDto[] | null>(null);
  const navigate = useNavigate();

  const { openModal, Modal } = PromiseModal({
    title: 'Confirm Delete',
    message: 'Are you sure you want to delete this game?',
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
  });

  const loadGamesPreviews = useCallback(async () => {
    const gamePreviews = await GameService.getGamePreviews();
    setGames(gamePreviews);
  }, []);

  useEffect(() => {
    loadGamesPreviews().catch(e => addToast(`Error loading game previews: ${e}`));
  }, []);

  const onCreateRoom = async (gameCode: string) => {
    try {
      const roomId = await RoomService.createRoom(gameCode);

      navigate(`/room/${roomId}`);
    } catch (e) {
      addToast(`Failed to create room: ${getErrorMsg(e)}`);
    }
  };

  const onRemoveGame = async (gameCode: string) => {
    const confirmed = await openModal();
    if (!confirmed) return;
    try {
      await GameService.deleteGame(gameCode);
      await loadGamesPreviews().catch(e => addToast(`Failed to load game preview: ${getErrorMsg(e)}`));
    } catch (e) {
      addToast(`Failed to delete game: ${getErrorMsg(e)}`);
    }
  };

  const onEditGame = (gameCode: string) => {
    navigate(`/games/${gameCode}`);
  };

  const onNewGame = () => {
    navigate('/games/new');
  };

  return (
    <div className="flex justify-center w-full">
      <div className="w-[1000px] grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-16 bg-bgblue text-white">
        {games ? (
          games.map(game => (
            <GameCard
              key={game.code}
              game={game}
              onCreateRoom={onCreateRoom}
              onEditGame={onEditGame}
              onRemoveGame={onRemoveGame}
            />
          ))
        ) : (
          <Spinner />
        )}

        <div
          className="aspect-[2/3] p-4 text-center border border-dashed border-gray-500 rounded-lg bg-gray-800 hover:bg-gray-700 transition duration-300 shadow-lg hover:shadow-xl cursor-pointer flex flex-col items-center justify-center"
          onClick={onNewGame}
        >
          <img className="w-28 mb-4" src="https://www.svgrepo.com/show/218190/add-plus.svg" alt="Add New" />
          <div className="text-xl font-semibold">New</div>
        </div>

        <Modal />
      </div>
    </div>
  );
};
