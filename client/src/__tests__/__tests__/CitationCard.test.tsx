import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import CitationCard from "../../components/chat/CitationCard";
import type{ Citation } from "../../types";

const mockCitations: Citation[] = [
  {
    index: 1,
    documentId: "doc-1",
    documentTitle: "Company Policy",
    excerpt: "This is an excerpt from the document...",
    similarity: 0.85,
  },
  {
    index: 2,
    documentId: "doc-2",
    documentTitle: "Employee Handbook",
    excerpt: "Another excerpt from a different document...",
    similarity: 0.72,
  },
];

describe("CitationCard", () => {
  it("renders nothing when citations is empty", () => {
    const { container } = render(
      <CitationCard citations={[]} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders citation titles", () => {
    render(<CitationCard citations={mockCitations} />);
    expect(screen.getByText(/Company Policy/)).toBeInTheDocument();
    expect(screen.getByText(/Employee Handbook/)).toBeInTheDocument();
  });

  it("renders source index numbers", () => {
    render(<CitationCard citations={mockCitations} />);
    expect(screen.getByText(/\[1\]/)).toBeInTheDocument();
    expect(screen.getByText(/\[2\]/)).toBeInTheDocument();
  });

  it("renders similarity percentages", () => {
    render(<CitationCard citations={mockCitations} />);
    expect(screen.getByText("85% match")).toBeInTheDocument();
    expect(screen.getByText("72% match")).toBeInTheDocument();
  });

  it("shows cached badge when fromCache is true", () => {
    render(<CitationCard citations={mockCitations} fromCache={true} />);
    expect(screen.getByText(/cached response/i)).toBeInTheDocument();
  });

  it("does not show cached badge when fromCache is false", () => {
    render(<CitationCard citations={mockCitations} fromCache={false} />);
    expect(screen.queryByText(/cached response/i)).not.toBeInTheDocument();
  });

  it("renders excerpt text", () => {
    render(<CitationCard citations={mockCitations} />);
    expect(
      screen.getByText(/This is an excerpt from the document/)
    ).toBeInTheDocument();
  });
});