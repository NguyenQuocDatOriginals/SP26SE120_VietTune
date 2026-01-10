import { X } from "lucide-react";
import { useRef, useEffect } from "react";
import { addSpotlightEffect } from "@/utils/spotlight";

interface TermsAndConditionsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TermsAndConditions({
  isOpen,
  onClose,
}: TermsAndConditionsProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      const cleanup = addSpotlightEffect(modalRef.current);
      return cleanup;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="spotlight-container backdrop-blur-xl bg-white/20 rounded-2xl shadow-2xl border border-white/40 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        style={{
          boxShadow:
            "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/30">
          <h2 className="text-2xl font-bold text-white">Điều khoản sử dụng</h2>
          <button
            onClick={onClose}
            className="btn-liquid-glass-close w-12 h-12 flex-shrink-0 flex items-center justify-center"
          >
            <span className="relative z-10">
              <X className="h-5 w-5 text-white" strokeWidth={2.5} />
            </span>
          </button>
        </div>

        {/* Content */}
        <div
          className="overflow-y-auto pt-3 px-6 pb-6 space-y-6 text-white"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#ffffff transparent",
          }}
        >
          <style>{`
            .overflow-y-auto::-webkit-scrollbar {
              width: 8px;
            }
            .overflow-y-auto::-webkit-scrollbar-track {
              background: transparent;
            }
            .overflow-y-auto::-webkit-scrollbar-thumb {
              background: #ffffff;
              border-radius: 4px;
            }
          `}</style>
          {/* 1. Introduction */}
          <section>
            <h3 className="text-xl font-semibold text-white mb-3">
              1. Giới thiệu
            </h3>
            <p className="leading-relaxed">
              Chào mừng bạn đến với VietTune. Các Điều khoản sử dụng này điều
              chỉnh việc bạn sử dụng nền tảng và dịch vụ của chúng tôi. Bằng
              việc truy cập hoặc sử dụng VietTune, bạn đồng ý tuân thủ các điều
              khoản này. Nếu không đồng ý với bất kỳ phần nào, vui lòng không sử
              dụng dịch vụ của chúng tôi.
            </p>
          </section>

          {/* 2. Platform purpose */}
          <section>
            <h3 className="text-xl font-semibold text-white mb-3">
              2. Mục đích nền tảng
            </h3>
            <p className="leading-relaxed mb-2">
              VietTune là nền tảng lưu trữ chuyên biệt dựa vào cộng đồng, tận
              tâm gìn giữ và ghi chép truyền thống âm nhạc của 54 dân tộc Việt
              Nam. Nền tảng của chúng tôi cung cấp:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Kho lưu trữ bản ghi đầy đủ</li>
              <li>Khả năng tìm kiếm thông minh</li>
              <li>Công cụ quản lý cộng tác</li>
              <li>Lưu giữ thông tin về nhạc cụ truyền thống và nghệ nhân</li>
            </ul>
          </section>

          {/* 3. User accounts */}
          <section>
            <h3 className="text-xl font-semibold text-white mb-3">
              3. Tài khoản người dùng
            </h3>
            <p className="leading-relaxed mb-2">
              Để đóng góp nội dung cho VietTune, bạn cần tạo tài khoản. Bạn đồng
              ý:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Cung cấp thông tin đăng ký chính xác và đầy đủ</li>
              <li>Bảo mật mật khẩu và tài khoản của bạn</li>
              <li>
                Cập nhật thông tin tài khoản kịp thời để đảm bảo độ chính xác
              </li>
              <li>Chịu trách nhiệm cho mọi hoạt động từ tài khoản của bạn</li>
              <li>Không chia sẻ tài khoản với người khác</li>
            </ul>
          </section>

          {/* 4. Content guidelines */}
          <section>
            <h3 className="text-xl font-semibold text-white mb-3">
              4. Hướng dẫn nội dung
            </h3>
            <p className="leading-relaxed mb-2">
              Khi tải nội dung lên VietTune, bạn phải đảm bảo:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Bạn sở hữu hoặc có quyền chia sẻ nội dung tải lên</li>
              <li>
                Nội dung chính thống và liên quan đến âm nhạc truyền thống các
                dân tộc thiểu số Việt Nam
              </li>
              <li>
                Nội dung không vi phạm quyền sở hữu trí tuệ của người khác
              </li>
              <li>
                Thông tin mô tả chính xác và đầy đủ trong khả năng của bạn
              </li>
              <li>
                Nội dung không chứa tài liệu có hại, xúc phạm hoặc bất hợp pháp
              </li>
            </ul>
          </section>

          {/* 5. Intellectual property */}
          <section>
            <h3 className="text-xl font-semibold text-white mb-3">
              5. Quyền sở hữu trí tuệ
            </h3>
            <p className="leading-relaxed mb-2">
              Bằng việc tải nội dung lên VietTune, bạn cấp cho chúng tôi giấy
              phép không độc quyền, toàn cầu, miễn phí bản quyền để:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Lưu trữ, hiển thị và phân phối nội dung của bạn</li>
              <li>Cung cấp nội dung cho mục đích nghiên cứu và giáo dục</li>
              <li>
                Tạo các tác phẩm phái sinh nhằm bảo tồn và tăng khả năng tiếp
                cận
              </li>
            </ul>
            <p className="leading-relaxed mt-2">
              Bạn vẫn giữ toàn bộ quyền sở hữu đối với nội dung của mình.
              VietTune tôn trọng di sản văn hóa và kiến thức truyền thống của
              các cộng đồng dân tộc.
            </p>
          </section>

          {/* 6. Verification process */}
          <section>
            <h3 className="text-xl font-semibold text-white mb-3">
              6. Quy trình xác minh
            </h3>
            <p className="leading-relaxed">
              Mọi nội dung tải lên đều trải qua quy trình xác minh bởi cộng đồng
              chuyên gia và quản trị viên của chúng tôi. Chúng tôi có quyền phê
              duyệt, từ chối hoặc yêu cầu chỉnh sửa nội dung được gửi để đảm bảo
              tiêu chuẩn chính xác và chất lượng. Nội dung đã xác minh sẽ được
              đánh dấu trong kho lưu trữ.
            </p>
          </section>

          {/* 7. Privacy and Data protection */}
          <section>
            <h3 className="text-xl font-semibold text-white mb-3">
              7. Quyền riêng tư và bảo vệ dữ liệu
            </h3>
            <p className="leading-relaxed">
              Chúng tôi cam kết bảo vệ quyền riêng tư của bạn. Thông tin cá nhân
              của bạn sẽ được xử lý theo Chính sách bảo mật của chúng tôi. Chúng
              tôi thu thập và sử dụng dữ liệu chỉ nhằm mục đích vận hành và cải
              thiện VietTune. Chúng tôi không bán hoặc chia sẻ thông tin cá nhân
              của bạn với bên thứ ba nếu không có sự đồng ý của bạn.
            </p>
          </section>

          {/* 8. Community conduct */}
          <section>
            <h3 className="text-xl font-semibold text-white mb-3">
              8. Quy tắc cộng đồng
            </h3>
            <p className="leading-relaxed mb-2">Người dùng cần:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Đối xử với người dùng khác bằng sự tôn trọng và lịch sự</li>
              <li>Đóng góp mang tính xây dựng cho thảo luận và quản lý</li>
              <li>Tôn trọng sự nhạy cảm văn hóa và kiến thức truyền thống</li>
              <li>
                Báo cáo nội dung hoặc hành vi không phù hợp cho quản trị viên
              </li>
              <li>
                Không tham gia quấy rối, phân biệt đối xử hoặc hành vi lạm dụng
              </li>
            </ul>
          </section>

          {/* 9. Prohibited activities */}
          <section>
            <h3 className="text-xl font-semibold text-white mb-3">
              9. Hoạt động bị cấm
            </h3>
            <p className="leading-relaxed mb-2">Bạn không được:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>
                Cố gắng truy cập trái phép vào hệ thống của chúng tôi hoặc tài
                khoản của người dùng khác
              </li>
              <li>Tải mã độc hại hoặc cố gắng làm gián đoạn nền tảng</li>
              <li>
                Trích xuất hoặc tải xuống nội dung một cách có hệ thống mà không
                được phép
              </li>
              <li>
                Sử dụng nền tảng cho mục đích thương mại mà không được phép
              </li>
              <li>Xuyên tạc danh tính hoặc liên kết của bạn</li>
              <li>Gửi thông tin sai lệch hoặc gây nhầm lẫn</li>
            </ul>
          </section>

          {/* 10. Content moderation */}
          <section>
            <h3 className="text-xl font-semibold text-white mb-3">
              10. Kiểm duyệt nội dung
            </h3>
            <p className="leading-relaxed">
              VietTune có quyền xóa, chỉnh sửa hoặc từ chối bất kỳ nội dung nào
              vi phạm Điều khoản sử dụng này hoặc được coi là không phù hợp.
              Chúng tôi có thể tạm ngừng hoặc chấm dứt tài khoản vi phạm chính
              sách nhiều lần. Người dùng sẽ được thông báo về các hành động kiểm
              duyệt khi có thể.
            </p>
          </section>

          {/* 11. Attribution and Citation */}
          <section>
            <h3 className="text-xl font-semibold text-white mb-3">
              11. Ghi nhận và trích dẫn
            </h3>
            <p className="leading-relaxed">
              Khi sử dụng nội dung từ VietTune cho mục đích nghiên cứu hoặc giáo
              dục, bạn phải ghi nhận đầy đủ:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Người đóng góp/tải lên ban đầu</li>
              <li>Nghệ nhân hoặc người truyền nghề (nếu có)</li>
              <li>Cộng đồng dân tộc liên quan đến truyền thống</li>
              <li>VietTune là nền tảng</li>
            </ul>
          </section>

          {/* 12. Disclaimer of warranties */}
          <section>
            <h3 className="text-xl font-semibold text-white mb-3">
              12. Từ chối bảo đảm
            </h3>
            <p className="leading-relaxed">
              VietTune được cung cấp "nguyên trạng" mà không có bảo đảm dưới bất
              kỳ hình thức nào, dù rõ ràng hay ngầm định. Chúng tôi không đảm
              bảo rằng nền tảng sẽ hoạt động liên tục, an toàn hoặc không có
              lỗi. Mặc dù chúng tôi nỗ lực đảm bảo tính chính xác, chúng tôi
              không thể bảo đảm tính đầy đủ hoặc chính xác của mọi nội dung.
            </p>
          </section>

          {/* 13. Limitation of liability */}
          <section>
            <h3 className="text-xl font-semibold text-white mb-3">
              13. Giới hạn trách nhiệm
            </h3>
            <p className="leading-relaxed">
              VietTune và các nhà điều hành của nó sẽ không chịu trách nhiệm cho
              bất kỳ thiệt hại gián tiếp, ngẫu nhiên, đặc biệt, hệ quả hoặc
              trừng phạt nào phát sinh từ việc bạn sử dụng hoặc không thể sử
              dụng nền tảng. Điều này bao gồm nhưng không giới hạn ở thiệt hại
              do mất dữ liệu, lợi nhuận hoặc các tổn thất vô hình khác.
            </p>
          </section>

          {/* 14. Changes to Terms */}
          <section>
            <h3 className="text-xl font-semibold text-white mb-3">
              14. Thay đổi điều khoản
            </h3>
            <p className="leading-relaxed">
              Chúng tôi có quyền sửa đổi Điều khoản sử dụng này bất cứ lúc nào.
              Chúng tôi sẽ thông báo cho người dùng về các thay đổi quan trọng
              qua email hoặc thông báo nổi bật trên nền tảng. Việc tiếp tục sử
              dụng VietTune sau khi có thay đổi đồng nghĩa với việc chấp nhận
              các điều khoản đã được sửa đổi.
            </p>
          </section>

          {/* 15. Termination */}
          <section>
            <h3 className="text-xl font-semibold text-white mb-3">
              15. Chấm dứt tài khoản
            </h3>
            <p className="leading-relaxed">
              Bạn có thể chấm dứt tài khoản của mình bất cứ lúc nào bằng cách
              liên hệ với chúng tôi. Chúng tôi có thể chấm dứt hoặc tạm ngừng
              tài khoản của bạn ngay lập tức, mà không cần thông báo trước, nếu
              bạn vi phạm Điều khoản sử dụng này. Khi chấm dứt, quyền sử dụng
              nền tảng của bạn sẽ chấm dứt ngay lập tức, nhưng nội dung bạn đã
              đóng góp có thể vẫn còn trong kho lưu trữ.
            </p>
          </section>

          {/* 16. Governing law */}
          <section>
            <h3 className="text-xl font-semibold text-white mb-3">
              16. Luật điều chỉnh
            </h3>
            <p className="leading-relaxed">
              Các Điều khoản sử dụng này sẽ được điều chỉnh và giải thích theo
              pháp luật Việt Nam. Mọi tranh chấp phát sinh từ các điều khoản này
              sẽ thuộc thẩm quyền độc quyền của tòa án Việt Nam.
            </p>
          </section>

          {/* 17. Contact information */}
          <section>
            <h3 className="text-xl font-semibold text-white mb-3">
              17. Thông tin liên hệ
            </h3>
            <p className="leading-relaxed">
              Nếu bạn có câu hỏi về Điều khoản sử dụng này, vui lòng liên hệ với
              chúng tôi tại:
            </p>
            <p className="leading-relaxed mt-2">
              <strong>Email:</strong> contact@viettune.com
            </p>
            <p className="leading-relaxed">
              <strong>Nền tảng:</strong> VietTune
            </p>
          </section>

          {/* Last Updated */}
          <section className="pt-6 border-t border-white/30">
            <p className="text-sm text-white/80 italic">
              Cập nhật lần cuối: 5 tháng 1, 2026
            </p>
            <p className="text-sm text-white/80 mt-2">
              Bằng việc sử dụng VietTune, bạn xác nhận rằng bạn đã đọc, hiểu và
              đồng ý tuân thủ các Điều khoản sử dụng này.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
