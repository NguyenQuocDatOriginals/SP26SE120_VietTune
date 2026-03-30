using VietTuneArchive.Application.Common;
using VietTuneArchive.Domain.Entities;

namespace VietTuneArchive.Application.IServices
{
    public interface INotificationService
    {
        /// <summary>
        /// Gửi thông báo cho một người dùng cụ thể (Real-time + Lưu DB)
        /// </summary>
        Task<Result<Guid>> SendNotificationAsync(Guid userId, string title, string message, string type, string? relatedEntityType = null, Guid? relatedEntityId = null);

        /// <summary>
        /// Gửi thông báo cho tất cả người dùng (Real-time + Lưu DB)
        /// </summary>
        Task<Result<bool>> SendToAllAsync(string title, string message, string type);

        /// <summary>
        /// Lấy danh sách thông báo của người dùng
        /// </summary>
        Task<Result<IEnumerable<Notification>>> GetUserNotificationsAsync(Guid userId, int limit = 20);

        /// <summary>
        /// Đánh dấu thông báo đã đọc
        /// </summary>
        Task<Result<bool>> MarkAsReadAsync(Guid notificationId);

        /// <summary>
        /// Đánh dấu tất cả thông báo của người dùng là đã đọc
        /// </summary>
        Task<Result<bool>> MarkAllAsReadAsync(Guid userId);
    }
}
