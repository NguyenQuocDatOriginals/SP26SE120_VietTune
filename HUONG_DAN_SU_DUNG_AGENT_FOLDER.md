# Hướng Dẫn Sử Dụng Folder .agent - Step by Step

## 📋 Tổng Quan

Folder `.agent` là một hệ thống AI Agent phức tạp được thiết kế để giúp AI hiểu và làm việc với dự án của bạn một cách thông minh. Hệ thống này bao gồm:

- **Agents**: Các chuyên gia AI chuyên biệt (mobile-developer, frontend-specialist, backend-specialist, etc.)
- **Rules**: Quy tắc hoạt động (GEMINI.md)
- **Skills**: Các kỹ năng chuyên môn (mobile-design, frontend-design, etc.)
- **Workflows**: Các quy trình làm việc (create, orchestrate, debug, etc.)

---

## 🗂️ Cấu Trúc Folder .agent

```
.agent/
├── agents/              # Các agent chuyên biệt
│   ├── mobile-developer.md
│   ├── frontend-specialist.md
│   ├── backend-specialist.md
│   └── ... (16 agents khác)
│
├── rules/               # Quy tắc hoạt động
│   └── GEMINI.md       # File quy tắc chính
│
├── skills/              # Các kỹ năng chuyên môn
│   ├── mobile-design/
│   ├── frontend-design/
│   ├── api-patterns/
│   └── ... (30+ skills)
│
└── workflows/           # Các quy trình làm việc
    ├── create.md
    ├── orchestrate.md
    ├── debug.md
    └── ... (11 workflows)
```

---

## 🚀 Cách Sử Dụng - Step by Step

### Bước 1: Hiểu Quy Tắc Chính (GEMINI.md)

**File quan trọng nhất**: `.agent/rules/GEMINI.md`

File này định nghĩa cách AI hoạt động trong workspace của bạn. Nó bao gồm:

- **TIER 0**: Quy tắc toàn cục (luôn áp dụng)
- **TIER 1**: Quy tắc khi viết code
- **TIER 2**: Quy tắc thiết kế

**Điều quan trọng**:
- AI sẽ tự động đọc file này khi bắt đầu làm việc
- File này có quyền ưu tiên cao nhất (P0)
- Tất cả các agent khác phải tuân theo quy tắc trong file này

### Bước 2: Chọn Agent Phù Hợp

Dựa vào loại công việc, chọn agent tương ứng:

| Loại Công Việc | Agent Nên Dùng |
|----------------|----------------|
| **Mobile App** (Flutter, React Native) | `mobile-developer` |
| **Web Frontend** (React, Vue) | `frontend-specialist` |
| **Backend/API** | `backend-specialist` |
| **Database** | `database-architect` |
| **Security** | `security-auditor` |
| **Testing** | `test-engineer` |
| **Debugging** | `debugger` |
| **Planning** | `project-planner` |

**Ví dụ cho dự án VietTune (Flutter)**:
- Agent chính: `mobile-developer`
- Skills: `mobile-design`, `clean-code`

### Bước 3: Sử Dụng Workflows

Workflows là các quy trình làm việc được định nghĩa sẵn:

#### 3.1. Workflow `/create` - Tạo Ứng Dụng Mới

**Khi nào dùng**: Khi bạn muốn tạo một ứng dụng mới từ đầu

**Cách sử dụng**:
```
/create blog site
/create todo app
/create e-commerce app
```

**Quy trình**:
1. Phân tích yêu cầu
2. Lập kế hoạch (project-planner)
3. Xây dựng ứng dụng (app-builder)
4. Preview

#### 3.2. Workflow `/orchestrate` - Điều Phối Nhiều Agent

**Khi nào dùng**: Khi công việc phức tạp, cần nhiều chuyên gia

**Cách sử dụng**:
```
/orchestrate build authentication system
/orchestrate refactor codebase
```

**Quy trình**:
- **PHASE 1**: Planning (project-planner tạo PLAN.md)
- **PHASE 2**: Implementation (nhiều agent làm việc song song)

**Lưu ý quan trọng**:
- Phải sử dụng **tối thiểu 3 agent khác nhau**
- Phải có sự chấp thuận của user trước khi chuyển sang Phase 2

#### 3.3. Workflow `/debug` - Debug Hệ Thống

**Khi nào dùng**: Khi có lỗi cần phân tích

**Cách sử dụng**:
```
/debug authentication not working
/debug performance issue
```

