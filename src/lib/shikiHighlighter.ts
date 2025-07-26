import { createHighlighter, type Highlighter } from "shiki";

let highlighterInstance: Highlighter | null = null;

export async function getShikiHighlighter(): Promise<Highlighter> {
  if (!highlighterInstance) {
    highlighterInstance = await createHighlighter({
      themes: ["github-dark", "github-light"],
      langs: [
        "javascript",
        "typescript",
        "html",
        "css",
        "json",
        "yaml",
        "bash",
        "shell",
        "jsx",
        "tsx",
        "astro",
        "python",
        "go",
        "rust",
        "java",
        "php",
        "sql",
        "text",
      ],
    });
  }
  return highlighterInstance;
}