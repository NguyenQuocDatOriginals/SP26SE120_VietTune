// [VI] Nhập (import) các phụ thuộc cho file.
import { describe, expect, it, vi } from 'vitest';

// [VI] Nhập (import) các phụ thuộc cho file.
import { createQAConversationService } from '@/services/qaConversationService';
// [VI] Nhập (import) các phụ thuộc cho file.
import { createQAMessageService } from '@/services/qaMessageService';
// [VI] Nhập (import) các phụ thuộc cho file.
import type { ServiceApiClient } from '@/services/serviceApiClient';

// [VI] Khai báo hàm/biểu thức hàm.
function createMockClient(): ServiceApiClient & {
// [VI] Thực thi một bước trong luồng xử lý.
  get: ReturnType<typeof vi.fn>;
// [VI] Thực thi một bước trong luồng xử lý.
  post: ReturnType<typeof vi.fn>;
// [VI] Thực thi một bước trong luồng xử lý.
  put: ReturnType<typeof vi.fn>;
// [VI] Thực thi một bước trong luồng xử lý.
} {
// [VI] Trả về kết quả từ hàm.
  return {
// [VI] Thực thi một bước trong luồng xử lý.
    get: vi.fn(),
// [VI] Thực thi một bước trong luồng xử lý.
    post: vi.fn(),
// [VI] Thực thi một bước trong luồng xử lý.
    put: vi.fn(),
// [VI] Thực thi một bước trong luồng xử lý.
  };
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Khai báo hàm/biểu thức hàm.
describe('qa services factory', () => {
// [VI] Khai báo hàm/biểu thức hàm.
  it('creates and fetches conversations with injected client', async () => {
// [VI] Khai báo biến/hằng số.
    const client = createMockClient();
// [VI] Khai báo biến/hằng số.
    const service = createQAConversationService(client);
// [VI] Khai báo biến/hằng số.
    const rows = [{ id: 'c1', userId: 'u1', title: 'Test', createdAt: '2026-01-01' }];

// [VI] Thực thi một bước trong luồng xử lý.
    client.post.mockResolvedValueOnce(undefined);
// [VI] Thực thi một bước trong luồng xử lý.
    client.get.mockResolvedValueOnce({ data: rows });

// [VI] Thực thi một bước trong luồng xử lý.
    await service.createQAConversation(rows[0]);
// [VI] Khai báo biến/hằng số.
    const result = await service.fetchUserConversations('u1');

// [VI] Thực thi một bước trong luồng xử lý.
    expect(client.post).toHaveBeenCalledWith('/QAConversation', rows[0]);
// [VI] Thực thi một bước trong luồng xử lý.
    expect(client.get).toHaveBeenCalledWith('/QAConversation/get-by-user', {
// [VI] Thực thi một bước trong luồng xử lý.
      params: { userId: 'u1' },
// [VI] Thực thi một bước trong luồng xử lý.
    });
// [VI] Thực thi một bước trong luồng xử lý.
    expect(result).toEqual(rows);
// [VI] Thực thi một bước trong luồng xử lý.
  });

// [VI] Khai báo hàm/biểu thức hàm.
  it('returns empty conversations on fetch error', async () => {
// [VI] Khai báo biến/hằng số.
    const client = createMockClient();
// [VI] Khai báo biến/hằng số.
    const service = createQAConversationService(client);
// [VI] Thực thi một bước trong luồng xử lý.
    client.get.mockRejectedValueOnce(new Error('boom'));

// [VI] Thực thi một bước trong luồng xử lý.
    await expect(service.fetchUserConversations('u1')).resolves.toEqual([]);
// [VI] Thực thi một bước trong luồng xử lý.
  });

// [VI] Khai báo hàm/biểu thức hàm.
  it('handles message APIs using injected client', async () => {
// [VI] Khai báo biến/hằng số.
    const client = createMockClient();
// [VI] Khai báo biến/hằng số.
    const service = createQAMessageService(client);
// [VI] Khai báo biến/hằng số.
    const message = {
// [VI] Thực thi một bước trong luồng xử lý.
      id: 'm1',
// [VI] Thực thi một bước trong luồng xử lý.
      conversationId: 'c1',
// [VI] Thực thi một bước trong luồng xử lý.
      role: 1,
// [VI] Thực thi một bước trong luồng xử lý.
      content: 'hello',
// [VI] Thực thi một bước trong luồng xử lý.
      createdAt: '2026-01-01',
// [VI] Thực thi một bước trong luồng xử lý.
    };

// [VI] Thực thi một bước trong luồng xử lý.
    client.post.mockResolvedValueOnce(undefined);
// [VI] Thực thi một bước trong luồng xử lý.
    client.get.mockResolvedValueOnce([message]);
// [VI] Thực thi một bước trong luồng xử lý.
    client.put.mockResolvedValue(undefined);

// [VI] Thực thi một bước trong luồng xử lý.
    await service.createQAMessage(message);
// [VI] Thực thi một bước trong luồng xử lý.
    await expect(service.fetchConversationMessages('c1')).resolves.toEqual([message]);
// [VI] Thực thi một bước trong luồng xử lý.
    await service.flagMessage('m1');
// [VI] Thực thi một bước trong luồng xử lý.
    await service.unflagMessage('m1');

// [VI] Thực thi một bước trong luồng xử lý.
    expect(client.post).toHaveBeenCalledWith('/QAMessage', message);
// [VI] Thực thi một bước trong luồng xử lý.
    expect(client.get).toHaveBeenCalledWith('/QAMessage/get-by-conversation', {
// [VI] Thực thi một bước trong luồng xử lý.
      params: { conversationId: 'c1' },
// [VI] Thực thi một bước trong luồng xử lý.
    });
// [VI] Thực thi một bước trong luồng xử lý.
    expect(client.put).toHaveBeenNthCalledWith(1, '/QAMessage/flagged', { id: 'm1' });
// [VI] Thực thi một bước trong luồng xử lý.
    expect(client.put).toHaveBeenNthCalledWith(2, '/QAMessage/unflagged', { id: 'm1' });
// [VI] Thực thi một bước trong luồng xử lý.
  });
// [VI] Thực thi một bước trong luồng xử lý.
});