#### 3.4. Workflow `/plan` - Lập Kế Hoạch

**Khi nào dùng**: Khi cần lập kế hoạch chi tiết trước khi code

**Cách sử dụng**:
```
/plan add new feature
/plan refactor architecture
```

**Quy trình 4 pha**:
1. **ANALYSIS** → Nghiên cứu, đặt câu hỏi
2. **PLANNING** → Tạo `{task-slug}.md`, phân tích task
3. **SOLUTIONING** → Thiết kế kiến trúc (KHÔNG code!)
4. **IMPLEMENTATION** → Code + tests

---

## 📖 Cách Agent Hoạt Động

### Quy Trình Kích Hoạt Agent

```
1. User yêu cầu công việc
   ↓
2. AI đọc GEMINI.md (quy tắc chính)
   ↓
3. AI chọn agent phù hợp
   ↓
4. Agent đọc file agent của mình (ví dụ: mobile-developer.md)
   ↓
5. Agent đọc các skills được liệt kê trong frontmatter
   ↓
6. Agent chỉ đọc các phần liên quan trong skills (không đọc toàn bộ)
   ↓
7. Agent thực hiện công việc theo quy tắc
```

### Ví Dụ Cụ Thể: Mobile Developer Agent

Khi bạn yêu cầu: *"Thêm màn hình đăng nhập cho app Flutter"*

1. **AI đọc GEMINI.md** → Hiểu quy tắc chung
2. **AI chọn `mobile-developer`** → Vì đây là Flutter app
3. **Agent đọc `mobile-developer.md`** → Hiểu quy tắc mobile
4. **Agent đọc skills**:
   - `mobile-design/SKILL.md` (tổng quan)
   - `mobile-design/mobile-design-thinking.md` (quan trọng nhất!)
   - `mobile-design/touch-psychology.md` (touch targets)
   - `mobile-design/mobile-performance.md` (tối ưu)
5. **Agent thực hiện**:
   - Tạo màn hình với touch targets ≥ 44-48px
   - Sử dụng FlatList/ListView.builder cho lists
   - Áp dụng platform conventions (iOS/Android)
   - Kiểm tra performance

---

## 🎯 Best Practices

### ✅ Nên Làm

1. **Để AI tự động chọn agent**: AI sẽ tự chọn agent phù hợp dựa vào context
2. **Sử dụng workflows cho công việc phức tạp**: `/orchestrate`, `/plan`
3. **Đọc GEMINI.md trước**: Hiểu quy tắc chung
4. **Kiên nhẫn với Socratic Gate**: AI sẽ hỏi để hiểu rõ yêu cầu

### ❌ Không Nên

1. **Không chỉ định agent cụ thể trừ khi cần**: Để AI tự chọn
2. **Không bỏ qua planning cho công việc phức tạp**: Dùng `/plan` mode
3. **Không mong đợi AI code ngay**: AI sẽ hỏi để hiểu rõ trước

---

## 🔍 Các Tính Năng Đặc Biệt

### 1. Socratic Gate (Cổng Socratic)

**Mục đích**: Đảm bảo AI hiểu rõ yêu cầu trước khi code

**Khi nào kích hoạt**:
- Yêu cầu mơ hồ
- Công việc phức tạp
- Thiếu thông tin

**Ví dụ**:
```
User: "Thêm tính năng đăng nhập"
AI: "Tôi cần làm rõ một số điểm:
1. Platform: iOS, Android, hay cả hai?
2. Framework: Flutter hay React Native?
3. Authentication: Email/password, OAuth, hay cả hai?
4. Offline: Có cần hoạt động offline không?"
```

### 2. Checkpoint Protocol

Trước khi code, agent phải hoàn thành checkpoint:

```
🧠 CHECKPOINT:

Platform:   [ iOS / Android / Both ]
Framework:  [ React Native / Flutter ]
Files Read: [ List các file đã đọc ]

3 Principles I Will Apply:
1. _______________
2. _______________
3. _______________

Anti-Patterns I Will Avoid:
1. _______________
2. _______________
```

### 3. Build Verification

**Quan trọng**: Agent phải chạy build thực tế trước khi báo "hoàn thành"

**Ví dụ cho Flutter**:
```bash
flutter build apk --debug  # Android
flutter build ios --debug  # iOS
```

**Agent sẽ kiểm tra**:
- ✅ Build thành công
- ✅ App chạy được
- ✅ Không có lỗi console
- ✅ Các tính năng chính hoạt động

