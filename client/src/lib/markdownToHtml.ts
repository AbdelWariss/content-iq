/** Convert basic markdown to HTML for content generated before the HTML system prompt. */
export function markdownToHTML(text: string): string {
  if (!text) return text;
  if (/<(p|h[1-6]|ul|ol|li|strong|em|br)\b/.test(text)) return text; // already HTML

  const html = text
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/__(.+?)__/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/_(.+?)_/g, "<em>$1</em>");

  const lines = html.split("\n");
  const out: string[] = [];
  let inList = false;

  for (const raw of lines) {
    const line = raw.trimEnd();
    const h3 = line.match(/^###\s+(.+)/);
    const h2 = line.match(/^##\s+(.+)/);
    const h1 = line.match(/^#\s+(.+)/);
    const li = line.match(/^[\s]*[-*+]\s+(.+)/);
    const oli = line.match(/^[\s]*\d+\.\s+(.+)/);

    if (h1) {
      if (inList) {
        out.push("</ul>");
        inList = false;
      }
      out.push(`<h1>${h1[1]}</h1>`);
    } else if (h2) {
      if (inList) {
        out.push("</ul>");
        inList = false;
      }
      out.push(`<h2>${h2[1]}</h2>`);
    } else if (h3) {
      if (inList) {
        out.push("</ul>");
        inList = false;
      }
      out.push(`<h3>${h3[1]}</h3>`);
    } else if (li || oli) {
      if (!inList) {
        out.push("<ul>");
        inList = true;
      }
      out.push(`<li>${(li ?? oli)![1]}</li>`);
    } else if (!line.trim()) {
      if (inList) {
        out.push("</ul>");
        inList = false;
      }
      out.push("");
    } else {
      if (inList) {
        out.push("</ul>");
        inList = false;
      }
      out.push(line);
    }
  }
  if (inList) out.push("</ul>");

  const result: string[] = [];
  let pBuffer: string[] = [];
  const flushP = () => {
    if (pBuffer.length) {
      result.push(`<p>${pBuffer.join("<br>")}</p>`);
      pBuffer = [];
    }
  };
  for (const line of out) {
    if (!line) {
      flushP();
      continue;
    }
    if (line.match(/^<(h[1-6]|ul|ol|li|\/ul|\/ol)/)) {
      flushP();
      result.push(line);
    } else {
      pBuffer.push(line);
    }
  }
  flushP();

  return result.join("\n");
}
