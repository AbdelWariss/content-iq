import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import authReducer from "./authSlice";
import contentReducer from "./contentSlice";
import assistantReducer from "./assistantSlice";
import voiceReducer from "./voiceSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    content: contentReducer,
    assistant: assistantReducer,
    voice: voiceReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredPaths: ["voice.audioBlob"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <T>(selector: (state: RootState) => T): T =>
  useSelector(selector);
