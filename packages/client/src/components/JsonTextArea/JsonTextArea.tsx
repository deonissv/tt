import { useState } from 'react';

export interface JsonTextAreaProps {
  jsonContent: string;
  setJsonContent: (content: string) => void;
}

export const JsonTextArea: React.FC<JsonTextAreaProps> = ({ jsonContent, setJsonContent }) => {
  const [isValid, setIsValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const handleJsonChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = event.target.value;
    setJsonContent(content);

    try {
      if (content.trim() !== '') {
        JSON.parse(content);
        setIsValid(true);
        setErrorMessage('');
      } else {
        setIsValid(true);
        setErrorMessage('');
      }
    } catch (error: unknown) {
      setIsValid(false);
      setErrorMessage((error as Error).message);
    }
  };

  return (
    <div className="w-full mx-auto">
      <textarea
        className="w-full  h-96 p-2 m-0 rounded-lg border-none outline-2 outline-dashed outline-gray-300 focus:outline-gray-400"
        value={jsonContent}
        onChange={e => handleJsonChange(e)}
      />
      {!isValid && <div className="text-red text-sm font-bold p-0 m-0">{errorMessage}</div>}
    </div>
  );
};
