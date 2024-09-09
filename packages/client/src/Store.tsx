import { createContext, useState } from 'react';
import type { IProps } from './components';

interface IContext {
  nickname: ReturnType<typeof useState<string | undefined>>;
}

export const Context = createContext<IContext>({} as IContext);

export const StoreProvider: React.FC<IProps> = ({ children }) => {
  const storeValue = {
    nickname: useState<string | undefined>(undefined),
  };

  return <Context.Provider value={storeValue}>{children}</Context.Provider>;
};
