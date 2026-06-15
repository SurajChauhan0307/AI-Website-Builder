import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  userData: {
    name: "",
    email: "",
    avatar: "",
    uid: "",
    credits: 0,
  },
  isLoggedIn: false,
}

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserData: (state, action) => {
      state.userData = {
        ...state.userData,
        ...action.payload,
      }
      state.isLoggedIn = true
    },

    clearUserData: (state) => {
      state.userData = {
        name: "",
        email: "",
        avatar: "",
        uid: "",
        credits: 0,
      }
      state.isLoggedIn = false
    },
  },
})

export const { setUserData, clearUserData } = userSlice.actions
export default userSlice.reducer