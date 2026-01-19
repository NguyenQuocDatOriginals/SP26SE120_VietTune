# Hướng Dẫn Sử Dụng Mobile Developer Agent - Với Ví Dụ Mẫu

## 📱 Tổng Quan

Mobile Developer Agent là một chuyên gia AI chuyên về phát triển ứng dụng mobile, đặc biệt là **Flutter** và **React Native**. Agent này được thiết kế để giúp bạn xây dựng ứng dụng mobile với các best practices về performance, UX, và platform conventions.

---

## 🎯 Khi Nào Sử Dụng Mobile Developer Agent?

Agent này sẽ tự động được kích hoạt khi bạn:
- Làm việc với dự án Flutter (như VietTune Archive)
- Làm việc với dự án React Native
- Yêu cầu các tính năng mobile (iOS, Android)
- Gặp vấn đề về performance mobile
- Cần tối ưu UI/UX cho mobile

**Bạn không cần gọi agent trực tiếp** - AI sẽ tự động chọn agent này khi phát hiện context mobile.

---

## 📋 Các Ví Dụ Sử Dụng Thực Tế

### Ví Dụ 1: Tạo Màn Hình Mới

**Yêu cầu của bạn:**
```
Thêm màn hình profile cho user trong app Flutter
```

**Agent sẽ làm gì:**
1. ✅ Đọc quy tắc từ `GEMINI.md`
2. ✅ Kích hoạt `mobile-developer` agent
3. ✅ Đọc `mobile-developer.md` và các skills liên quan
4. ✅ Hỏi bạn (Socratic Gate):
   - "Màn hình này cần hiển thị thông tin gì?"
   - "Có cần chỉnh sửa profile không?"
   - "Có cần upload avatar không?"
5. ✅ Tạo code theo quy tắc mobile:
   - Touch targets ≥ 44-48px
   - Sử dụng ListView.builder cho lists
   - Platform-specific navigation
6. ✅ Chạy build verification
7. ✅ Hoàn thành

**Kết quả:**
- File mới: `lib/presentation/profile/pages/profile_page.dart`
- Code tuân theo Flutter best practices
- UI responsive và accessible

---

### Ví Dụ 2: Sửa Lỗi Overflow (Như Vừa Làm)

**Yêu cầu của bạn:**
```
/mobile-developer kiểm tra lỗi và sửa nó
```

**Agent sẽ làm gì:**
1. ✅ Phát hiện lỗi "BOTTOM OVERFLOWED BY 7.0 PIXELS"
2. ✅ Tìm file liên quan: `discover_home_page.dart` và `song_card.dart`
3. ✅ Phân tích nguyên nhân:
   - Container height: 200px
   - SongCard có margin vertical: 8px
   - Nội dung vượt quá không gian
4. ✅ Sửa lỗi:
   - Tăng height từ 200px → 240px
   - Thêm parameter `margin` vào SongCard
   - Giảm margin vertical khi dùng trong horizontal list
5. ✅ Chạy `flutter analyze` để verify
6. ✅ Hoàn thành

**Kết quả:**
- ✅ Lỗi overflow đã được sửa
- ✅ Code clean, không có warnings
- ✅ Layout hiển thị đúng

---

### Ví Dụ 3: Tối Ưu Performance

**Yêu cầu của bạn:**
```
Danh sách bài hát scroll chậm, tối ưu performance
```

**Agent sẽ làm gì:**
1. ✅ Đọc `mobile-performance.md` skill
2. ✅ Kiểm tra code hiện tại:
   - Có dùng ScrollView cho list? → ❌ SAI
   - Có memoize renderItem? → Kiểm tra
   - Có dùng keyExtractor? → Kiểm tra
3. ✅ Áp dụng optimizations:
   ```dart
   // ❌ TRƯỚC (Chậm)
   ListView(
     children: songs.map((song) => SongCard(song: song)).toList(),
   )
   
   // ✅ SAU (Nhanh)
   ListView.builder(
     itemCount: songs.length,
     itemBuilder: (context, index) {
       return SongCard(
         key: ValueKey(songs[index].id),
         song: songs[index],
       );
     },
   )
   ```
4. ✅ Thêm `const` constructors
5. ✅ Memoize widgets với `const`
6. ✅ Verify performance

**Kết quả:**
- ✅ Scroll mượt 60fps
- ✅ Memory usage giảm
- ✅ App responsive hơn

---

### Ví Dụ 4: Thêm Tính Năng Mới

**Yêu cầu của bạn:**
```
Thêm tính năng tìm kiếm bài hát với filter
```

**Agent sẽ làm gì:**
1. ✅ Hỏi bạn (Socratic Gate):
   - "Filter theo gì? (Genre, Ethnic Group, Instrument?)"
   - "Có cần search real-time không?"
   - "Có cần lưu search history không?"
2. ✅ Tạo architecture:
   - Domain: `SearchSongs` use case
   - Data: Repository implementation
   - Presentation: Search page với filters
