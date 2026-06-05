import type { ToolResult, ToolSuccess, ToolError, ErrorCode } from "./types.js";

export function success<T>(data: T, meta?: Record<string, unknown>): ToolSuccess<T> {
  return { ok: true, data, ...(meta ? { meta } : {}) };
}

export function failure(error: string, code: ErrorCode = "UNKNOWN"): ToolError {
  return { ok: false, error, code };
}

export function toMcpContent(result: ToolResult): { type: "text"; text: string }[] {
  return [{ type: "text", text: JSON.stringify(result, null, 2) }];
}

export function requireConfig<T>(
  value: T | undefined,
  keyName: string
): { ok: true; value: T } | ToolError {
  if (value === undefined || value === "") {
    return failure(
      `Missing API key: ${keyName}. Set it in your MCP config under "env".`,
      "CONFIG_MISSING"
    );
  }
  return { ok: true, value: value as T };
}
