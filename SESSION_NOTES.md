# Báo Cáo Cập Nhật Mã Nguồn (Session Notes)

Tài liệu này ghi lại các thay đổi và sửa chữa đã được thực hiện trong phiên làm việc gần nhất, nhằm mục đích bàn giao cho các thành viên trong đội hoặc Agent khác tiếp tục phát triển.

## Các Hạng Mục Đã Hoàn Thành

### 1. Sửa Lỗi Hiển Thị (UI/UX)
- **Sửa Thumbnail / Zoom ảnh:** Đã hoàn thiện tính năng hiển thị và phóng to (zoom) ảnh thumbnail (sửa trước đó).

### 2. Tối Ưu Hóa Tìm Kiếm và Lọc (Explore Portal)
- **Tích Hợp API Mới:** Backend (BE) đã được nâng cấp để endpoint `/api/Recording/search-by-filter` và `/api/RecordingGuest/search-by-filter` có thể nhận và xử lý đồng thời cả từ khóa tìm kiếm (`title`) lẫn các bộ lọc (Facets). Do đó, luồng xử lý trên Frontend đã được tối ưu lại.
- **Loại Bỏ Logic Hybrid Không Cần Thiết:** 
  - Trước đây, Frontend (Guest) gọi API lấy tối đa 500 bản ghi (`GUEST_FILTER_POOL_SIZE`), sau đó tự lọc bằng JavaScript và phân trang nội bộ. Cách này gây sai lệch kết quả và làm hỏng phân trang khi có nhiều dữ liệu.
  - **Đã sửa (`src/features/explore/utils/exploreRecordingsLoad.ts`):** Xóa bỏ luồng lấy 500 bản ghi và lọc nội bộ. Hiện tại Frontend gọi thẳng hàm `getGuestRecordingsByFilter` truyền trực tiếp `currentPage` và `EXPLORE_PAGE_SIZE` xuống Backend để Backend đảm nhận hoàn toàn việc lọc dữ liệu kết hợp từ khoá và phân trang chuẩn xác.

### 3. Vá Lỗ Hổng Lọc Dữ Liệu Ngoại Tuyến (Offline/Fallback Filters)
- **Cập Nhật Bộ Lọc Local:** Hàm `applyGuestFilters` trong `exploreGuestFilters.ts` được dùng làm phương án dự phòng (fallback) hoặc lọc bộ nhớ đệm nội bộ (offline cache).
- **Vấn đề trước đây:** Hàm này thiếu logic kiểm tra cho 2 trường `ceremonyId` và `communeId`. Khi người dùng tìm kiếm kết hợp bộ lọc ở chế độ offline hoặc từ local pool, 2 bộ lọc này bị bỏ qua hoàn toàn.
- **Đã sửa (`src/features/explore/utils/exploreGuestFilters.ts`):** Thêm điều kiện kiểm tra chính xác `ceremonyId` và `communeId` vào luồng trả về để bảo đảm tính đồng nhất giữa kết quả từ API và kết quả lọc offline.

### 4. Sửa Lỗi Quyền Truy Cập (403/400) Cho Researcher Trên Explore Page
- **Vấn đề:** Khi Researcher vào trang Explore mà không áp dụng bộ lọc nào (Default View), hệ thống cũ lại chuyển hướng gọi `fetchFullCatalog()` - một hàm chuyên gọi API `/api/Submission/get-by-status` và `/api/Submission/my` vốn chỉ dành cho Contributor hoặc Moderator. Việc này gây ra lỗi 403 Forbidden và 400 Bad Request, khiến trang bị lỗi hiển thị.
- **Đã sửa:** Gộp chung luồng "có filter" và "không filter" đối với Authenticated User lại thành 1 nhánh duy nhất (sử dụng API `/api/Recording/search-by-filter`). Việc này giúp Researcher truy cập mượt mà, đồng thời tính năng fallback kéo offline data bằng `fetchFullCatalog()` của Contributor vẫn được an toàn giữ lại bên trong khối `catch`.

### 5. Sửa Lỗi Hiển Thị "Chưa Cập Nhật" / "Không Xác Định" (Mapping Data)
- **Vấn đề 1:** Sau khi đổi sang API mới, UI báo "Chưa cập nhật". Nguyên nhân do hàm `toPaginatedRecordingsResponse` ép kiểu trực tiếp thay vì bóc tách object (đã sửa bằng cách trỏ logic qua `pickGuestRows`).
- **Vấn đề 2:** API trả về mảng object (VD: `instruments: [{name: "Đàn"}]`) nhưng logic map của Frontend lại bỏ qua vì nó không phải là String thuần (đã sửa bằng cách cho phép parse sâu mảng object để lấy `name`).
- **Vấn đề 3 (Nghiêm trọng):** API `/api/Recording/search-by-filter` và `/api/RecordingGuest` hoàn toàn không trả về tên Dân tộc, Nghi lễ, hay Xã phường. Nó chỉ trả về các mã ID (VD: `ethnicGroupId`, `ceremonyId`, `communeId`). Do Frontend thiếu bước ánh xạ, nó không thể tìm thấy tên để render ra màn hình.
- **Đã sửa (`src/services/recordingService.ts`):** 
  - Bổ sung lệnh gọi `buildSubmissionLookupMaps()` vào mọi hàm search trong `recordingService.ts` để lấy bộ từ điển (Dictionaries) tra cứu của hệ thống.
  - Truyền bộ từ điển này vào hàm map nội bộ `mapGuestRowToRecording`.
  - Giờ đây, khi lấy được `ethnicGroupId` hay `ceremonyId`, Frontend sẽ tự động tra cứu ID đó trong từ điển và gắn dán nhãn (`name`) chuẩn xác vào trong response trả về cho UI. Mọi Component như `ExploreResultRow` hay Search đều đã được hiển thị đúng đắn.