3. ✅ Implement theo Clean Architecture:
   ```
   domain/usecases/discovery/search_songs.dart
   data/repositories/song_repository_impl.dart
   presentation/discovery/pages/search_page.dart
   ```
4. ✅ UI với mobile best practices:
   - TextField với debounce
   - Filter chips với touch targets ≥ 44px
   - Loading states
   - Error handling
5. ✅ Tests
6. ✅ Build verification

**Kết quả:**
- ✅ Tính năng search hoàn chỉnh
- ✅ UI/UX tốt
- ✅ Code tuân theo architecture

---

### Ví Dụ 5: Fix Bug Navigation

**Yêu cầu của bạn:**
```
App crash khi navigate từ home sang detail page
```

**Agent sẽ làm gì:**
1. ✅ Kích hoạt `debugger` agent (nếu cần)
2. ✅ Phân tích lỗi:
   - Kiểm tra route configuration
   - Kiểm tra parameter passing
   - Kiểm tra null safety
3. ✅ Tìm root cause:
   ```dart
   // ❌ LỖI
   context.push('/discover/song/${song.id}'); // song.id có thể null
   
   // ✅ SỬA
   if (song.id != null) {
     context.push('/discover/song/${song.id}');
   }
   ```
4. ✅ Sửa lỗi với proper error handling
5. ✅ Test navigation flow
6. ✅ Verify không còn crash

**Kết quả:**
- ✅ Navigation hoạt động đúng
- ✅ Không còn crash
- ✅ Error handling tốt hơn

---

### Ví Dụ 6: Tối Ưu UI/UX

**Yêu cầu của bạn:**
```
Cải thiện UI của màn hình danh sách bài hát
```

**Agent sẽ làm gì:**
1. ✅ Đọc `mobile-design` skills:
   - `touch-psychology.md` - Touch targets, gestures
   - `mobile-design-thinking.md` - Design principles
   - `platform-ios.md` / `platform-android.md` - Platform conventions
2. ✅ Phân tích UI hiện tại:
   - Touch targets đủ lớn? (≥ 44-48px)
   - Spacing hợp lý? (≥ 8-12px)
   - Có loading states?
   - Có error states?
3. ✅ Cải thiện:
   ```dart
   // ✅ Touch target đủ lớn
   SizedBox(
     height: 48, // ≥ 44px
     width: 48,
     child: IconButton(...),
   )
   
   // ✅ Spacing hợp lý
   const SizedBox(height: 12), // ≥ 8px
   
   // ✅ Loading state
   if (isLoading) CircularProgressIndicator()
   else if (hasError) ErrorView()
   else SongList()
   ```
4. ✅ Thêm animations mượt
5. ✅ Verify UX

**Kết quả:**
- ✅ UI đẹp hơn, dễ dùng hơn
- ✅ Touch targets đúng chuẩn
- ✅ Animations mượt mà

---

## 🔧 Các Tính Năng Đặc Biệt Của Mobile Developer Agent

### 1. Socratic Gate (Cổng Socratic)

Agent sẽ **luôn hỏi** trước khi code nếu yêu cầu chưa rõ:

**Ví dụ:**
```
Bạn: "Thêm tính năng đăng nhập"

Agent: "Tôi cần làm rõ một số điểm:
1. Platform: iOS, Android, hay cả hai?
2. Authentication: Email/password, OAuth, hay cả hai?
3. Có cần remember me không?
4. Có cần biometric (Face ID/Touch ID) không?"
```

**Tại sao?** Để tránh code sai và phải sửa lại nhiều lần.

---

### 2. Checkpoint Protocol

Trước khi code, agent phải hoàn thành checkpoint:

```
🧠 CHECKPOINT:

Platform:   iOS + Android (Cross-platform)
Framework:  Flutter
Files Read: SKILL.md, mobile-performance.md, platform-ios.md, platform-android.md

3 Principles I Will Apply:
1. ListView.builder cho tất cả lists
2. Touch targets ≥ 48px
3. Platform-specific navigation

Anti-Patterns I Will Avoid:
1. ScrollView cho lists → ListView.builder
2. Inline renderItem → Memoized
3. AsyncStorage cho tokens → SecureStore
```

---

### 3. Build Verification

Agent **phải chạy build thực tế** trước khi báo "hoàn thành":

**Ví dụ:**
```bash
# Agent sẽ tự động chạy:
flutter build apk --debug  # Android
flutter build ios --debug   # iOS

# Và kiểm tra:
✅ Build thành công?
✅ App chạy được?
✅ Không có lỗi console?
✅ Tính năng chính hoạt động?
```

**Tại sao?** Để đảm bảo code thực sự hoạt động, không chỉ "nhìn có vẻ đúng".

---

## 📚 Các Skills Agent Sử Dụng

