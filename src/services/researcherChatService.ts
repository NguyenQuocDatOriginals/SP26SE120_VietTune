import axios from "axios";
import { VIETTUNE_AI_BASE_URL } from "@/config/constants";
import { getItem } from "@/services/storageService";

const baseURL = VIETTUNE_AI_BASE_URL.replace(/\/$/, "");
const timeout = 45000;

/** Request body for POST /api/Chat (VietTuneArchive API). Backend may expect camelCase or PascalCase. */
export interface ChatRequest {
  message?: string | null;
  Message?: string | null;
}

/** Backend may return different shapes; Swagger 200 has no response schema. */
export type ChatResponseBody =
  | { message?: string; answer?: string; reply?: string; response?: string; content?: string; text?: string }
  | { data?: { message?: string; answer?: string; reply?: string; response?: string; content?: string; text?: string } };

function extractReply(data: unknown): string | null {
  if (data == null) return null;
  if (typeof data === "string" && data.trim()) return data.trim();
  if (typeof data !== "object") return null;
  const obj = data as Record<string, unknown>;
  const direct =
    obj.message ?? obj.answer ?? obj.reply ?? obj.response ?? obj.content ?? obj.text ?? obj.Message;
  if (typeof direct === "string" && direct.trim()) return direct.trim();
  const inner = obj.data;
  if (inner != null && typeof inner === "object") return extractReply(inner);
  return null;
}

function stringifyProblemDetails(data: unknown): string | null {
  if (data == null) return null;
  if (typeof data === "string" && data.trim()) return data.trim();
  if (typeof data !== "object") return null;
  const obj = data as Record<string, unknown>;
  const title = typeof obj.title === "string" ? obj.title : null;
  const detail = typeof obj.detail === "string" ? obj.detail : null;
  const errors = obj.errors;
  if (errors && typeof errors === "object") {
    try {
      const flat = Object.entries(errors as Record<string, unknown>)
        .map(([k, v]) => {
          if (Array.isArray(v)) return `${k}: ${v.filter((x) => typeof x === "string").join(", ")}`;
          if (typeof v === "string") return `${k}: ${v}`;
          return null;
        })
        .filter(Boolean)
        .join(" | ");
      if (flat) return flat;
    } catch {
      // ignore
    }
  }
  return detail ?? title;
}

function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data;
    const fromBody = extractReply(data) ?? stringifyProblemDetails(data);
    if (fromBody) return fromBody;
    const status = err.response?.status;
    if (status === 401) return "Cần đăng nhập để sử dụng tính năng này.";
    if (status === 403) return "Bạn không có quyền truy cập.";
    if (status === 404) return "Endpoint chat không tồn tại. Kiểm tra cấu hình backend.";
    if (status && status >= 400) return `Lỗi từ server (${status}). Thử lại sau.`;
    if (err.code === "ERR_NETWORK" || err.message?.toLowerCase().includes("network")) return "Không thể kết nối đến server. Kiểm tra mạng hoặc CORS (backend cần cho phép origin của bạn).";
  }
  if (err instanceof Error && err.message) return err.message;
  return "Lỗi không xác định. Thử lại sau.";
}

/** Payload shapes to try (backend may expect different binding). */
function buildPayloads(message: string): unknown[] {
  const m = message || null;
  return [
    { message: m },
    { Message: m },
    { request: { message: m } },
    { request: { Message: m } },
  ];
}

/**
 * Send a message to VietTune backend POST /api/Chat.
 * Tries multiple request body formats for compatibility. Always returns a string (reply or error message).
 */
export async function sendResearcherChatMessage(userMessage: string): Promise<string> {
  const configuredPath = (import.meta.env.VITE_VIETTUNE_AI_CHAT_PATH as string | undefined)?.trim();
  const defaultPath = baseURL.toLowerCase().endsWith("/api") ? "/Chat" : "/api/Chat";
  const path = configuredPath || defaultPath;
  const token = getItem("access_token");
  const client = axios.create({
    baseURL,
    timeout,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const message = userMessage.trim();
  const payloads = buildPayloads(message);
  let lastError: unknown = null;

  for (const body of payloads) {
    try {
      const res = await client.post<ChatResponseBody>(path, body);
      const reply = extractReply(res.data);
      if (reply) return reply;
      const ct = typeof res.headers?.["content-type"] === "string" ? res.headers["content-type"] : "";
      return `Server trả ${res.status} nhưng không có nội dung trả lời (endpoint: ${baseURL}${path}${ct ? `, content-type: ${ct}` : ""}).`;
    } catch (err) {
      lastError = err;
      const status = axios.isAxiosError(err) ? err.response?.status : undefined;
      if (status !== 400) break;
    }
  }

  const msg = getErrorMessage(lastError);
  return `${msg} (endpoint: ${baseURL}${path})`;
}
