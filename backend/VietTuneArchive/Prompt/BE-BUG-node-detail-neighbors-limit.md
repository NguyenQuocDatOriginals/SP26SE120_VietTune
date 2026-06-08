# BÁO CÁO LỖI BACKEND (BE BUG REPORT)

## Tên lỗi: Lệch số lượng liên kết hiển thị trên Sidebar (GetNodeDetail) so với thực tế khi bung rộng (ExpandNode)

### 1. Triệu chứng (Symptoms)
- Khi nhấp chọn xem chi tiết một thực thể (ví dụ: Dân tộc **Kinh (Việt)**), ở sidebar chi tiết bên phải chỉ hiển thị danh sách nhóm liên kết **"Là nguồn gốc của nhạc cụ (4)"** (chỉ có 4 nhạc cụ: Kèn bầu, Phách, Sáo trúc, Tiêu).
- Tuy nhiên, khi nhấp vào nút **`+ Mở rộng`** hoặc click đúp vào node Kinh trên canvas, sơ đồ bung ra đến **12 nhạc cụ** được nối trực tiếp qua mối quan hệ này (bao gồm cả Đàn nguyệt, Đàn đáy, Trống đồng, Trống cơm, Đàn nhị, Đàn tranh, Đàn bầu, Đàn tỳ bà...).
- Do đó, số lượng hiển thị trên sidebar bị thiếu và không khớp với thực tế trên Graph.

---

### 2. Nguyên nhân gốc rễ (Root Cause)
Lỗi nằm ở câu lệnh Cypher Query trong phương thức **`GetNodeDetailAsync`** thuộc class [GraphExplorerService.cs](file:///c:/Users/thanh/OneDrive/Documents/SP26SE120_VietTune/backend/VietTuneArchive.Application/Services/ThirdPartyServices/GraphExplorerService.cs#L138-L152):

```csharp
var query = @"
    MATCH (n)
    WHERE n.Id = $id
    OPTIONAL MATCH (n)-[r]-(neighbor)
    WITH n, r, neighbor
    ORDER BY neighbor.Name ASC, neighbor.Title ASC
    WITH n,
         collect(DISTINCT {
           relType: type(r),
           direction: CASE WHEN startNode(r) = n THEN 'OUT' ELSE 'IN' END,
           neighborId: neighbor.Id,
           neighborLabel: coalesce(neighbor.Name, neighbor.Title, ''),
           neighborGroup: labels(neighbor)[0]
         })[0..20] AS neighbors  // <--- LỖI TẠI ĐÂY: GIỚI HẠN CỨNG 20 NEIGHBORS
    RETURN n, neighbors, COUNT { (n)--() } AS degree";
```

- **Lý do**: Lệnh `[0..20]` ở cuối hàm `collect` giới hạn danh sách `neighbors` trả về cho toàn bộ các mối quan hệ cộng lại tối đa chỉ là **20 phần tử đầu tiên** (theo bảng chữ cái của tên neighbor).
- Nếu một thực thể có tổng số lượng liên kết lớn hơn 20 (ví dụ Dân tộc Kinh có rất nhiều mối quan hệ với Nhạc cụ, Nghi lễ, Bản ghi...), danh sách trả về cho Frontend sẽ bị cắt cụt.
- Trong khi đó, API **`ExpandNodeAsync`** thực hiện Match trực tiếp theo `relType` cụ thể và có giới hạn lớn hơn nhiều (`LIMIT 50`), dẫn đến việc nó trả về đầy đủ 12 nhạc cụ trong cơ sở dữ liệu Neo4j.

---

### 3. Nguy cơ tiềm ẩn nếu không giới hạn hoặc giới hạn quá lớn (Performance Risks)
Nếu chúng ta loại bỏ hoàn toàn giới hạn hoặc đặt giới hạn quá lớn (ví dụ: `1000` hoặc `5000` phần tử):
- **Quá tải đường truyền & Bộ nhớ (Network/Memory Overhead)**: Đối với các node "siêu kết nối" (supernodes) như các thực thể danh mục chung (ví dụ node Category, node Province lớn), số lượng kết nối thực tế có thể lên đến hàng ngàn. Nếu tải toàn bộ danh sách này chỉ để hiển thị sidebar:
  - Payload JSON phản hồi từ API sẽ cực kỳ nặng, gây lag băng thông mạng.
  - Tốn tài nguyên CPU ở BE để serialize và FE để deserialize/render.
  - Gây đơ/lag trình duyệt do quá nhiều DOM nodes được sinh ra trên Sidebar.
- **Lấn át nhóm quan hệ (Clutter & Starvation)**: Nếu viết như cũ `[0..100]`, nhóm quan hệ nào có quá nhiều node con (ví dụ: Bản ghi liên quan có 90 bài) sẽ chiếm hết hạn mức và lấn át, làm biến mất các nhóm quan hệ ít hơn (ví dụ: Nhạc cụ chỉ có 10 bài).

---

### 4. Giải pháp khắc phục đề xuất cho BE (Proposed Fixes)

#### Phương án 1: Tăng giới hạn lên một mức an toàn vừa phải (Đơn giản nhất)
Tăng giới hạn slice từ `20` lên khoảng `100` hoặc `200` phần tử. Đây là mức an toàn, đủ dùng cho bản đồ âm nhạc Việt Nam mà không lo quá tải hệ thống.
```diff
-        })[0..20] AS neighbors
+        })[0..150] AS neighbors  // Mức an toàn trung bình
```

#### Phương án 2: Giới hạn theo từng loại quan hệ (Tối ưu & Chuyên nghiệp nhất)
Thay vì giới hạn global trên toàn bộ các loại quan hệ gộp chung, ta sẽ gom nhóm theo loại quan hệ (`relType`) trước, rồi giới hạn tối đa (ví dụ: `50` phần tử) cho **MỖI** loại quan hệ. Cách này giúp kiểm soát kích thước dữ liệu cực tốt mà không lo nhóm này lấn át nhóm kia:

```cypher
MATCH (n)
WHERE n.Id = $id
OPTIONAL MATCH (n)-[r]-(neighbor)
WITH n, type(r) AS relType, r, neighbor
ORDER BY neighbor.Name ASC, neighbor.Title ASC
WITH n, relType, collect(DISTINCT {
  relType: relType,
  direction: CASE WHEN startNode(r) = n THEN 'OUT' ELSE 'IN' END,
  neighborId: neighbor.Id,
  neighborLabel: coalesce(neighbor.Name, neighbor.Title, ''),
  neighborGroup: labels(neighbor)[0]
})[0..50] AS relNeighbors // Giới hạn 50 neighbors cho MỖI loại quan hệ
RETURN n, collect(relNeighbors) AS neighbors, COUNT { (n)--() } AS degree
```
*(Lưu ý: BE cần điều chỉnh nhẹ phần đọc mapping record ở C# để tương thích với mảng lồng `neighbors` được trả về từ Cypher mới này).*
