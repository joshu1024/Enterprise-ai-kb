import { describe, it, expect } from "vitest";
import type { Citation } from "../types";

 interface SSEData {
  citations?: Citation[];
  token?: string;
  error?: string;
  fromCache?: boolean;
}
describe("citation parsing", () => {
 

const parseCitations = (data: SSEData): Citation[] | null => {
  if (data.citations) return data.citations;
  return null;
};

  it("parses citations from SSE data", () => {
    const data = {
      citations: [
        {
          index: 1,
          documentId: "doc-1",
          documentTitle: "Test Doc",
          excerpt: "Some excerpt...",
          similarity: 0.85,
        },
      ],
    };
    const result = parseCitations(data);
    expect(result).not.toBeNull();
    expect(result![0].index).toBe(1);
    expect(result![0].documentTitle).toBe("Test Doc");
    expect(result![0].similarity).toBe(0.85);
  });

  it("returns null when no citations", () => {
    const data = { token: "Hello" };
    expect(parseCitations(data)).toBeNull();
  });

  it("handles empty citations array", () => {
    const data = { citations: [] };
    const result = parseCitations(data);
    expect(result).toEqual([]);
  });
});

// Test SSE line parsing logic
describe("SSE line parsing", () => {
 const parseSSELine = (line: string): SSEData | null => {
  const trimmed = line.trim();
  if (!trimmed || trimmed === "data:[DONE]") return null;
  if (!trimmed.startsWith("data:")) return null;
  try {
    return JSON.parse(trimmed.slice(5)) as SSEData;
  } catch {
    return null;
  }
};

  it("parses token line", () => {
    const result = parseSSELine('data:{"token":"Hello"}');
    expect(result).toEqual({ token: "Hello" });
  });

  it("parses citations line", () => {
    const result = parseSSELine('data:{"citations":[]}');
    expect(result).toEqual({ citations: [] });
  });

  it("ignores DONE line", () => {
    expect(parseSSELine("data:[DONE]")).toBeNull();
  });

  it("ignores empty lines", () => {
    expect(parseSSELine("")).toBeNull();
    expect(parseSSELine("   ")).toBeNull();
  });

  it("ignores non-data lines", () => {
    expect(parseSSELine("event: message")).toBeNull();
  });

  it("handles malformed JSON gracefully", () => {
    expect(parseSSELine("data:{broken json}")).toBeNull();
  });
});

// Test message accumulation
describe("message content accumulation", () => {
  it("appends tokens correctly", () => {
    let content = "";
    const tokens = ["Hello", " ", "world", "!"];
    tokens.forEach((t) => (content += t));
    expect(content).toBe("Hello world!");
  });

  it("handles empty tokens", () => {
    let content = "existing";
    const token = "";
    if (token) content += token;
    expect(content).toBe("existing");
  });
});