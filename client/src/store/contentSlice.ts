import type { ContentLanguage, ContentLength, ContentTone, ContentType } from "@contentiq/shared";
import { type PayloadAction, createSlice } from "@reduxjs/toolkit";

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
  savedContentId: string | null;
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
  savedContentId: null,
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
    stopGeneration(state, action: PayloadAction<string | undefined>) {
      state.isGenerating = false;
      state.editorContent = state.streamedContent;
      if (action.payload) state.savedContentId = action.payload;
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
      state.savedContentId = null;
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
