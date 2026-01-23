import { useEffect, useState, FormEvent } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { Target, Users, Heart, FileText, Trash2, AlertTriangle, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { ModerationStatus, User } from "@/types";
import toast from "react-hot-toast";
import { authService } from "@/services/authService";
import { migrateVideoDataToVideoData } from "@/utils/helpers";
import type { LocalRecording } from "@/pages/ApprovedRecordingsPage";
import BackButton from "@/components/common/BackButton";

// Extended type for local recording storage (supports both legacy and new formats)
type LocalRecordingStorage = LocalRecording & {
  uploadedAt?: string; // Legacy field
  moderation?: LocalRecording['moderation'] & {
    rejectionNote?: string;
  };
};

// Hàm dịch trạng thái sang tiếng Việt (giống ModerationPage)
const getStatusLabel = (status?: ModerationStatus | string): string => {
  if (!status) return "Không xác định";

  switch (status) {
    case ModerationStatus.PENDING_REVIEW:
    case "PENDING_REVIEW":
      return "Đang chờ được kiểm duyệt";
    case ModerationStatus.IN_REVIEW:
    case "IN_REVIEW":
      return "Đang được kiểm duyệt";
    case ModerationStatus.APPROVED:
    case "APPROVED":
      return "Đã được kiểm duyệt";
    case ModerationStatus.REJECTED:
    case "REJECTED":
      return "Đã bị từ chối";
    case ModerationStatus.TEMPORARILY_REJECTED:
    case "TEMPORARILY_REJECTED":
      return "Tạm thời bị từ chối";
    default:
      return String(status);
  }
};

interface LocalRecordingMini {
  id?: string;
  title?: string;
  basicInfo?: {
    title?: string;
    artist?: string;
    genre?: string;
  };
  uploadedAt?: string;
  uploader?: { id?: string; username?: string };
  moderation?: { 
    status?: ModerationStatus | string; 
    claimedByName?: string;
    rejectionNote?: string;
  };
}

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const navigate = useNavigate();
  const [contributions, setContributions] = useState<LocalRecordingMini[]>([]);
  const [showDeleteMetadataConfirm, setShowDeleteMetadataConfirm] = useState(false);

  // Edit profile modal state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [formFullName, setFormFullName] = useState("");
  const [formUsername, setFormUsername] = useState("");
  const [formEmail, setFormEmail] = useState("");

  // Validation state
  const [touchedFullName, setTouchedFullName] = useState(false);
  const [touchedUsername, setTouchedUsername] = useState(false);
  const [touchedEmail, setTouchedEmail] = useState(false);
  const [errors, setErrors] = useState<{ fullName?: string; username?: string; email?: string }>({});

  const validate = () => {
    const e: { fullName?: string; username?: string; email?: string } = {};
    const fullNameTrim = formFullName.trim();
    if (!fullNameTrim) e.fullName = "Họ và tên là bắt buộc.";
    else if (fullNameTrim.length < 2) e.fullName = "Họ và tên phải có ít nhất 2 ký tự.";

    const usernameTrim = formUsername.trim();
    if (!usernameTrim) e.username = "Tên người dùng là bắt buộc.";
    else if (!/^[a-zA-Z0-9_]{3,20}$/.test(usernameTrim)) e.username = "Tên người dùng 3-20 ký tự, chỉ chữ, số và dấu gạch dưới.";

    const emailTrim = formEmail.trim();
    if (!emailTrim) e.email = "Email là bắt buộc.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim)) e.email = "Email không hợp lệ.";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const isValidSnapshot = () => {
    const fullNameTrim = formFullName.trim();
    const usernameTrim = formUsername.trim();
    const emailTrim = formEmail.trim();
    return (
      fullNameTrim.length >= 2 &&
      /^[a-zA-Z0-9_]{3,20}$/.test(usernameTrim) &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim)
    );
  };

  const openEdit = () => {
    setFormFullName(user?.fullName || "");
    setFormUsername(user?.username || "");
    setFormEmail(user?.email || "");
    // reset validation
    setTouchedFullName(false);
    setTouchedUsername(false);
    setTouchedEmail(false);
    setErrors({});
    setIsEditOpen(true);
  };

  const handleSaveProfile = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    setTouchedFullName(true);
    setTouchedUsername(true);
    setTouchedEmail(true);
    if (!validate()) {
      toast.error("Vui lòng sửa các lỗi trong biểu mẫu trước khi lưu.");
      return;
    }

    const updated: User = {
      ...user,
      fullName: formFullName.trim(),
      username: formUsername.trim(),
      email: formEmail.trim(),
    };

    // If authenticated with real backend, try to persist remotely
    if (authService.isAuthenticated()) {
      try {
        const res = await authService.updateProfile({
          fullName: updated.fullName,
          username: updated.username,
          email: updated.email,
        });
        if (res && res.data) {
          const serverUser = res.data as User;
          localStorage.setItem("user", JSON.stringify(serverUser));
          setUser(serverUser);
        } else {
          // fallback to local update
          localStorage.setItem("user", JSON.stringify(updated));
          setUser(updated);
        }
      } catch (err) {
        console.error("Failed to save profile on server", err);
        // Queue update for background retry and persist locally
        authService.queuePendingProfileUpdate(updated.id, {
          fullName: updated.fullName,
          username: updated.username,
          email: updated.email,
        });
        localStorage.setItem("user", JSON.stringify(updated));
        setUser(updated);
        // Inform user that changes were saved locally and queued for sync
        toast(
          "Không thể lưu hồ sơ lên server ngay bây giờ. Thay đổi đã được lưu cục bộ và sẽ tự động đồng bộ khi có kết nối.",
          { icon: 'ℹ️' },
        );
      }
    } else {
      // Local/demo mode: persist locally and into overrides so it survives logout/login demo
      localStorage.setItem("user", JSON.stringify(updated));
      setUser(updated);

      try {
        const oRaw = localStorage.getItem("users_overrides");
        const overrides = oRaw ? (JSON.parse(oRaw) as Record<string, User>) : {};
        if (updated.id) {
          overrides[updated.id] = updated;
          localStorage.setItem("users_overrides", JSON.stringify(overrides));
        }
      } catch (err) {
        console.error("Failed to write user override", err);
      }
    }

    // Propagate changes to local recordings uploaded by this user
    try {
      const raw = localStorage.getItem("localRecordings");
      if (raw) {
        const all = JSON.parse(raw) as LocalRecordingMini[];
        // Migrate video data trước khi cập nhật
        const migrated = migrateVideoDataToVideoData(all);
        const updatedAll = migrated.map((r) => {
          if (r.uploader?.id === updated.id) {
            return {
              ...r,
              uploader: {
                ...r.uploader,
                username: updated.username,
              },
            };
          }
          return r;
        });
        localStorage.setItem("localRecordings", JSON.stringify(updatedAll));
        setContributions(
          updatedAll
            .filter((r) => r.uploader?.id === updated.id)
            .map((r) => ({
              id: r.id,
              title: r.title,
              basicInfo: r.basicInfo,
              uploadedAt: (r as LocalRecordingStorage).uploadedDate || (r as LocalRecordingStorage).uploadedAt,
              uploader: r.uploader,
              moderation: r.moderation
                ? {
                  status: r.moderation.status,
                  claimedByName:
                    r.moderation.claimedByName === null
                      ? undefined
                      : r.moderation.claimedByName,
                  rejectionNote: (r.moderation as LocalRecordingStorage['moderation'])?.rejectionNote,
                }
                : undefined,
            }))
        );
      }
    } catch (err) {
      console.error("Failed to propagate user updates to localRecordings", err);
    }

    setIsEditOpen(false);
    toast.success("Lưu hồ sơ thành công");
  };

  // Helper: normalize role to friendly Vietnamese label
  const formatRole = (r?: string) => {
    if (!r) return "Khách";
    const s = String(r).toLowerCase();
    if (s === "expert" || s.includes("expert")) return "Chuyên gia";
    if (s === "contributor" || s.includes("contrib")) return "Người đóng góp";
    return r.charAt(0).toUpperCase() + r.slice(1).toLowerCase();
  };

  // Close modal on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setIsEditOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("localRecordings");
      const all = raw ? (JSON.parse(raw) as LocalRecordingMini[]) : [];
      // Migrate video data từ audioData sang videoData
      const migrated = migrateVideoDataToVideoData(all);
      if (!user) {
        setContributions([]);
        return;
      }
      const my = migrated.filter((r) => r.uploader?.id === user.id);
      setContributions(
        my.map((r) => ({
          id: r.id,
          title: r.title,
          basicInfo: r.basicInfo,
          uploadedAt: (r as LocalRecordingStorage).uploadedDate || (r as LocalRecordingStorage).uploadedAt,
          uploader: r.uploader,
          moderation: r.moderation
            ? {
              status: r.moderation.status,
              claimedByName:
                r.moderation.claimedByName === null
                  ? undefined
                  : r.moderation.claimedByName,
              rejectionNote: (r.moderation as LocalRecordingStorage['moderation'])?.rejectionNote,
            }
            : undefined,
        }))
      );
    } catch (err) {
      console.error(err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const withdraw = (id?: string) => {
    if (!id) return;
    try {
      const raw = localStorage.getItem("localRecordings");
      const all = raw ? (JSON.parse(raw) as LocalRecordingMini[]) : [];
      // Migrate video data trước khi xóa
      const migrated = migrateVideoDataToVideoData(all);
      const filtered = migrated.filter((r) => r.id !== id);
      localStorage.setItem("localRecordings", JSON.stringify(filtered));
      setContributions(
        filtered
          .filter((r) => r.uploader?.id === user?.id)
          .map((r) => ({
            id: r.id,
            title: r.title,
            basicInfo: r.basicInfo,
            uploadedAt: (r as LocalRecordingStorage).uploadedDate || (r as LocalRecordingStorage).uploadedAt,
            uploader: r.uploader,
            moderation: r.moderation
              ? {
                status: r.moderation.status,
                claimedByName:
                  r.moderation.claimedByName === null
                    ? undefined
                    : r.moderation.claimedByName,
                rejectionNote: (r.moderation as LocalRecordingStorage['moderation'])?.rejectionNote as string | undefined,
              } as LocalRecordingMini['moderation']
              : undefined,
          }))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAllMetadata = () => {
    try {
      const raw = localStorage.getItem("localRecordings");
      if (!raw) {
        toast.success("Không có dữ liệu để xóa");
        return;
      }

      const all = JSON.parse(raw) as LocalRecordingMini[];
      const deletedCount = all.length;

      // Tính kích thước trước khi xóa
      const sizeBefore = raw.length;

      // Xóa toàn bộ dữ liệu - xóa hết tất cả các bản thu
      localStorage.removeItem("localRecordings");

      // Cập nhật state để UI phản ánh thay đổi
      setContributions([]);

      const actualFreed = (sizeBefore / (1024 * 1024)).toFixed(2);
      toast.success(`Đã xóa thành công ${deletedCount} bản thu (giải phóng ${actualFreed} MB).`);
      setShowDeleteMetadataConfirm(false);
    } catch (err) {
      console.error("Lỗi khi xóa metadata:", err);
      toast.error("Có lỗi xảy ra khi xóa metadata. Vui lòng thử lại.");
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-neutral-800">Hồ sơ</h1>
          <BackButton />
        </div>

        <div className="prose max-w-none">
          <div className="rounded-2xl shadow-md border border-neutral-200 p-8 mb-8" style={{ backgroundColor: '#FFFCF5' }}>
            <div className="flex items-start justify-between">
              <h2 className="text-2xl font-semibold mb-4 text-neutral-800">Thông tin tài khoản</h2>
              <button type="button" onClick={openEdit} className="px-3 py-1 rounded-full bg-secondary-100 text-secondary-700">Chỉnh sửa hồ sơ</button>
            </div>

            <p className="text-neutral-700 leading-relaxed mb-4">
              <strong>Tên:</strong> {user?.fullName || user?.username} <br />
              <strong>Vai trò:</strong> {formatRole(user?.role)} <br />
              <strong>Email:</strong> {user?.email || '—'}
            </p>
            <p className="text-neutral-700 leading-relaxed">
              Tại đây bạn có thể quản lý thông tin cá nhân và theo dõi trạng thái các đóng góp mà bạn đã gửi tới VietTune.
            </p>
          </div>

          {/* Edit Profile Modal */}
          {isEditOpen && createPortal(
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={(e) => { if (e.target === e.currentTarget) setIsEditOpen(false); }}>
              <div className="rounded-2xl shadow-xl border border-neutral-200 max-w-lg w-full p-6 bg-white">
                <h3 className="text-lg font-semibold mb-4">Chỉnh sửa hồ sơ</h3>
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-800 mb-2">Họ và tên</label>
                    <input
                      type="text"
                      value={formFullName}
                      onChange={(e) => { setFormFullName(e.target.value); if (touchedFullName) validate(); }}
                      onBlur={() => { setTouchedFullName(true); validate(); }}
                      className="w-full px-5 py-3 text-neutral-900 placeholder-neutral-500 border border-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors rounded-full"
                      style={{ backgroundColor: '#FFFCF5' }}
                    />
                    {touchedFullName && errors.fullName && <p className="text-sm text-red-600 mt-1">{errors.fullName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-800 mb-2">Tên người dùng</label>
                    <input
                      type="text"
                      value={formUsername}
                      onChange={(e) => { setFormUsername(e.target.value); if (touchedUsername) validate(); }}
                      onBlur={() => { setTouchedUsername(true); validate(); }}
                      className="w-full px-5 py-3 text-neutral-900 placeholder-neutral-500 border border-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors rounded-full"
                      style={{ backgroundColor: '#FFFCF5' }}
                    />
                    {touchedUsername && errors.username && <p className="text-sm text-red-600 mt-1">{errors.username}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-800 mb-2">Email</label>
                    <input
                      type="email"
                      value={formEmail}
                      onChange={(e) => { setFormEmail(e.target.value); if (touchedEmail) validate(); }}
                      onBlur={() => { setTouchedEmail(true); validate(); }}
                      className="w-full px-5 py-3 text-neutral-900 placeholder-neutral-500 border border-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors rounded-full"
                      style={{ backgroundColor: '#FFFCF5' }}
                    />
                    {touchedEmail && errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
                  </div>

                  <div className="flex justify-end gap-3">
                    <button type="button" onClick={() => setIsEditOpen(false)} className="px-4 py-2 rounded-full bg-neutral-200">Hủy</button>
                    <button disabled={!isValidSnapshot()} type="submit" className="px-4 py-2 rounded-full bg-primary-600 text-white disabled:opacity-50 disabled:cursor-not-allowed">Lưu</button>
                  </div>
                </form>
              </div>
            </div>, document.body)}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="rounded-2xl shadow-md border border-neutral-200 p-6" style={{ backgroundColor: '#FFFCF5' }}>
              <div className="bg-primary-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-neutral-800">Giới thiệu bản thân</h3>
              <p className="text-neutral-700">Một nơi để giới thiệu bản thân, chia sẻ động lực đóng góp và tôn vinh truyền thống âm nhạc của cộng đồng.</p>
            </div>

            <div className="rounded-2xl shadow-md border border-neutral-200 p-6" style={{ backgroundColor: '#FFFCF5' }}>
              <div className="bg-secondary-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-secondary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-neutral-800">Sức mạnh cộng đồng</h3>
              <p className="text-neutral-700">Kết nối với chuyên gia và người yêu nhạc để xác minh, duy trì và lan tỏa giá trị văn hóa.</p>
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 p-6 mb-8 shadow-md" style={{ backgroundColor: '#FFFCF5' }}>
            <div className="bg-primary-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Heart className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-neutral-800">Mục tiêu</h3>
            <p className="text-neutral-700">Hỗ trợ việc thu thập, lưu trữ và phổ biến các bản thu truyền thống theo chuẩn khoa học và tôn trọng bản quyền.</p>
          </div>

          {/* Expert Tools - Xóa metadata */}
          {user?.role === "EXPERT" && (
            <div className="rounded-2xl shadow-md border border-neutral-200 p-8 mb-8" style={{ backgroundColor: '#FFFCF5' }}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-semibold mb-2 text-neutral-800">Công cụ quản trị</h2>
                  <p className="text-neutral-700 text-sm">
                    Xóa toàn bộ dữ liệu từ các bản thu để giải phóng dung lượng localStorage.
                    Tất cả thông tin sẽ bị xóa hoàn toàn, bao gồm metadata, media, và cả thông tin hệ thống (ID, ngày tải, trạng thái kiểm duyệt, người đóng góp).
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDeleteMetadataConfirm(true)}
                className="px-4 py-2 rounded-full bg-red-600 text-white font-medium hover:bg-red-700 transition-colors shadow-sm hover:shadow-md flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Xóa toàn bộ metadata
              </button>
            </div>
          )}

          {/* Chỉ hiển thị "Đóng góp của bạn" nếu user không phải là Expert */}
          {user?.role !== "EXPERT" && (
            <div className="rounded-2xl shadow-md border border-neutral-200 p-8 mb-8" style={{ backgroundColor: '#FFFCF5' }}>
              <h2 className="text-2xl font-semibold mb-4 text-neutral-800">Đóng góp của bạn</h2>
              {contributions.length === 0 ? (
                <p className="text-neutral-600">Bạn chưa có đóng góp nào.</p>
              ) : (
                <div className="space-y-4">
                  {contributions.filter(c => c.id).map((c) => (
                    <div key={c.id} className="border border-neutral-200 rounded-2xl p-4" style={{ backgroundColor: '#FFFCF5' }}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-neutral-800 mb-2">
                            {c.basicInfo?.title || c.title || 'Không có tiêu đề'}
                          </h3>
                          {c.basicInfo?.artist && (
                            <div className="text-sm text-neutral-600 mb-1">Nghệ sĩ: {c.basicInfo.artist}</div>
                          )}
                          <div className="text-sm text-neutral-600 mb-1">Ngày tải: {c.uploadedAt ? new Date(c.uploadedAt).toLocaleString() : '-'}</div>
                          <div className="text-sm mt-1">
                            Trạng thái: <span className="font-medium">{getStatusLabel(c.moderation?.status)}</span>
                            {c.moderation?.status === ModerationStatus.IN_REVIEW && c.moderation?.claimedByName && (
                              <span className="text-neutral-500"> — Đang được kiểm duyệt bởi {c.moderation.claimedByName}</span>
                            )}
                            {c.moderation?.status === ModerationStatus.TEMPORARILY_REJECTED && c.moderation?.rejectionNote && (
                              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-sm text-yellow-800"><strong>Ghi chú từ Expert:</strong> {c.moderation.rejectionNote}</p>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          {c.moderation?.status === ModerationStatus.TEMPORARILY_REJECTED && (
                            <button 
                              onClick={() => {
                                // Load the full recording data and navigate to upload page with edit mode
                                try {
                                  const raw = localStorage.getItem("localRecordings");
                                  if (raw) {
                                    const all = JSON.parse(raw);
                                    const recording = all.find((r: LocalRecordingStorage) => r.id === c.id);
                                    if (recording) {
                                      // Store the recording to edit in sessionStorage
                                      sessionStorage.setItem("editingRecording", JSON.stringify(recording));
                                      navigate("/upload?edit=true");
                                    }
                                  }
                                } catch (err) {
                                  console.error("Error loading recording for edit:", err);
                                }
                              }}
                              className="px-3 py-1 rounded-full bg-primary-600 text-white text-sm whitespace-nowrap flex items-center gap-1"
                            >
                              <Edit className="h-3 w-3" />
                              Chỉnh sửa
                            </button>
                          )}
                          {(c.moderation?.status === ModerationStatus.PENDING_REVIEW || c.moderation?.status === ModerationStatus.REJECTED) && (
                            <button onClick={() => withdraw(c.id)} className="px-3 py-1 rounded-full bg-red-600 text-white text-sm whitespace-nowrap">Hủy đóng góp</button>
                          )}
                          {c.moderation?.status === ModerationStatus.APPROVED && (
                            <div className="text-sm text-green-600 font-medium whitespace-nowrap">Đã xuất bản</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Terms and Conditions Link */}
          <div className="rounded-2xl shadow-md border border-neutral-200 p-8 text-center" style={{ backgroundColor: '#FFFCF5' }}>
            <div className="bg-neutral-100 rounded-full w-12 h-12 flex items-center justify-center mb-4 mx-auto">
              <FileText className="h-6 w-6 text-neutral-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-neutral-800">Điều khoản và Điều kiện</h3>
            <p className="text-neutral-700 mb-6">Tìm hiểu các quy định và chính sách khi sử dụng nền tảng VietTune.</p>
            <Link
              to="/terms"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-full hover:bg-primary-700 transition-colors shadow-md hover:shadow-lg"
            >
              <FileText className="h-5 w-5" />
              Xem Điều khoản và Điều kiện
            </Link>
          </div>
        </div>
      </div>

      {/* Delete Metadata Confirmation Dialog */}
      {showDeleteMetadataConfirm && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={(e) => { if (e.target === e.currentTarget) setShowDeleteMetadataConfirm(false); }}>
          <div className="rounded-2xl shadow-xl border border-neutral-300 max-w-lg w-full p-6 bg-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-800">Xác nhận xóa toàn bộ dữ liệu</h3>
            </div>
            <p className="text-neutral-700 mb-6">
              Bạn có chắc chắn muốn xóa toàn bộ dữ liệu từ tất cả các bản thu không?
              Hành động này sẽ giải phóng dung lượng localStorage và xóa hoàn toàn tất cả các bản thu.
              <br /><br />
              <strong>Lưu ý:</strong> Tất cả thông tin sẽ bị xóa hoàn toàn, bao gồm:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Thông tin cơ bản: tiêu đề, nghệ sĩ, thể loại, ngày ghi âm, địa điểm</li>
                <li>Bối cảnh văn hóa: dân tộc, vùng miền, loại sự kiện, nhạc cụ</li>
                <li>Ghi chú bổ sung: mô tả, ghi chú thực địa, bản chép nhạc</li>
                <li>Thông tin quản trị: người thu thập, bản quyền, mã catalog</li>
                <li>File media: audioData, videoData, youtubeUrl, mediaType, file</li>
                <li>Thông tin hệ thống: ID, ngày tải, trạng thái kiểm duyệt, người đóng góp</li>
              </ul>
              <br />
              <strong className="text-red-600">Hành động này không thể hoàn tác!</strong>
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteMetadataConfirm(false)}
                className="px-4 py-2 rounded-full bg-neutral-200 text-neutral-800 font-medium hover:bg-neutral-300 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteAllMetadata}
                className="px-4 py-2 rounded-full bg-red-600 text-white font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Xóa toàn bộ dữ liệu
              </button>
            </div>
          </div>
        </div>, document.body
      )}
    </div>
  );
}
