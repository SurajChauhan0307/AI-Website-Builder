import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  userData: null,
  isLoggedIn: false,
}

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserData: (state, action) => {
      if (action.payload) {
        state.userData = action.payload;
        state.isLoggedIn = true;
      }
    },
    clearUserData: (state) => {
      state.userData = null;
      state.isLoggedIn = false;
    },
  },
})

export const { setUserData, clearUserData } = userSlice.actions
export default userSlice.reducer