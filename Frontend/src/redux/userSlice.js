import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userState: false,
  userData: null
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserData: (state, action) => {
      state.userState = true;
      state.userData = action.payload;
    },
    logout: (state) => {
      state.userState = false;
      state.userData = null;
    }
  }
});

export const { setUserData, logout } = userSlice.actions;
export default userSlice.reducer;