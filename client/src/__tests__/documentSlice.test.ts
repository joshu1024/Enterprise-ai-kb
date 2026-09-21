import { describe, it, expect } from "vitest";
import documentReducer, { clearError } from "../store/slices/documentSlice";
import  {
  fetchDocuments,
  uploadDocument,
  
} from "../store/slices/documentSlice";

const initialState = {
  documents: [],
  loading: false,
  uploading: false,
  error: null,
};

describe("documentSlice", () => {
  it("returns initial state", () => {
    expect(documentReducer(undefined, { type: "unknown" })).toEqual(initialState);
  });

  it("clearError sets error to null", () => {
    const stateWithError = { ...initialState, error: "Upload failed" };
    const result = documentReducer(stateWithError, clearError());
    expect(result.error).toBeNull();
  });

 it("fetchDocuments pending sets loading true", () => {
  const result = documentReducer(
    initialState,
    fetchDocuments.pending("", undefined)
  );
  expect(result.loading).toBe(true);
});

  it("fetchDocuments fulfilled sets documents", () => {
    const docs = [
      {
        id: "1",
        title: "Test Doc",
        fileType: "text/plain",
        status: "ready" as const,
        chunkCount: 3,
        uploadedById: "user1",
        createdAt: new Date().toISOString(),
      },
    ];

    const result = documentReducer(initialState, {
      type: "documents/fetchAll/fulfilled",
      payload: docs,
    });

    expect(result.documents).toEqual(docs);
    expect(result.loading).toBe(false);
  });

  it("fetchDocuments rejected sets error", () => {
    const result = documentReducer(initialState, {
      type: "documents/fetchAll/rejected",
      payload: "Failed to fetch documents",
    });
    expect(result.error).toBe("Failed to fetch documents");
    expect(result.loading).toBe(false);
  });

 it("upload pending sets uploading true", () => {
  const result = documentReducer(
    initialState,
    uploadDocument.pending("", { file: new File([], "test.txt"), title: "test" })
  );
  expect(result.uploading).toBe(true);
  expect(result.error).toBeNull();
});

  it("upload fulfilled sets uploading false", () => {
    const uploadingState = { ...initialState, uploading: true };
    const result = documentReducer(uploadingState, {
      type: "documents/upload/fulfilled",
      payload: true,
    });
    expect(result.uploading).toBe(false);
  });

  it("upload rejected sets error", () => {
    const result = documentReducer(initialState, {
      type: "documents/upload/rejected",
      payload: "Upload failed",
    });
    expect(result.error).toBe("Upload failed");
    expect(result.uploading).toBe(false);
  });
});