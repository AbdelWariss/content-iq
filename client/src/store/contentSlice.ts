import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ContentType, ContentTone, ContentLanguage, ContentLength } from "@contentiq/shared";

interface GenerationParams {
  type: ContentType;
  subject: string;
  tone: ContentTone;
  language: ContentLanguage;
  length: ContentLength;
  keywords: string[];
  audience: string;
  context: string;
  templateId?: string;
}

interface ContentState {
  isGenerating: boolean;
  streamedContent: string;
  tokensGenerated: number;
  currentParams: Partial<GenerationParams>;
  editorContent: string;
  autoSaveStatus: "idle" | "saving" | "saved" | "error";
}

const initialState: ContentState = {
  isGenerating: false,
  streamedContent: "",
  tokensGenerated: 0,
  currentParams: {
    type: "blog",
    language: "fr",
    tone: "professional",
    length: "medium",
    keywords: [],
    audience: "",
    context: "",
  },
  editorContent: "",
  autoSaveStatus: "idle",
};

const contentSlice = createSlice({
  name: "content",
  initialState,
  reducers: {
    startGeneration(state) {
      state.isGenerating = true;
      state.streamedContent = "";
      state.tokensGenerated = 0;
    },
    appendToken(state, action: PayloadAction<string>) {
      state.streamedContent += action.payload;
      state.tokensGenerated += 1;
    },
    stopGeneration(state) {
      state.isGenerating = false;
      state.editorContent = state.streamedContent;
    },
    setParams(state, action: PayloadAction<Partial<GenerationParams>>) {
      state.currentParams = { ...state.currentParams, ...action.payload };
    },
    setEditorContent(state, action: PayloadAction<string>) {
      state.editorContent = action.payload;
    },
    setAutoSaveStatus(state, action: PayloadAction<ContentState["autoSaveStatus"]>) {
      state.autoSaveStatus = action.payload;
    },
    resetEditor(state) {
      state.streamedContent = "";
      state.editorContent = "";
      state.tokensGenerated = 0;
      state.isGenerating = false;
    },
  },
});

export const {
  startGeneration,
  appendToken,
  stopGeneration,
  setParams,
  setEditorContent,
  setAutoSaveStatus,
  resetEditor,
} = contentSlice.actions;
export default contentSlice.reducer;