---

## 📝 Ví Dụ Sử Dụng Thực Tế

### Ví Dụ 1: Tạo Màn Hình Mới

**Yêu cầu**: "Thêm màn hình profile cho user"

**Quy trình**:
1. AI đọc GEMINI.md
2. AI chọn `mobile-developer` (vì Flutter app)
3. Agent đọc `mobile-developer.md` và skills
4. Agent hỏi (Socratic Gate):
   - "Màn hình này cần hiển thị thông tin gì?"
   - "Có cần chỉnh sửa profile không?"
5. Agent tạo code theo quy tắc mobile
6. Agent chạy build verification
7. Hoàn thành

### Ví Dụ 2: Refactor Code

**Yêu cầu**: "Refactor toàn bộ authentication system"

**Quy trình**:
1. Sử dụng `/orchestrate` workflow
2. **PHASE 1**: `project-planner` tạo PLAN.md
3. User chấp thuận plan
4. **PHASE 2**: Nhiều agent làm việc:
   - `backend-specialist` → API refactor
   - `security-auditor` → Security check
   - `test-engineer` → Tests
5. Verification scripts chạy
6. Hoàn thành

### Ví Dụ 3: Debug Lỗi

**Yêu cầu**: "App crash khi mở màn hình danh sách bài hát"

**Quy trình**:
1. Sử dụng `/debug` workflow
2. `debugger` agent phân tích
3. `explorer-agent` tìm nguyên nhân
4. `mobile-developer` sửa lỗi
5. `test-engineer` verify
6. Hoàn thành

---

## 🛠️ Các Skills Quan Trọng

### mobile-design
- **SKILL.md**: Tổng quan, anti-patterns
- **mobile-design-thinking.md**: ⚠️ QUAN TRỌNG NHẤT - Tránh memorization
- **touch-psychology.md**: Touch targets, gestures
- **mobile-performance.md**: Tối ưu performance
- **platform-ios.md**: iOS conventions
- **platform-android.md**: Android conventions

### clean-code
- Quy tắc coding chung (GLOBAL)
- Áp dụng cho tất cả code

### brainstorming
- Socratic questioning protocol
- Giúp AI hiểu rõ yêu cầu

---

## ⚠️ Lưu Ý Quan Trọng

1. **File .agent bị ignore**: Folder này không được commit vào git (đã có trong .gitignore)
2. **AI tự động đọc**: Bạn không cần làm gì, AI sẽ tự đọc khi cần
3. **Quy tắc có thứ tự ưu tiên**: 
   - P0: GEMINI.md (cao nhất)
   - P1: Agent file
   - P2: Skill file
4. **Agent phải đọc skills trước khi code**: Không được bỏ qua bước này
5. **Build verification là bắt buộc**: Agent không được báo "hoàn thành" nếu chưa chạy build

---

## 🎓 Tóm Tắt Nhanh

1. **Folder `.agent`** chứa hệ thống AI agents, rules, skills, workflows
2. **GEMINI.md** là quy tắc chính, có quyền ưu tiên cao nhất
3. **Agents** là các chuyên gia chuyên biệt (mobile, frontend, backend, etc.)
4. **Skills** là các kỹ năng chi tiết (mobile-design, clean-code, etc.)
5. **Workflows** là các quy trình làm việc (`/create`, `/orchestrate`, `/debug`)
6. **AI tự động sử dụng**: Bạn chỉ cần yêu cầu, AI sẽ tự chọn agent và workflow phù hợp
7. **Socratic Gate**: AI sẽ hỏi để hiểu rõ yêu cầu trước khi code
8. **Build Verification**: Agent phải chạy build thực tế trước khi hoàn thành

---

## 📚 Tài Liệu Tham Khảo

- **GEMINI.md**: `.agent/rules/GEMINI.md` - Quy tắc chính
- **Mobile Developer**: `.agent/agents/mobile-developer.md` - Agent mobile
- **Mobile Design Skill**: `.agent/skills/mobile-design/` - Kỹ năng mobile
- **Workflows**: `.agent/workflows/` - Các quy trình làm việc

---

**Lưu ý**: Hệ thống này được thiết kế để AI tự động sử dụng. Bạn không cần phải chỉ định agent hay workflow cụ thể - chỉ cần mô tả công việc bạn muốn làm, và AI sẽ tự động chọn cách tốt nhất!
