import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { TTSParser } from '@client/src/TTSParser';
import { Button, DragDropLoader, Input, JsonTextArea, useToast } from '@components';
import { GameService } from '@services';
import type { GameDto, UpdateGameDto } from '@shared/dto/games';
import type { SimulationStateSave } from '@shared/dto/states';
import { isURL } from '@shared/utils';

export const CreateGame = () => {
  const navigate = useNavigate();
  const { gameCode } = useParams();
  const newGame = !gameCode;

  const { addToast } = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [content, setContent] = useState<string | null>(null);

  const [game, setGame] = useState<GameDto | null>(null);

  const setGameValues = useCallback((game: GameDto) => {
    setName(game.name);
    setDescription(game.description);
    setBannerUrl(game.bannerUrl);
    setContent(JSON.stringify(JSON.parse(game.content), null, 2));
  }, []);

  useEffect(() => {
    if (gameCode) {
      GameService.getGame(gameCode)
        .then(game => {
          setGame(game);
          setGameValues(game);
        })
        .catch(e => addToast(`Failed to load games: ${e}`));
    }
  }, []);

  const parseGameText = (text: string): SimulationStateSave => {
    const ttsGame = TTSParser.parse(text);
    if (ttsGame) {
      return ttsGame;
    }
    return JSON.parse(text) as SimulationStateSave;
  };

  const onFileLoad = (file: File) => {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = result => {
      const text = result?.target?.result as string;
      setContent(JSON.stringify(parseGameText(text), null, 2));
    };
  };

  const validateInputs = () => {
    const validBanner = bannerUrl == undefined || bannerUrl == '' || isURL(bannerUrl);
    if (!validBanner) addToast('Banner URL should be a valid URL');

    const validName = name != undefined && name != '';
    if (!validName) addToast('Name field is required');

    const validDescription = description != undefined && description != '';
    if (!validDescription) addToast('Description field is required');

    const validContent = content != undefined && content != '';
    if (!validContent) addToast('Content field is required');

    return validBanner && validName && validDescription && validContent;
  };

  const onCreate = (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!validateInputs()) return;
    if (!content) {
      addToast('Invalid input');
      return;
    }

    GameService.createGame({ name, description, bannerUrl, content })
      .then(() => {
        navigate('/games');
      })
      .catch(e => addToast(`Failed create a game: ${e}`));
  };

  const onModify = (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!validateInputs()) return;
    if (!content || !gameCode || !game) {
      addToast('Invalid input');
      return;
    }

    const updatedContent: UpdateGameDto = {};
    if (name !== game.name) updatedContent.name = name;
    if (description !== game.description) updatedContent.description = description;
    if (bannerUrl !== game.bannerUrl) updatedContent.bannerUrl = bannerUrl;
    if (content !== game.content) updatedContent.content = content;

    if (Object.keys(updatedContent).length > 0) {
      GameService.modifyGame(gameCode, updatedContent)
        .then(() => navigate('/games'))
        .catch(e => addToast(`Failed to modify a game: ${e}`));
    } else {
      navigate('/games');
    }
  };

  const onReset = (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (game) setGameValues(game);
  };

  return (
    <div className="flex justify-center w-full mb-5">
      <div className="bg-light-blue p-11 w-[1000px]">
        <h4 className="text-center !text-2xl !font-bold mb-6">{newGame ? 'Add game' : 'Modify game'}</h4>
        <div className="p-3">
          <Input
            label="Name"
            placeholder="Name"
            required
            value={name}
            onChange={e => setName((e.target as HTMLInputElement).value)}
          />
          <Input
            label="Description"
            placeholder="Description"
            required
            value={description}
            onChange={e => setDescription((e.target as HTMLInputElement).value)}
          />
          <Input
            label="Banner"
            placeholder="Banner"
            value={bannerUrl}
            onChange={e => setBannerUrl((e.target as HTMLInputElement).value)}
            valitaion={value => value == undefined || value == '' || (typeof value == 'string' && isURL(value))}
          />
          {content ? (
            <JsonTextArea jsonContent={content} setJsonContent={setContent} />
          ) : (
            <DragDropLoader onFileLoad={onFileLoad} acceptedFileTypes="application/JSON" />
          )}
          <div className="mt-3 flex justify-center">
            {newGame ? (
              <Button onClick={e => onCreate(e)}>
                <p className="font-bold uppercase tracking-wide text-sm">Create</p>
              </Button>
            ) : (
              <>
                <Button className="mr-2" onClick={e => onReset(e)}>
                  <p className="font-bold uppercase tracking-wide text-sm">Reset</p>
                </Button>
                <Button className="mr-2" onClick={e => onModify(e)}>
                  <p className="font-bold uppercase tracking-wide text-sm">Modify</p>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
