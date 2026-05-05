import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  isVoice?: boolean;
}

interface AssistantState {
  isOpen: boolean;
  messages: Message[];
  isStreaming: boolean;
  msgsToday: number;
  sessionId?: string;
}

const initialState: AssistantState = {
  isOpen: false,
  messages: [],
  isStreaming: false,
  msgsToday: 0,
};

const assistantSlice = createSlice({
  name: "assistant",
  initialState,
  reducers: {
    toggleOpen(state) {
      state.isOpen = !state.isOpen;
    },
    setOpen(state, action: PayloadAction<boolean>) {
      state.isOpen = action.payload;
    },
    addMessage(state, action: PayloadAction<Omit<Message, "id" | "timestamp">>) {
      state.messages.push({
        ...action.payload,
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
      });
      if (action.payload.role === "user") {
        state.msgsToday += 1;
      }
    },
    setStreaming(state, action: PayloadAction<boolean>) {
      state.isStreaming = action.payload;
    },
    appendToLastMessage(state, action: PayloadAction<string>) {
      const last = state.messages[state.messages.length - 1];
      if (last?.role === "assistant") {
        last.content += action.payload;
      }
    },
    clearSession(state) {
      state.messages = [];
      state.sessionId = undefined;
    },
    setSessionId(state, action: PayloadAction<string>) {
      state.sessionId = action.payload;
    },
    setMsgsToday(state, action: PayloadAction<number>) {
      state.msgsToday = action.payload;
    },
  },
});

export const {
  toggleOpen,
  setOpen,
  addMessage,
  setStreaming,
  appendToLastMessage,
  clearSession,
  setSessionId,
  setMsgsToday,
} = assistantSlice.actions;
export default assistantSlice.reducer;
