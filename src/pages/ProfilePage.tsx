import { useEffect, useState, FormEvent } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { Target, Users, Heart, FileText } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { ModerationStatus, User } from "@/types";
import toast from "react-hot-toast";
import { authService } from "@/services/authService";

interface LocalRecordingMini {
  id?: string;
  title?: string;
  uploadedAt?: string;
  uploader?: { id?: string; username?: string };
  moderation?: { status?: ModerationStatus | string; claimedByName?: string };
}

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [contributions, setContributions] = useState<LocalRecordingMini[]>([]);

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
        const updatedAll = all.map((r) => {
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
        setContributions(updatedAll.filter((r) => r.uploader?.id === updated.id));
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
      if (!user) {
        setContributions([]);
        return;
      }
      const my = all.filter((r) => r.uploader?.id === user.id);
      setContributions(my);
    } catch (err) {
      console.error(err);
    }
  }, [user]);

  const withdraw = (id?: string) => {
    if (!id) return;
    try {
      const raw = localStorage.getItem("localRecordings");
      let all = raw ? (JSON.parse(raw) as LocalRecordingMini[]) : [];
      all = all.filter((r) => r.id !== id);
      localStorage.setItem("localRecordings", JSON.stringify(all));
      setContributions(all.filter((r) => r.uploader?.id === user?.id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-neutral-800 mb-8">Hồ sơ</h1>

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

          <div className="rounded-2xl shadow-md border border-neutral-200 p-8 mb-8" style={{ backgroundColor: '#FFFCF5' }}>
            <h2 className="text-2xl font-semibold mb-4 text-neutral-800">Đóng góp của bạn</h2>
            {contributions.length === 0 ? (
              <p className="text-neutral-600">Bạn chưa có đóng góp nào.</p>
            ) : (
              <div className="space-y-4">
                {contributions.map((c) => (
                  <div key={c.id} className="border border-neutral-200 rounded-2xl p-4" style={{ backgroundColor: '#FFFCF5' }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-neutral-800">{c.title}</div>
                        <div className="text-sm text-neutral-600">Ngày tải: {c.uploadedAt ? new Date(c.uploadedAt).toLocaleString() : '-'}</div>
                        <div className="text-sm mt-1">Trạng thái: <span className="font-medium">{c.moderation?.status}</span></div>
                      </div>
                      <div className="flex items-center gap-2">
                        {(c.moderation?.status === ModerationStatus.PENDING_REVIEW || c.moderation?.status === ModerationStatus.REJECTED) && (
                          <button onClick={() => withdraw(c.id)} className="px-3 py-1 rounded-full bg-red-600 text-white">Rút/ Hủy đóng góp</button>
                        )}
                        {c.moderation?.status === ModerationStatus.IN_REVIEW && (
                          <div className="text-sm text-neutral-600">Đang được kiểm duyệt bởi {c.moderation?.claimedByName || '—'}</div>
                        )}
                        {c.moderation?.status === ModerationStatus.APPROVED && (
                          <div className="text-sm text-green-600 font-medium">Đã xuất bản</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

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
    </div>
  );
}
