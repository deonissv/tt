import type { FC, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

import type { GamePreviewDto } from '@shared/dto/games';
interface Props {
  games: GamePreviewDto[];
  onGameClick: (code: string) => void;
}

const GamesGallery: FC<Props> = ({ games, onGameClick }): ReactNode => {
  const navigate = useNavigate();

  return (
    <div className="inline-block">
      {games.map(game => (
        <div
          key={game.code}
          className="w-24 m-1 p-3 text-center border-solid rounded border-black hover:border-2 float-left"
        >
          <img src={game.bannerUrl ?? 'https://www.svgrepo.com/show/126178/question-mark.svg'} alt={game.name} />
          <div>{game.name}</div>
          <button
            className="bg-blue w-full rounded-full mb-5 py-1 text-white text-center"
            onClick={() => {
              onGameClick(game.code);
            }}
          >
            Create
          </button>
        </div>
      ))}
      <div
        className="w-24 mt-3 text-center cursor-pointer border-c-black hover:border-1 float-left"
        onClick={() => {
          navigate('/new');
        }}
      >
        <img src="https://www.svgrepo.com/show/2087/plus.svg"></img>
        <div className="mt-2">New</div>
      </div>
    </div>
  );
};

export default GamesGallery;
