import { AssistantMessageSchema, PLAN_LIMITS } from "@contentiq/shared";
import type { Request, Response } from "express";
import { AssistantSession } from "../models/AssistantSession.model.js";
import { streamAssistantChat } from "../services/assistant.service.js";
import { getAuthUser } from "../utils/requestHelpers.js";

export async function chat(req: Request, res: Response): Promise<void> {
  const { userId, role } = getAuthUser(req);

  const parsed = AssistantMessageSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({ success: false, error: parsed.error.flatten() });
    return;
  }

  const { content, pageContext, editorSnapshot } = parsed.data;

  const planLimits = PLAN_LIMITS[role as keyof typeof PLAN_LIMITS];

  if (planLimits.assistantMessagesPerDay !== null && role !== "admin") {
    const session = await AssistantSession.findOne({ userId });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount =
      session?.messages.filter((m) => m.role === "user" && new Date(m.timestamp) >= today).length ??
      0;

    if (todayCount >= planLimits.assistantMessagesPerDay) {
      res.status(429).json({
        success: false,
        error: {
          message: `Limite de ${planLimits.assistantMessagesPerDay} messages/jour atteinte. Passez au plan Pro pour des messages illimités.`,
        },
      });
      return;
    }
  }

  let session = await AssistantSession.findOne({ userId });
  if (!session) {
    session = new AssistantSession({ userId, messages: [] });
  }

  if (pageContext) session.pageContext = pageContext;
  if (editorSnapshot) session.editorSnapshot = editorSnapshot.slice(0, 500);

  const history = session.messages.map((m) => ({ role: m.role, content: m.content }));
  session.messages.push({ role: "user", content, timestamp: new Date(), isVoice: false });

  const assistantResponse = await streamAssistantChat(
    history,
    content,
    { pageContext, editorSnapshot },
    res,
  );

  if (assistantResponse) {
    session.messages.push({
      role: "assistant",
      content: assistantResponse,
      timestamp: new Date(),
      isVoice: false,
    });
  }

  if (session.messages.length > 100) {
    session.messages = session.messages.slice(-100);
  }

  await session.save();
}

export async function getSession(req: Request, res: Response): Promise<void> {
  const { userId } = getAuthUser(req);
  const session = await AssistantSession.findOne({ userId }).select("-__v");
  res.json({
    success: true,
    data: session
      ? { messages: session.messages, sessionId: String(session._id) }
      : { messages: [] },
  });
}

export async function clearSession(req: Request, res: Response): Promise<void> {
  const { userId } = getAuthUser(req);
  await AssistantSession.deleteOne({ userId });
  res.json({ success: true });
}
