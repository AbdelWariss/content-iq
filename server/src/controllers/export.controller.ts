import { PLAN_LIMITS } from "@contentiq/shared";
import { AlignmentType, Document, HeadingLevel, Packer, Paragraph, TextRun } from "docx";
import type { Request, Response } from "express";
import PDFDocument from "pdfkit";
import TurndownService from "turndown";
import { ForbiddenError, NotFoundError } from "../middleware/errorHandler.js";
import { Content } from "../models/Content.model.js";
import { getAuthUser } from "../utils/requestHelpers.js";

const turndown = new TurndownService({ headingStyle: "atx", bulletListMarker: "-" });

function paramId(req: Request): string {
  const id = req.params.id;
  return Array.isArray(id) ? id[0] : id;
}

async function getOwnedContent(contentId: string, userId: string, role: string) {
  const content = await Content.findById(contentId);
  if (!content) throw new NotFoundError("Contenu introuvable");
  if (role !== "admin" && String(content.userId) !== userId) throw new ForbiddenError();
  return content;
}

function checkExportPlan(format: string, role: string) {
  const allowed = PLAN_LIMITS[role as keyof typeof PLAN_LIMITS]?.exports ?? [];
  if (!allowed.includes(format as never)) {
    throw new ForbiddenError(
      `L'export ${format.toUpperCase()} nécessite un plan supérieur. Passez au plan Pro.`,
    );
  }
}

function htmlToPlainText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function exportPdf(req: Request, res: Response): Promise<void> {
  const { userId, role } = getAuthUser(req);
  checkExportPlan("pdf", role);

  const content = await getOwnedContent(paramId(req), userId, role);
  const plainText = htmlToPlainText(content.body);

  const doc = new PDFDocument({ margin: 60, size: "A4" });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${encodeURIComponent(content.title ?? "content")}.pdf"`,
  );

  doc.pipe(res);

  // Titre
  doc
    .font("Helvetica-Bold")
    .fontSize(20)
    .fillColor("#1a1a2e")
    .text(content.title ?? "Contenu généré", { align: "center" });

  doc.moveDown(0.5);

  // Métadonnées
  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor("#666666")
    .text(
      `Type : ${content.type} · Langue : ${content.prompt.language} · Généré le ${new Date(content.createdAt).toLocaleDateString("fr-FR")}`,
      { align: "center" },
    );

  doc.moveDown(1.5);

  // Séparateur
  doc.moveTo(60, doc.y).lineTo(535, doc.y).strokeColor("#e5e7eb").lineWidth(0.5).stroke();

  doc.moveDown(1);

  // Corps
  doc
    .font("Helvetica")
    .fontSize(11)
    .fillColor("#111827")
    .text(plainText, { lineGap: 4, paragraphGap: 8 });

  doc.moveDown(2);

  // Footer
  doc
    .fontSize(8)
    .fillColor("#9ca3af")
    .text("Généré avec CONTENT.IQ · Propulsé par Claude AI", { align: "center" });

  doc.end();
}

export async function exportDocx(req: Request, res: Response): Promise<void> {
  const { userId, role } = getAuthUser(req);
  checkExportPlan("docx", role);

  const content = await getOwnedContent(paramId(req), userId, role);
  const plainText = htmlToPlainText(content.body);
  const paragraphs = plainText.split("\n\n").filter(Boolean);

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: content.title ?? "Contenu généré",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `${content.type} · ${content.prompt.language} · ${new Date(content.createdAt).toLocaleDateString("fr-FR")}`,
                size: 18,
                color: "666666",
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 600 },
          }),
          ...paragraphs.map(
            (p) =>
              new Paragraph({
                children: [new TextRun({ text: p, size: 22 })],
                spacing: { after: 240 },
              }),
          ),
          new Paragraph({
            children: [
              new TextRun({
                text: "Généré avec CONTENT.IQ · Propulsé par Claude AI",
                size: 16,
                color: "9ca3af",
                italics: true,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 800 },
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${encodeURIComponent(content.title ?? "content")}.docx"`,
  );
  res.send(buffer);
}

export async function exportMarkdown(req: Request, res: Response): Promise<void> {
  const { userId, role } = getAuthUser(req);
  checkExportPlan("markdown", role);

  const content = await getOwnedContent(paramId(req), userId, role);
  const markdown = turndown.turndown(content.body);

  const fullMarkdown = [
    `# ${content.title ?? "Contenu généré"}`,
    "",
    `> **Type:** ${content.type} · **Langue:** ${content.prompt.language} · **Date:** ${new Date(content.createdAt).toLocaleDateString("fr-FR")}`,
    "",
    "---",
    "",
    markdown,
    "",
    "---",
    "*Généré avec CONTENT.IQ · Propulsé par Claude AI*",
  ].join("\n");

  res.setHeader("Content-Type", "text/markdown; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${encodeURIComponent(content.title ?? "content")}.md"`,
  );
  res.send(fullMarkdown);
}

export async function exportTxt(req: Request, res: Response): Promise<void> {
  const { userId, role } = getAuthUser(req);
  checkExportPlan("txt", role);

  const content = await getOwnedContent(paramId(req), userId, role);
  const plainText = htmlToPlainText(content.body);

  const fullText = [
    content.title ?? "Contenu généré",
    "=".repeat(60),
    `Type: ${content.type} | Langue: ${content.prompt.language} | Date: ${new Date(content.createdAt).toLocaleDateString("fr-FR")}`,
    "=".repeat(60),
    "",
    plainText,
    "",
    "-".repeat(60),
    "Généré avec CONTENT.IQ · Propulsé par Claude AI",
  ].join("\n");

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${encodeURIComponent(content.title ?? "content")}.txt"`,
  );
  res.send(fullText);
}