### mobile-design
- **SKILL.md**: Tổng quan, anti-patterns
- **mobile-design-thinking.md**: ⚠️ QUAN TRỌNG - Tránh memorization
- **touch-psychology.md**: Touch targets, gestures, Fitts' Law
- **mobile-performance.md**: Tối ưu performance (60fps)
- **mobile-navigation.md**: Navigation patterns
- **platform-ios.md**: iOS conventions
- **platform-android.md**: Android conventions

### clean-code
- Quy tắc coding chung (GLOBAL)
- Áp dụng cho tất cả code

---

## 🚫 Các Anti-Patterns Agent Tránh

### Performance Sins

| ❌ NEVER | ✅ ALWAYS |
|----------|----------|
| `ScrollView` cho lists | `ListView.builder` / `FlatList` |
| Inline `renderItem` | `useCallback` + `React.memo` |
| Missing `keyExtractor` | Stable unique ID |
| `useNativeDriver: false` | `useNativeDriver: true` |
| `console.log` trong production | Remove trước release |

### Touch/UX Sins

| ❌ NEVER | ✅ ALWAYS |
|----------|----------|
| Touch target < 44px | Minimum 44pt (iOS) / 48dp (Android) |
| Spacing < 8px | Minimum 8-12px gap |
| Gesture-only (no button) | Provide visible button alternative |
| No loading state | ALWAYS show loading feedback |
| No error state | Show error với retry option |

### Security Sins

| ❌ NEVER | ✅ ALWAYS |
|----------|----------|
| Token trong `AsyncStorage` | `SecureStore` / `Keychain` |
| Hardcode API keys | Environment variables |
| Skip SSL pinning | Pin certificates trong production |
| Log sensitive data | Never log tokens, passwords, PII |

---

## 💡 Best Practices Khi Làm Việc Với Agent

### ✅ Nên Làm

1. **Mô tả rõ ràng yêu cầu**: Càng chi tiết càng tốt
2. **Trả lời câu hỏi của agent**: Giúp agent hiểu đúng
3. **Kiên nhẫn với Socratic Gate**: Agent hỏi để tránh sai sót
4. **Review code sau khi agent tạo**: Đảm bảo đúng ý bạn

### ❌ Không Nên

1. **Yêu cầu mơ hồ**: "Làm cho đẹp hơn" → Quá mơ hồ
2. **Bỏ qua câu hỏi của agent**: Agent sẽ phải đoán → Có thể sai
3. **Yêu cầu code ngay lập tức**: Agent cần hiểu rõ trước

---

## 🎓 Ví Dụ Câu Lệnh Hiệu Quả

### ✅ Tốt (Rõ ràng, cụ thể)

```
"Thêm màn hình profile với:
- Hiển thị avatar, tên, email
- Nút chỉnh sửa profile
- Danh sách bài hát yêu thích
- Nút đăng xuất"
```

```
"Sửa lỗi overflow trên màn hình discovery"
```

```
"Tối ưu performance của danh sách bài hát, hiện scroll chậm"
```

### ❌ Không Tốt (Mơ hồ)

```
"Làm cho app đẹp hơn"
```

```
"Thêm tính năng"
```

```
"Sửa lỗi"
```

---

## 🔍 Debugging Với Mobile Developer Agent

### Khi App Crash

**Yêu cầu:**
```
App crash khi mở màn hình danh sách bài hát
```

**Agent sẽ:**
1. ✅ Phân tích stack trace
2. ✅ Tìm file liên quan
3. ✅ Kiểm tra null safety
4. ✅ Kiểm tra async/await
5. ✅ Sửa lỗi
6. ✅ Test lại

### Khi Performance Kém

**Yêu cầu:**
```
Danh sách bài hát scroll lag, cần tối ưu
```

**Agent sẽ:**
1. ✅ Đọc `mobile-performance.md`
2. ✅ Kiểm tra code:
   - Có dùng ListView.builder?
   - Có memoize widgets?
   - Có const constructors?
3. ✅ Áp dụng optimizations
4. ✅ Verify performance

---

## 📝 Tóm Tắt

1. **Mobile Developer Agent** tự động kích hoạt khi làm việc với Flutter/React Native
2. **Socratic Gate**: Agent sẽ hỏi để hiểu rõ yêu cầu
3. **Checkpoint Protocol**: Agent phải hoàn thành checkpoint trước khi code
4. **Build Verification**: Agent phải chạy build thực tế
5. **Best Practices**: Agent tuân theo mobile best practices
6. **Anti-Patterns**: Agent tránh các lỗi phổ biến

---

## 🚀 Bắt Đầu Sử Dụng

Chỉ cần mô tả công việc bạn muốn làm, agent sẽ tự động:
- ✅ Chọn agent phù hợp (mobile-developer)
- ✅ Đọc quy tắc và skills
- ✅ Hỏi để hiểu rõ (nếu cần)
- ✅ Code theo best practices
- ✅ Verify và hoàn thành

**Ví dụ:**
```
"Thêm màn hình settings với dark mode toggle"
```

Agent sẽ tự động làm tất cả! 🎉
