// import { configureStore } from "@reduxjs/toolkit";
// import userSlice from "./userSlice";

// const store = configureStore({
//     reducer: {
//         user: userSlice
//     }
// });

// export default store;


import { configureStore, combineReducers } from "@reduxjs/toolkit";

import {
  persistStore,
  persistReducer,
} from "redux-persist";

import storage from "redux-persist/lib/storage";

import userReducer from "./userSlice";
import userSlice from "./userSlice";

const rootReducer = combineReducers({
  user: userSlice
});

const persistConfig = {
  key: "Promptic-ai",
   storage:storage.default,
};

const persistedReducer = persistReducer(
  persistConfig,
  rootReducer
);

export const store = configureStore({
  reducer: persistedReducer,

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);