import { PayloadAction, createSlice } from '@reduxjs/toolkit';

interface RootState {
  nickname: string;
}

const rootState: RootState = {
  nickname: localStorage.getItem('tt-nickname') ?? '',
};

export const rootSlice = createSlice({
  name: 'root',
  initialState: rootState,
  reducers: {
    setNickname: (state, action: PayloadAction<string>) => {
      state.nickname = action.payload;
    },
  },
});

export default rootSlice.reducer;
export const { setNickname } = rootSlice.actions;
