import { combineReducers, configureStore } from "@reduxjs/toolkit";
import userSlice from "./userSlice"; // Your perfect slice

import {
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import baseStorage from 'redux-persist/lib/storage';

// 1. Safe-guard against Bundler/SSR quirks where default exports get nested
const storage = baseStorage && baseStorage.default ? baseStorage.default : baseStorage;

const persistConfig = {
  key: 'ai-website-builder',
  version: 1,
  storage, // ✅ Now guaranteed to have getItem/setItem methods
};

const rootReducer = combineReducers({
  user: userSlice,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export default store;