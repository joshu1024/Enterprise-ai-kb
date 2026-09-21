import { describe, it, expect } from "vitest";
import authReducer, { logout, clearError } from "../store/slices/authSlice";

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

describe("authSlice", () => {
  it("returns initial state", () => {
    expect(authReducer(undefined, { type: "unknown" })).toMatchObject({
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,
    });
  });

  it("logout clears user and token", () => {
    const loggedInState = {
      ...initialState,
      user: { id: "1", name: "Josh", email: "josh@test.com", role: "admin" as const, organizationId: "org1", organizationName: "Test Org" },
      token: "test-token",
      isAuthenticated: true,
    };

    const result = authReducer(loggedInState, logout());
    expect(result.user).toBeNull();
    expect(result.token).toBeNull();
    expect(result.isAuthenticated).toBe(false);
  });

  it("clearError sets error to null", () => {
    const stateWithError = { ...initialState, error: "Login failed" };
    const result = authReducer(stateWithError, clearError());
    expect(result.error).toBeNull();
  });

  it("login pending sets loading true", () => {
    const result = authReducer(initialState, { type: "auth/login/pending" });
    expect(result.loading).toBe(true);
    expect(result.error).toBeNull();
  });

  it("login fulfilled sets user and token", () => {
    const result = authReducer(initialState, {
      type: "auth/login/fulfilled",
      payload: {
        token: "abc123",
        user: {
          id: "1",
          name: "Josh",
          email: "josh@test.com",
          role: "admin",
          organizationId: "org1",
          organizationName: "Test Org",
        },
      },
    });
    expect(result.isAuthenticated).toBe(true);
    expect(result.token).toBe("abc123");
    expect(result.user?.name).toBe("Josh");
    expect(result.loading).toBe(false);
  });

  it("login rejected sets error", () => {
    const result = authReducer(initialState, {
      type: "auth/login/rejected",
      payload: "Invalid credentials.",
    });
    expect(result.error).toBe("Invalid credentials.");
    expect(result.loading).toBe(false);
    expect(result.isAuthenticated).toBe(false);
  });
});