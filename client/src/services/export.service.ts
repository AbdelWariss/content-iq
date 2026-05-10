import api from "./axios";

type ExportFormat = "pdf" | "docx" | "markdown" | "txt";

const MIME_TYPES: Record<ExportFormat, string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  markdown: "text/markdown",
  txt: "text/plain",
};

const EXTENSIONS: Record<ExportFormat, string> = {
  pdf: "pdf",
  docx: "docx",
  markdown: "md",
  txt: "txt",
};

async function parseErrorBlob(blob: Blob): Promise<string | null> {
  try {
    const text = await blob.text();
    const json = JSON.parse(text) as { error?: { message?: string } };
    return json?.error?.message ?? null;
  } catch {
    return null;
  }
}

export const exportService = {
  async download(contentId: string, format: ExportFormat, title?: string): Promise<void> {
    const res = await api.get<Blob>(`/export/${contentId}/${format}`, { responseType: "blob" }).catch(
      async (err: unknown) => {
        const axiosErr = err as { response?: { data?: unknown } };
        if (axiosErr?.response?.data instanceof Blob) {
          const msg = await parseErrorBlob(axiosErr.response.data);
          if (msg) throw new Error(msg);
        }
        throw err;
      },
    );

    const blob = new Blob([res.data], { type: MIME_TYPES[format] });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(title ?? "content").replace(/[^a-zA-Z0-9\s-_]/g, "").trim()}.${EXTENSIONS[format]}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};
