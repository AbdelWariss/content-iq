import { type PayloadAction, createSlice } from "@reduxjs/toolkit";

type VoiceStatus = "idle" | "listening" | "processing" | "error" | "unsupported";

interface VoiceState {
  status: VoiceStatus;
  transcript: string;
  lastCommand?: string;
  lastCommandSuccess?: boolean;
  isTtsSpeaking: boolean;
  isMuted: boolean;
  permissionGranted: boolean;
}

const initialState: VoiceState = {
  status: "idle",
  transcript: "",
  isTtsSpeaking: false,
  isMuted: false,
  permissionGranted: false,
};

const voiceSlice = createSlice({
  name: "voice",
  initialState,
  reducers: {
    setStatus(state, action: PayloadAction<VoiceStatus>) {
      state.status = action.payload;
    },
    setTranscript(state, action: PayloadAction<string>) {
      state.transcript = action.payload;
    },
    setLastCommand(state, action: PayloadAction<{ command: string; success: boolean }>) {
      state.lastCommand = action.payload.command;
      state.lastCommandSuccess = action.payload.success;
    },
    setTtsSpeaking(state, action: PayloadAction<boolean>) {
      state.isTtsSpeaking = action.payload;
    },
    toggleMute(state) {
      state.isMuted = !state.isMuted;
    },
    setPermissionGranted(state, action: PayloadAction<boolean>) {
      state.permissionGranted = action.payload;
    },
    resetVoice(state) {
      state.status = "idle";
      state.transcript = "";
    },
  },
});

export const {
  setStatus,
  setTranscript,
  setLastCommand,
  setTtsSpeaking,
  toggleMute,
  setPermissionGranted,
  resetVoice,
} = voiceSlice.actions;
export default voiceSlice.reducer;
