import type IProps from '@components/IProps';
import type { FC } from 'react';
import { createContext, useState } from 'react';

interface IContext {
  nickname: ReturnType<typeof useState<string | undefined>>;
}

export const Context = createContext<IContext>({} as IContext);

export const StoreProvider: FC<IProps> = ({ children }) => {
  const storeValue = {
    nickname: useState<string | undefined>(undefined),
  };

  return <Context.Provider value={storeValue}>{children}</Context.Provider>;
};