### 6. Đánh Giá Trang Cổng Nghiên Cứu (Researcher Portal)
- Đã rà soát luồng gọi API và bộ lọc của cổng nghiên cứu tại `src/services/researcherRecordingFilterSearch.ts`.
- Cổng nghiên cứu vốn đã được thiết lập chuẩn, tự động áp dụng `lookups` nên không bị ảnh hưởng bởi lỗi mất tên dữ liệu. 

### 7. Sửa Lỗi Gọi API (400 Bad Request) Khi Kiểm Duyệt (Moderation Page cho Expert)
- **Vấn đề:** Khi chuyên gia bấm duyệt, chuyển bước kiểm duyệt hoặc từ chối, console báo lỗi 400 do FE truyền `recordingId` thay vì `submissionId`. Lỗi này xuất phát từ việc khi mở Wizard, hệ thống đọc bản ghi từ IndexedDB (vốn không có `submissionId` lưu sẵn) rồi gộp đè vào danh sách `allItems`, làm mất thông tin `submissionId`.
- **Đã sửa:**
  - **`src/pages/ModerationPage.tsx`**: Thêm `allItemsRef` để bảo toàn `submissionId` gốc từ server khi tải và gộp đè thông tin bản ghi thô từ IndexedDB.
  - **`src/features/moderation/hooks/useModerationWizard.ts`**: Cập nhật các callback kiểm duyệt để tìm kiếm linh hoạt theo cả hai ID (`submissionId` / `recordingId`), dùng `recId` (chuỗi an toàn) làm key cho React state local (`verificationStep`, `verificationForms`) và giữ nguyên `subId` (submissionId) khi gửi API lên Server.

### 8. Hiển Thị Hình Ảnh Bản Thu Trên Trang Chi Tiết Bản Ghi (Detail Page)
- **Yêu cầu:** Hiển thị thêm hình ảnh của bản ghi (nếu có) ở sidebar dưới phần thông tin cơ bản và trên phần nhạc cụ đối với cả 2 vai trò Contributor và Researcher.
- **Đã sửa (`src/pages/RecordingDetailPage.tsx`):**
  - Tích hợp hook `useRecordingImages` và Component `RecordingImageGallery` để hiển thị bộ sưu tập hình ảnh của bản ghi nếu có (hỗ trợ Lightbox xem phóng to ảnh và mô tả ảnh).
  - Thêm phương án dự phòng (fallback) hiển thị ảnh bìa `recording.coverImage` dưới dạng thẻ ảnh độc lập nếu bản ghi không có album ảnh tải lên nhưng có liên kết ảnh bìa.
  - Đặt cấu trúc hiển thị chính xác ở sidebar phía dưới card "Thông tin" và phía trên card "Nhạc cụ".

### 9. Sửa Lỗi Nội Dung Bị Đẩy Lên Sát Header (Spacing/Layout)
- **Vấn đề:** Ở tất cả các trang, do Header được cố định (`fixed top-0`), nội dung chính (`<main>`) phải dùng `padding-top` để chừa khoảng trống. Tuy nhiên, khoảng đệm `pt-32` (128px) ở mobile/tablet và `lg:pt-40` (160px) ở desktop trước đây quá nhỏ, dẫn đến nội dung chính (như tiêu đề trang Explore) bị đẩy sát lên trên, sát vào mép dưới của Header.
- **Đã sửa (`src/components/layout/MainLayout.tsx`):**
  - Tăng khoảng đệm `padding-top` của thẻ `<main>` từ `pt-32 lg:pt-40` lên thành `pt-36 lg:pt-48` (tương đương 144px cho mobile/tablet và 192px cho desktop). Thay đổi này giúp tạo ra một khoảng trống an toàn, thoáng đãng và chuẩn mực giữa Header và nội dung ở mọi độ rộng màn hình.

---
**Tình Trạng:** Hoàn thành tốt. Trang kiểm duyệt Expert đã gọi chuẩn các API Server bằng `submissionId` thay vì `recordingId`, loại bỏ hoàn toàn lỗi 400/409. Trang chi tiết bản ghi của Contributor và Researcher đã hiển thị đầy đủ hình ảnh/ảnh bìa ở vị trí yêu cầu trong sidebar. Các trang đã được điều chỉnh padding để chừa khoảng trống hợp lý và đẹp mắt dưới thanh Header.


