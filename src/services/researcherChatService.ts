// [VI] Nhập (import) các phụ thuộc cho file.
import axios from 'axios';

// [VI] Nhập (import) các phụ thuộc cho file.
import { VIETTUNE_AI_BASE_URL } from '@/config/constants';
// [VI] Nhập (import) các phụ thuộc cho file.
import { createAiApiClient } from '@/services/aiApiClient';

// [VI] Khai báo biến/hằng số.
const baseURL = VIETTUNE_AI_BASE_URL.replace(/\/$/, '');
// [VI] Khai báo biến/hằng số.
const timeout = 45000;

// [VI] Thực thi một bước trong luồng xử lý.
/** Request body for POST /api/Chat (VietTuneArchive API). Backend may expect camelCase or PascalCase. */
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export interface ChatRequest {
// [VI] Thực thi một bước trong luồng xử lý.
  message?: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
  Message?: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Thực thi một bước trong luồng xử lý.
/** Backend may return different shapes; Swagger 200 has no response schema. */
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export type ChatResponseBody =
// [VI] Thực thi một bước trong luồng xử lý.
  | {
// [VI] Thực thi một bước trong luồng xử lý.
      message?: string;
// [VI] Thực thi một bước trong luồng xử lý.
      answer?: string;
// [VI] Thực thi một bước trong luồng xử lý.
      reply?: string;
// [VI] Thực thi một bước trong luồng xử lý.
      response?: string;
// [VI] Thực thi một bước trong luồng xử lý.
      content?: string;
// [VI] Thực thi một bước trong luồng xử lý.
      text?: string;
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Thực thi một bước trong luồng xử lý.
  | {
// [VI] Thực thi một bước trong luồng xử lý.
      data?: {
// [VI] Thực thi một bước trong luồng xử lý.
        message?: string;
// [VI] Thực thi một bước trong luồng xử lý.
        answer?: string;
// [VI] Thực thi một bước trong luồng xử lý.
        reply?: string;
// [VI] Thực thi một bước trong luồng xử lý.
        response?: string;
// [VI] Thực thi một bước trong luồng xử lý.
        content?: string;
// [VI] Thực thi một bước trong luồng xử lý.
        text?: string;
// [VI] Thực thi một bước trong luồng xử lý.
      };
// [VI] Thực thi một bước trong luồng xử lý.
    };

// [VI] Thực thi một bước trong luồng xử lý.
/** Trích văn bản từ cấu trúc kiểu Gemini/Vertex (candidates[0].content.parts[0].text). */
// [VI] Khai báo hàm/biểu thức hàm.
function extractFromCandidates(data: unknown): string | null {
// [VI] Rẽ nhánh điều kiện (if).
  if (data == null || typeof data !== 'object') return null;
// [VI] Khai báo biến/hằng số.
  const obj = data as Record<string, unknown>;
// [VI] Khai báo biến/hằng số.
  const candidates = obj.candidates ?? obj.Candidates;
// [VI] Rẽ nhánh điều kiện (if).
  if (!Array.isArray(candidates) || candidates.length === 0) return null;
// [VI] Khai báo biến/hằng số.
  const first = candidates[0];
// [VI] Rẽ nhánh điều kiện (if).
  if (first == null || typeof first !== 'object') return null;
// [VI] Khai báo biến/hằng số.
  const content =
// [VI] Thực thi một bước trong luồng xử lý.
    (first as Record<string, unknown>).content ?? (first as Record<string, unknown>).Content;
// [VI] Rẽ nhánh điều kiện (if).
  if (content == null || typeof content !== 'object') return null;
// [VI] Khai báo biến/hằng số.
  const parts =
// [VI] Thực thi một bước trong luồng xử lý.
    (content as Record<string, unknown>).parts ?? (content as Record<string, unknown>).Parts;
// [VI] Rẽ nhánh điều kiện (if).
  if (!Array.isArray(parts) || parts.length === 0) return null;
// [VI] Khai báo biến/hằng số.
  const part = parts[0];
// [VI] Rẽ nhánh điều kiện (if).
  if (part == null || typeof part !== 'object') return null;
// [VI] Khai báo biến/hằng số.
  const text = (part as Record<string, unknown>).text ?? (part as Record<string, unknown>).Text;
// [VI] Rẽ nhánh điều kiện (if).
  if (typeof text === 'string' && text.trim()) return text.trim();
// [VI] Trả về kết quả từ hàm.
  return null;
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Khai báo hàm/biểu thức hàm.
function extractReply(data: unknown): string | null {
// [VI] Rẽ nhánh điều kiện (if).
  if (data == null) return null;
// [VI] Rẽ nhánh điều kiện (if).
  if (typeof data === 'string' && data.trim()) return data.trim();
// [VI] Rẽ nhánh điều kiện (if).
  if (typeof data !== 'object') return null;
// [VI] Khai báo biến/hằng số.
  const obj = data as Record<string, unknown>;
// [VI] Thực thi một bước trong luồng xử lý.
  // Ưu tiên cấu trúc candidates/content/parts/text (backend VietTune)
// [VI] Khai báo biến/hằng số.
  const fromCandidates = extractFromCandidates(obj);
// [VI] Rẽ nhánh điều kiện (if).
  if (fromCandidates) return fromCandidates;
// [VI] Khai báo biến/hằng số.
  const direct =
// [VI] Thực thi một bước trong luồng xử lý.
    obj.message ??
// [VI] Thực thi một bước trong luồng xử lý.
    obj.answer ??
// [VI] Thực thi một bước trong luồng xử lý.
    obj.reply ??
// [VI] Thực thi một bước trong luồng xử lý.
    obj.response ??
// [VI] Thực thi một bước trong luồng xử lý.
    obj.content ??
// [VI] Thực thi một bước trong luồng xử lý.
    obj.text ??
// [VI] Thực thi một bước trong luồng xử lý.
    obj.Message;
// [VI] Rẽ nhánh điều kiện (if).
  if (typeof direct === 'string' && direct.trim()) return direct.trim();
// [VI] Khai báo biến/hằng số.
  const inner = obj.data;
// [VI] Rẽ nhánh điều kiện (if).
  if (inner != null && typeof inner === 'object') return extractReply(inner);
// [VI] Trả về kết quả từ hàm.
  return null;
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Khai báo hàm/biểu thức hàm.
function stringifyProblemDetails(data: unknown): string | null {
// [VI] Rẽ nhánh điều kiện (if).
  if (data == null) return null;
// [VI] Rẽ nhánh điều kiện (if).
  if (typeof data === 'string' && data.trim()) return data.trim();
// [VI] Rẽ nhánh điều kiện (if).
  if (typeof data !== 'object') return null;
// [VI] Khai báo biến/hằng số.
  const obj = data as Record<string, unknown>;
// [VI] Khai báo biến/hằng số.
  const title = typeof obj.title === 'string' ? obj.title : null;
// [VI] Khai báo biến/hằng số.
  const detail = typeof obj.detail === 'string' ? obj.detail : null;
// [VI] Khai báo biến/hằng số.
  const errors = obj.errors;
// [VI] Rẽ nhánh điều kiện (if).
  if (errors && typeof errors === 'object') {
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
    try {
// [VI] Khai báo biến/hằng số.
      const flat = Object.entries(errors as Record<string, unknown>)
// [VI] Khai báo hàm/biểu thức hàm.
        .map(([k, v]) => {
// [VI] Khai báo hàm/biểu thức hàm.
          if (Array.isArray(v)) return `${k}: ${v.filter((x) => typeof x === 'string').join(', ')}`;
// [VI] Rẽ nhánh điều kiện (if).
          if (typeof v === 'string') return `${k}: ${v}`;
// [VI] Trả về kết quả từ hàm.
          return null;
// [VI] Thực thi một bước trong luồng xử lý.
        })
// [VI] Thực thi một bước trong luồng xử lý.
        .filter(Boolean)
// [VI] Thực thi một bước trong luồng xử lý.
        .join(' | ');
// [VI] Rẽ nhánh điều kiện (if).
      if (flat) return flat;
// [VI] Thực thi một bước trong luồng xử lý.
    } catch {
// [VI] Thực thi một bước trong luồng xử lý.
      // ignore
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Thực thi một bước trong luồng xử lý.
  }
// [VI] Trả về kết quả từ hàm.
  return detail ?? title;
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Khai báo hàm/biểu thức hàm.
function getErrorMessage(err: unknown): string {
// [VI] Rẽ nhánh điều kiện (if).
  if (axios.isAxiosError(err)) {
// [VI] Khai báo biến/hằng số.
    const data = err.response?.data;
// [VI] Khai báo biến/hằng số.
    const fromBody = extractReply(data) ?? stringifyProblemDetails(data);
// [VI] Rẽ nhánh điều kiện (if).
    if (fromBody) return fromBody;
// [VI] Khai báo biến/hằng số.
    const status = err.response?.status;
// [VI] Rẽ nhánh điều kiện (if).
    if (status === 401) return 'Cần đăng nhập để sử dụng tính năng này.';
// [VI] Rẽ nhánh điều kiện (if).
    if (status === 403) return 'Bạn không có quyền truy cập.';
// [VI] Rẽ nhánh điều kiện (if).
    if (status === 404) return 'Endpoint chat không tồn tại. Kiểm tra cấu hình backend.';
// [VI] Rẽ nhánh điều kiện (if).
    if (status && status >= 400) return `Lỗi từ server (${status}). Thử lại sau.`;
// [VI] Rẽ nhánh điều kiện (if).
    if (err.code === 'ERR_NETWORK' || err.message?.toLowerCase().includes('network'))
// [VI] Trả về kết quả từ hàm.
      return 'Không thể kết nối đến server. Kiểm tra mạng hoặc CORS (backend cần cho phép origin của bạn).';
// [VI] Thực thi một bước trong luồng xử lý.
  }
// [VI] Rẽ nhánh điều kiện (if).
  if (err instanceof Error && err.message) return err.message;
// [VI] Trả về kết quả từ hàm.
  return 'Lỗi không xác định. Thử lại sau.';
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Thực thi một bước trong luồng xử lý.
/** Payload shapes to try (backend may expect different binding). */
// [VI] Khai báo hàm/biểu thức hàm.
function buildPayloads(message: string): unknown[] {
// [VI] Khai báo biến/hằng số.
  const m = message || null;
// [VI] Trả về kết quả từ hàm.
  return [{ message: m }, { Message: m }, { request: { message: m } }, { request: { Message: m } }];
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Thực thi một bước trong luồng xử lý.
/**
// [VI] Thực thi một bước trong luồng xử lý.
 * Send a message to VietTune backend POST /api/Chat.
// [VI] Thực thi một bước trong luồng xử lý.
 * Tries multiple request body formats for compatibility. Always returns a string (reply or error message).
// [VI] Thực thi một bước trong luồng xử lý.
 */
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export async function sendResearcherChatMessage(userMessage: string): Promise<string> {
// [VI] Khai báo biến/hằng số.
  const configuredPath = (import.meta.env.VITE_VIETTUNE_AI_CHAT_PATH as string | undefined)?.trim();
// [VI] Khai báo biến/hằng số.
  const defaultPath = baseURL.toLowerCase().endsWith('/api') ? '/Chat' : '/api/Chat';
// [VI] Khai báo biến/hằng số.
  const path = configuredPath || defaultPath;
// [VI] Khai báo biến/hằng số.
  const client = createAiApiClient({ baseURL, timeout });

// [VI] Khai báo biến/hằng số.
  const message = userMessage.trim();
// [VI] Khai báo biến/hằng số.
  const payloads = buildPayloads(message);
// [VI] Khai báo biến/hằng số.
  let lastError: unknown = null;

// [VI] Vòng lặp (for).
  for (const body of payloads) {
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
    try {
// [VI] Thực thi một bước trong luồng xử lý.
      // Luôn lấy body dạng text để tránh axios parse sai (backend có thể trả text/plain hoặc JSON)
// [VI] Khai báo biến/hằng số.
      const res = await client.post<string>(path, body, { responseType: 'text' });
// [VI] Khai báo biến/hằng số.
      const raw = typeof res.data === 'string' ? res.data.trim() : '';

// [VI] Rẽ nhánh điều kiện (if).
      if (raw) {
// [VI] Thực thi một bước trong luồng xử lý.
        // Thử parse JSON (backend có thể trả application/json nhưng axios trả raw khi responseType: 'text')
// [VI] Rẽ nhánh điều kiện (if).
        if (raw.startsWith('{') || raw.startsWith('[')) {
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
          try {
// [VI] Khai báo biến/hằng số.
            const parsed = JSON.parse(raw) as unknown;
// [VI] Khai báo biến/hằng số.
            const reply = extractReply(parsed);
// [VI] Rẽ nhánh điều kiện (if).
            if (reply) return reply;
// [VI] Thực thi một bước trong luồng xử lý.
          } catch {
// [VI] Thực thi một bước trong luồng xử lý.
            // Không phải JSON hợp lệ → dùng nguyên raw
// [VI] Thực thi một bước trong luồng xử lý.
          }
// [VI] Thực thi một bước trong luồng xử lý.
        }
// [VI] Trả về kết quả từ hàm.
        return raw;
// [VI] Thực thi một bước trong luồng xử lý.
      }
// [VI] Trả về kết quả từ hàm.
      return 'Bot chưa trả lời. Bạn thử đặt câu hỏi khác hoặc thử lại sau.';
// [VI] Thực thi một bước trong luồng xử lý.
    } catch (err) {
// [VI] Thực thi một bước trong luồng xử lý.
      lastError = err;
// [VI] Khai báo biến/hằng số.
      const status = axios.isAxiosError(err) ? err.response?.status : undefined;
// [VI] Rẽ nhánh điều kiện (if).
      if (status !== 400) break;
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Thực thi một bước trong luồng xử lý.
  }

// [VI] Khai báo biến/hằng số.
  const msg = getErrorMessage(lastError);
// [VI] Trả về kết quả từ hàm.
  return `${msg} (endpoint: ${baseURL}${path})`;
// [VI] Thực thi một bước trong luồng xử lý.
}
