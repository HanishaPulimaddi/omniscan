import type { ReactNode } from "react";

// The LLM returns lightweight Markdown (headings, bold, lists, the occasional
// table). This renders that subset as React elements — no HTML injection, so
// nothing in the model output can execute.

function inline(text: string, key: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") && part.length > 4 ? (
      <strong key={`${key}-${i}`}>{part.slice(2, -2)}</strong>
    ) : (
      part.replace(/(^|\s)\*(?=\S)|(?<=\S)\*(\s|$)/g, "$1$2")
    )
  );
}

function cells(row: string): string[] {
  return row.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
}

export default function ReportText({ text }: { text: string }) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();
    const key = `b${i}`;

    if (!line) {
      i++;
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      const content = inline(heading[2].replace(/\*\*/g, ""), key);
      blocks.push(heading[1].length <= 2 ? <h3 key={key}>{content}</h3> : <h4 key={key}>{content}</h4>);
      i++;
      continue;
    }

    // A line that is nothing but bold text acts as a sub-heading.
    const boldOnly = line.match(/^\*\*([^*]+)\*\*:?$/);
    if (boldOnly) {
      blocks.push(<h4 key={key}>{boldOnly[1]}</h4>);
      i++;
      continue;
    }

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line)) {
      blocks.push(<hr key={key} />);
      i++;
      continue;
    }

    if (line.startsWith("|")) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        const row = lines[i].trim();
        if (!/^\|?[\s:|-]+\|?$/.test(row)) rows.push(cells(row));
        i++;
      }
      const [head, ...body] = rows;
      blocks.push(
        <div key={key} style={{ overflowX: "auto" }}>
          <table>
            {head && (
              <thead>
                <tr>{head.map((c, j) => <th key={j}>{inline(c, `${key}h${j}`)}</th>)}</tr>
              </thead>
            )}
            <tbody>
              {body.map((r, ri) => (
                <tr key={ri}>{r.map((c, j) => <td key={j}>{inline(c, `${key}r${ri}c${j}`)}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    const bullet = /^[-*•]\s+/;
    const ordered = /^\d+[.)]\s+/;
    if (bullet.test(line) || ordered.test(line)) {
      const isOrdered = ordered.test(line);
      const pattern = isOrdered ? ordered : bullet;
      const items: ReactNode[] = [];
      while (i < lines.length && pattern.test(lines[i].trim())) {
        const item = lines[i].trim().replace(pattern, "");
        items.push(<li key={i}>{inline(item, `${key}l${i}`)}</li>);
        i++;
      }
      blocks.push(isOrdered ? <ol key={key}>{items}</ol> : <ul key={key}>{items}</ul>);
      continue;
    }

    blocks.push(<p key={key}>{inline(line, key)}</p>);
    i++;
  }

  return <div className="prose">{blocks}</div>;
}
