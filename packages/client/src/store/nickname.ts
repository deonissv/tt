import { PayloadAction, createSlice } from '@reduxjs/toolkit';

export interface NicknameState {
  nickname: string;
}

const initialState: NicknameState = {
  nickname: '',
};

export const nicknameSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    setNickname: (state, action: PayloadAction<string>) => {
      state.nickname = action.payload;
    },
  },
});

export default nicknameSlice.reducer;
export const { setNickname } = nicknameSlice.actions;
