import type{ Citation } from "../../types";
import { Badge } from "../ui/badge";

interface Props {
  citations: Citation[];
  fromCache?: boolean;
}

export default function CitationCard({ citations, fromCache }: Props) {
  if (!citations || citations.length === 0) return null;

  return (
    <div className="mt-2 space-y-1.5">
      {fromCache && (
        <Badge variant="secondary" className="text-xs mb-1">
          Cached response
        </Badge>
      )}
      <p className="text-xs text-muted-foreground font-medium">Sources</p>
      {citations.map((c) => (
        <div
          key={c.index}
          className="text-xs border rounded-md p-2 bg-muted/40"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium text-foreground">
              [{c.index}] {c.documentTitle}
            </span>
            <Badge variant="outline" className="text-xs">
              {Math.round(c.similarity * 100)}% match
            </Badge>
          </div>
          <p className="text-muted-foreground line-clamp-2">{c.excerpt}</p>
        </div>
         ))}
    </div>
  );
}