# 🧠 Brainstorm: Tối ưu New Contribution Page

**Created:** 2026-01-22  
**Updated:** 2026-01-22 (v2 - incorporated feedback)  
**Status:** ✅ Ready for Planning

---

## 📋 Context

### Current State Analysis

**6-Step Wizard Flow:**
1. **Audio Upload** - Pick file, extract metadata
2. **Basic Info** - Title, author, genre, location, performer, language, recording date
3. **Cultural Context** - Ethnic group selection
4. **Performance Details** - Performance type, instruments, vocal style
5. **Notes & Copyright** - Field notes, copyright info
6. **Review & Submit** - Summary and submit

### Current Strengths ✅
- Draft auto-save every 30 seconds
- Step Navigator with clickable steps
- AnimatedSwitcher for smooth transitions
- Validation per step
- Accessibility support (Semantics)
- Resume draft on return

### Current Weaknesses ❌

| Issue | Impact | Severity |
|-------|--------|----------|
| **Step Navigator quá chật trên mobile** | Khó chạm vào step cụ thể, text bị cắt | High |
| **Basic Info quá tải** | 7+ fields trong 1 step = cognitive overload | High |
| **Ghi âm chưa implement** | Core feature thiếu | High |
| **Deprecated colors** | Code smell, potential issues | Medium |
| **Không có AI suggestions** | Manual input tất cả | Medium |
| **Text fields cho multi-value** | UX kém cho performer names, instruments | Medium |
| **Không có progress per field** | Không biết còn bao nhiêu field | Low |
| **Review step basic** | Chỉ show text, không preview audio | Low |

---

## 🎯 Problem Statement

**Primary Goals:**
1. Giảm cognitive load - Chia nhỏ thông tin hợp lý
2. Tăng completion rate - UX mượt hơn, ít abandon
3. Mobile-first - Tối ưu cho màn hình nhỏ
4. Smart defaults - AI/ML suggestions giảm manual input

**Key Metrics:**
- Time to complete contribution
- Step abandonment rate
- Field error rate
- User satisfaction

---

## 💡 Option A: UI Polish (Quick Wins)

**Approach:** Tối ưu UI/UX với minimal code changes

### Features:

1. **Responsive Step Navigator**
   - Horizontal scroll trên mobile
   - Chỉ show icon + số trên màn hình nhỏ
   - Expand title on hover/tap

2. **Better Form Fields**
   - Chips cho multiple values (performers, instruments)
   - Autocomplete cho location
   - Date picker cải tiến (month/year picker option)

3. **Visual Feedback**
   - Skeleton loading khi extract metadata
   - Field completion indicators
   - Subtle animations

4. **Fix Deprecated Code**
   - Replace `AppColors.primaryRed` → `AppColors.primary`
   - Replace `textOnGradient` → appropriate color

### Implementation:
```dart
// Step Navigator improvements
StepNavigator(
  mode: context.isSmallScreen ? StepNavigatorMode.compact : StepNavigatorMode.full,
  // ...
)

// Chip input for performers
ChipInput(
  chips: performers,
  onChipsChanged: (chips) => formNotifier.updateArtist(chips),
  suggestions: suggestedPerformers,
)
```

✅ **Pros:**
- Quick implementation (1-2 weeks)
- No architecture changes
- Immediate visual improvement
- Low risk

❌ **Cons:**
- Doesn't address fundamental UX issues
- No smart features
- Basic Info still overloaded

📊 **Effort:** Low (1-2 weeks)

---

## 💡 Option B: Step Restructuring

**Approach:** Reorganize 6 steps thành logical groups khác

### Proposed New Structure:

| # | Step | Fields | Rationale |
|---|------|--------|-----------|
| 0 | **Media** | Audio file, Record | Core input first |
| 1 | **Identity** | Title, Genre, Language | "What is it?" |
| 2 | **People** | Author, Performers, Ethnic Group | "Who made it?" |
| 3 | **Context** | Location, Date, Ritual Context | "Where/When/Why?" |
| 4 | **Details** | Performance type, Instruments, Vocal style | Conditional fields |
| 5 | **Finalize** | Notes, Copyright, Review | Wrap up |

### Features:

1. **Logical Grouping**
   - Related fields together
   - Clear mental model
   - Progressive complexity

2. **Conditional Steps**
   - Skip "Details" if audio-only
   - Show relevant fields based on performance type

3. **Merged Review**
   - Notes + Copyright + Review in one step
   - Inline editing in review

### Implementation:
- Reorganize step widgets
- Update validation logic
- Update step titles/icons

✅ **Pros:**
- Better information architecture
- Reduces cognitive load
- Logical flow

❌ **Cons:**
- Requires rewriting multiple steps
- Testing all new flows
- May confuse existing users

📊 **Effort:** Medium (2-3 weeks)

---

## 💡 Option C: Smart Wizard with AI

**Approach:** Tích hợp AI để giảm manual input

### Features:

1. **Audio Intelligence**
   ```
   Upload → AI analyzes → Suggests:
   - Ethnic group (from musical patterns)
   - Instruments detected
   - Vocal style classification
   - Tempo/rhythm category
   ```

2. **Smart Suggestions**
   - Location autocomplete từ GPS + database
   - Performer name suggestions từ previous contributions
   - Genre prediction từ audio features

3. **Voice Input**
   - Speech-to-text cho field notes
   - Voice command navigation
   - Dictate performer names

4. **Pre-fill from Metadata**
   - If audio has ID3 tags → auto-fill
   - If similar audio exists → suggest duplicate check

### Implementation:
```dart
// Audio analysis service
class AudioIntelligenceService {
  Future<AudioAnalysis> analyze(String audioPath) async {
    // Local ML model or API call
    return AudioAnalysis(
      suggestedEthnicGroup: 'Tày',
      suggestedInstruments: ['Đàn tính', 'Sáo'],
      confidence: 0.85,
    );
  }
}

// In AudioUploadStep
onAudioSelected: (file) async {
  final analysis = await audioIntelligence.analyze(file.path);
  if (analysis.confidence > 0.7) {
    showSuggestionDialog(analysis);
  }
}
```

✅ **Pros:**
- Significantly reduces manual input
- Modern UX expectation
- Higher data accuracy
- Differentiated product

❌ **Cons:**
- Requires ML model/API integration
- Higher complexity
- May need backend support
- Longer implementation

📊 **Effort:** High (4-6 weeks)

---

## 💡 Option D: Mobile-First Redesign

**Approach:** Full redesign optimized for mobile

### Features:

1. **Bottom Sheet Steps**
   - Replace top navigator with bottom progress
   - Swipe gestures between steps
   - Floating action for next/back

2. **Card-Based Forms**
   - Each field in collapsible card
   - Touch-optimized spacing (48dp minimum)
   - Large tap targets

3. **Progressive Disclosure**
   - Show required fields first
   - Optional fields in expandable sections
   - "Add more details" button

4. **Gesture Navigation**
   - Swipe left/right between steps
   - Pull down to save draft
   - Long press for help

### Design Mockup:
```
┌─────────────────────────┐
│ ← Đóng góp mới          │
├─────────────────────────┤
│                         │
│  ┌───────────────────┐  │
│  │ 🎵 Audio          │  │
│  │ bai-hat.mp3       │  │
│  │ 3:45 • MP3 • 320k │  │
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │ Tên bài hát *     │  │
│  │ [_______________] │  │
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │ Thể loại *    ▼   │  │
│  │ Dân ca            │  │
│  └───────────────────┘  │
│                         │
│  + Thêm thông tin       │
│                         │
├─────────────────────────┤
│ ●○○○○○  Tiếp theo  →    │
└─────────────────────────┘
```

✅ **Pros:**
- Excellent mobile UX
- Modern design patterns
- Touch-optimized
- Clear hierarchy

❌ **Cons:**
- Major redesign effort
- Desktop experience different
- Learning curve for users

📊 **Effort:** High (3-4 weeks)

---

## 💡 Option E: Hybrid Incremental ⭐ (Recommended)

**Approach:** Combine best elements, implement incrementally với focus on UX delight

---

### Phase 1 & 2: UI Polish + Micro-interactions (Week 1-2)

#### 🎨 Visual Improvements
- Fix deprecated colors (`AppColors.primaryRed` → `AppColors.primary`)
- Responsive step navigator (scroll on mobile)
- Better touch targets (minimum 48dp)
- Skeleton loading states

#### 📳 Haptic Feedback System
Tăng cảm giác "vật lý" khi thao tác trên mobile:

| Event | Haptic Type | Mô tả |
|-------|-------------|-------|
| Step completed | `HapticFeedback.mediumImpact()` | Rung nhẹ khi hoàn thành step |
| Validation error | `HapticFeedback.heavyImpact()` | Rung mạnh hơn khi có lỗi |
| Field focus | `HapticFeedback.selectionClick()` | Click nhẹ khi chạm field |
| Button tap | `HapticFeedback.lightImpact()` | Feedback khi nhấn nút |
| Draft saved | `HapticFeedback.selectionClick()` | Xác nhận đã lưu |

```dart
// Haptic service
class HapticService {
  static void onStepComplete() {
    if (Platform.isIOS || Platform.isAndroid) {
      HapticFeedback.mediumImpact();
    }
  }
  
  static void onValidationError() {
    HapticFeedback.heavyImpact();
  }
  
  static void onFieldFocus() {
    HapticFeedback.selectionClick();
  }
}

// Usage in StepNavigator
onStepComplete: () {
  HapticService.onStepComplete();
  // Show success animation
}
```

#### 📝 Form UX Enhancements
- ChipInput cho performers/instruments
- Field-level validation với haptic feedback
- Animated error messages
- Progress indicators per field

---

### Phase 3: Progressive Disclosure Strategy (Week 3)

#### 🎯 Core Principle
> "Làm form trông 'ngắn' hơn về mặt cảm giác → Giảm tỷ lệ bỏ cuộc từ cái nhìn đầu tiên"

#### Chia Basic Info → Identity + People

**Step: Identity (Bắt buộc hiện trước)**
```
┌─────────────────────────────────┐
│ Tên bài hát *                   │
│ [_____________________________] │
│                                 │
│ Thể loại *              ▼       │
│ [Dân ca                       ] │
│                                 │
│ Ngôn ngữ *              ▼       │
│ [Tiếng Việt                   ] │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ + Thêm chi tiết             │ │ ← Expand button
│ └─────────────────────────────┘ │
│                                 │
│ ▼ Chi tiết bổ sung (collapsed)  │
│   • Địa điểm ghi âm             │
│   • Ngày ghi âm                 │
└─────────────────────────────────┘
```

**Expanded State:**
```
┌─────────────────────────────────┐
│ ▲ Chi tiết bổ sung              │
│                                 │
│   Địa điểm ghi âm               │
│   [_____________________________│
│   VD: Đình làng X, Nhà văn hóa Y│
│                                 │
│   Ngày ghi âm                   │
│   [📅 Chọn ngày            ]    │
│   ☐ Ngày ước tính               │
└─────────────────────────────────┘
```

**Step: People (Tương tự)**
```
┌─────────────────────────────────┐
│ Nghệ sĩ/Người biểu diễn *       │
│ [Chip] [Chip] [+ Thêm]          │
│ ☐ Không rõ                      │
│                                 │
│ Dân tộc *                ▼      │
│ [Tày                          ] │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ + Thêm thông tin tác giả    │ │
│ └─────────────────────────────┘ │
│                                 │
│ ▼ Tác giả (collapsed)           │
│   • Nhạc sĩ/Tác giả             │
│   • ☐ Dân gian/Không rõ         │
└─────────────────────────────────┘
```

#### Implementation:
```dart
class ProgressiveDisclosureSection extends StatefulWidget {
  final String title;
  final List<Widget> requiredFields;
  final List<Widget> optionalFields;
  final String expandButtonText;
  
  // ...
}

// Usage
ProgressiveDisclosureSection(
  title: 'Thông tin định danh',
  requiredFields: [
    TitleField(),
    GenreDropdown(),
    LanguageDropdown(),
  ],
  optionalFields: [
    LocationField(),
    RecordingDateField(),
  ],
  expandButtonText: '+ Thêm chi tiết',
)
```

---

### Phase 4: Low-cost Smart Suggestions (Week 4+)

#### 🧠 Rule-based Approach (Không cần ML phức tạp)

Thay vì xây dựng ML model, bắt đầu với **Rule-based Suggestions**:

##### 1. Location → GPS Auto-detect
```dart
class LocationSuggestionService {
  final LocationDatabase _db;
  
  Future<LocationSuggestion> suggestFromGPS() async {
    final position = await Geolocator.getCurrentPosition();
    
    // Reverse geocoding với local database
    final province = await _db.getProvinceFromCoords(
      position.latitude, 
      position.longitude,
    );
    
    return LocationSuggestion(
      province: province,
      confidence: 0.9,
    );
  }
}
```

##### 2. Location → Ethnic Group Priority
```dart
// Mapping database: Province → Priority ethnic groups
final Map<String, List<String>> provinceEthnicPriority = {
  'Hà Giang': ['Mông', 'Tày', 'Dao', 'Nùng', 'Lô Lô'],
  'Lào Cai': ['Mông', 'Tày', 'Dao', 'Giáy'],
  'Điện Biên': ['Thái', 'Mông', 'Khơ Mú'],
  'Sơn La': ['Thái', 'Mông', 'Mường'],
  'Đắk Lắk': ['Ê Đê', 'Gia Rai', 'M\'Nông'],
  'Gia Lai': ['Gia Rai', 'Ba Na'],
  'Kon Tum': ['Ba Na', 'Xơ Đăng', 'Giẻ Triêng'],
  // ... 63 tỉnh thành
};

class EthnicGroupSuggestionService {
  List<EthnicGroup> getSuggestedGroups(String province) {
    final priorityIds = provinceEthnicPriority[province] ?? [];
    final allGroups = getAllEthnicGroups();
    
    // Sort: Priority groups first, then alphabetical
    return allGroups..sort((a, b) {
      final aIndex = priorityIds.indexOf(a.name);
      final bIndex = priorityIds.indexOf(b.name);
      
      if (aIndex >= 0 && bIndex >= 0) return aIndex.compareTo(bIndex);
      if (aIndex >= 0) return -1; // a is priority
      if (bIndex >= 0) return 1;  // b is priority
      return a.name.compareTo(b.name); // Alphabetical
    });
  }
}
```

##### 3. UI với Suggested Badge
```
┌─────────────────────────────────┐
│ Dân tộc *                       │
│                                 │
│ 📍 Gợi ý cho Hà Giang:          │
│ ┌─────┐ ┌─────┐ ┌─────┐         │
│ │Mông │ │ Tày │ │ Dao │ ...     │
│ └─────┘ └─────┘ └─────┘         │
│                                 │
│ Tất cả dân tộc:          ▼      │
│ [Chọn dân tộc              ]    │
└─────────────────────────────────┘
```

##### 4. Recording Feature
```dart
// Sử dụng package: record hoặc flutter_sound
class RecordingService {
  final AudioRecorder _recorder = AudioRecorder();
  
  Future<void> startRecording() async {
    if (await _recorder.hasPermission()) {
      await _recorder.start(
        RecordConfig(
          encoder: AudioEncoder.aacLc,
          bitRate: 128000,
          sampleRate: 44100,
        ),
        path: await _getRecordingPath(),
      );
      HapticService.onFieldFocus(); // Feedback when recording starts
    }
  }
  
  Future<String?> stopRecording() async {
    final path = await _recorder.stop();
    HapticService.onStepComplete(); // Feedback when done
    return path;
  }
}
```

---

### Implementation Priority Matrix (Updated)

| Feature | Impact | Effort | Priority | Phase |
|---------|--------|--------|----------|-------|
| Fix colors | Low | Very Low | P1 | 1 |
| Responsive nav | High | Low | P1 | 1 |
| **Haptic feedback** | Medium | Low | **P1** | **1-2** |
| Chip inputs | Medium | Low | P1 | 2 |
| Loading states | Medium | Low | P1 | 1 |
| Field validation | High | Medium | P2 | 2 |
| **Progressive Disclosure** | High | Medium | **P2** | **3** |
| Location autocomplete | Medium | Medium | P2 | 2 |
| **GPS → Province suggest** | Medium | Low | **P2** | **4** |
| Recording feature | High | High | P2 | 4 |
| Step restructure | High | High | P3 | 3 |
| **Province → Ethnic suggest** | High | Low | **P3** | **4** |

---

✅ **Pros:**
- Incremental delivery với visible progress mỗi tuần
- Haptic feedback tạo UX "premium feel" 
- Progressive Disclosure giảm cognitive load
- Rule-based suggestions = Low cost, High impact
- Có thể upgrade lên ML sau nếu cần

❌ **Cons:**
- Takes longer for full transformation
- Some temporary inconsistencies
- Requires careful coordination

📊 **Effort:** Medium-High (4-5 weeks total)

---

## 📊 Comparison Matrix

| Feature | Option A | Option B | Option C | Option D | Option E |
|---------|----------|----------|----------|----------|----------|
| **Responsive UI** | ✅ | Partial | Partial | ✅ | ✅ |
| **Better Form UX** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Logical Steps** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **📳 Haptic Feedback** | ❌ | ❌ | ❌ | ❌ | **✅** |
| **Progressive Disclosure** | ❌ | Partial | ❌ | ✅ | **✅** |
| **Rule-based Suggestions** | ❌ | ❌ | ML-based | ❌ | **✅** |
| **AI/Smart Features** | ❌ | ❌ | ✅ | ❌ | Partial |
| **Mobile Optimized** | Partial | Partial | Partial | ✅ | ✅ |
| **Recording** | ❌ | ❌ | ✅ | ❌ | ✅ |
| **Effort** | Low | Medium | High | High | Med-High |
| **Risk** | Very Low | Medium | High | Medium | Low |
| **Time to Value** | 1-2w | 3w | 5-6w | 4w | **1w+** |

---

## 💡 Recommendation

### **Option E: Hybrid Incremental** 🏆

**Reasoning:**

1. **Immediate Value + Premium Feel**
   - Quick wins in Week 1
   - 📳 Haptic feedback tạo cảm giác "vật lý" trên mobile
   - Users notice quality improvements fast

2. **Progressive Disclosure = Lower Abandonment**
   - Form trông "ngắn" hơn từ cái nhìn đầu tiên
   - Required fields trước, optional sau
   - Giảm cognitive load đáng kể

3. **Low-cost Smart Features**
   - Rule-based suggestions: GPS → Province → Ethnic priority
   - Không cần ML model phức tạp
   - Có thể upgrade lên AI sau nếu cần

4. **Manageable Risk**
   - Small changes, easy to rollback
   - Test each phase
   - Adjust based on feedback

5. **Practical Timeline**
   - Fits within sprint cycles
   - Clear deliverables per phase
   - Measurable progress mỗi tuần

### Recommended Execution Order:

```
Week 1: 🎨 UI Polish + Micro-interactions
├── Fix deprecated colors
├── Responsive StepNavigator (horizontal scroll mobile)
├── Skeleton loading states
├── Touch target improvements (48dp min)
├── 📳 Haptic feedback: step complete, button tap
└── 📳 Haptic feedback: validation error

Week 2: 📝 Form UX + Field Feedback
├── ChipInput for performers/instruments
├── GPS → Location autocomplete widget
├── Field-level validation với haptic feedback
├── Animated error messages
├── Date picker improvements
└── Progress indicators per field

Week 3: 🔄 Progressive Disclosure
├── Split Basic Info → Identity + People
├── "Thêm chi tiết" expandable sections
├── Show required fields first
├── Conditional Performance Details
├── Merge Notes + Copyright + Review
└── Inline editing in review

Week 4+: 🤖 Rule-based Smart Features
├── Recording implementation (flutter_sound/record)
├── GPS → Province auto-detect
├── Province → Ethnic Group priority sorting
├── Audio metadata auto-fill từ ID3 tags
├── Speech-to-text for field notes
└── (Future) ML-based suggestions
```

### Haptic Feedback Integration Points:

```dart
// services/haptic_service.dart
import 'dart:io';
import 'package:flutter/services.dart';

class HapticService {
  /// Rung nhẹ khi hoàn thành step
  static void onStepComplete() {
    if (Platform.isIOS || Platform.isAndroid) {
      HapticFeedback.mediumImpact();
    }
  }
  
  /// Rung mạnh khi có lỗi validation
  static void onValidationError() {
    HapticFeedback.heavyImpact();
  }
  
  /// Click nhẹ khi chạm field
  static void onFieldFocus() {
    HapticFeedback.selectionClick();
  }
  
  /// Feedback khi nhấn nút
  static void onButtonTap() {
    HapticFeedback.lightImpact();
  }
  
  /// Xác nhận đã lưu draft
  static void onDraftSaved() {
    HapticFeedback.selectionClick();
  }
}
```

### Progressive Disclosure Widget:

```dart
// widgets/progressive_disclosure_section.dart
class ProgressiveDisclosureSection extends StatefulWidget {
  final String title;
  final List<Widget> requiredFields;
  final List<Widget> optionalFields;
  final String expandButtonText;
  final String collapseButtonText;
  
  const ProgressiveDisclosureSection({
    required this.title,
    required this.requiredFields,
    this.optionalFields = const [],
    this.expandButtonText = '+ Thêm chi tiết',
    this.collapseButtonText = '- Ẩn chi tiết',
  });
  
  @override
  State<ProgressiveDisclosureSection> createState() => 
      _ProgressiveDisclosureSectionState();
}

class _ProgressiveDisclosureSectionState 
    extends State<ProgressiveDisclosureSection> {
  bool _isExpanded = false;
  
  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Required fields (always visible)
        ...widget.requiredFields,
        
        // Expand/Collapse button
        if (widget.optionalFields.isNotEmpty)
          AnimatedCrossFade(
            firstChild: _buildExpandButton(),
            secondChild: _buildCollapseButton(),
            crossFadeState: _isExpanded 
                ? CrossFadeState.showSecond 
                : CrossFadeState.showFirst,
            duration: const Duration(milliseconds: 200),
          ),
        
        // Optional fields (expandable)
        AnimatedSize(
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeInOut,
          child: _isExpanded
              ? Column(children: widget.optionalFields)
              : const SizedBox.shrink(),
        ),
      ],
    );
  }
  
  Widget _buildExpandButton() {
    return TextButton.icon(
      onPressed: () {
        setState(() => _isExpanded = true);
        HapticService.onFieldFocus();
      },
      icon: const Icon(Icons.add_circle_outline),
      label: Text(widget.expandButtonText),
    );
  }
  
  Widget _buildCollapseButton() {
    return TextButton.icon(
      onPressed: () {
        setState(() => _isExpanded = false);
        HapticService.onFieldFocus();
      },
      icon: const Icon(Icons.remove_circle_outline),
      label: Text(widget.collapseButtonText),
    );
  }
}
```

---

## 🎯 Immediate Next Steps

1. **✅ Approve approach** - Confirm Option E với enhancements
2. **Create PLAN file** - Chi tiết tasks cho mỗi phase
3. **Week 1 Implementation:**
   - Fix deprecated colors
   - Create `HapticService`
   - Responsive StepNavigator
   - Skeleton loading states
4. **Testing** - Verify haptic on iOS/Android devices
5. **Iterate** - Adjust Week 2+ based on feedback

---

## 📝 Questions to Consider

1. **User Research:**
   - What's the current abandonment rate?
   - Which step has highest drop-off?
   - Mobile vs Desktop usage ratio?

2. **Technical:**
   - ✅ Haptic: Sử dụng Flutter built-in `HapticFeedback`
   - ✅ Location: Sử dụng `geolocator` + local database
   - ✅ Ethnic mapping: Static JSON/Dart map, dễ maintain
   - Recording: `record` (recommended) vs `flutter_sound`?
   - Backend API cho location autocomplete?

3. **Data:**
   - Có sẵn mapping Province → Ethnic Groups không?
   - Database địa điểm (63 tỉnh, quận/huyện, xã/phường)?
   - Danh sách 54 dân tộc với metadata?

4. **Business:**
   - Progressive Disclosure có phù hợp với user base không?
   - Recording feature priority level?
   - Timeline constraints?

---

## 📦 Required Packages

```yaml
# pubspec.yaml additions
dependencies:
  # Haptic (built-in Flutter - no package needed)
  
  # Location
  geolocator: ^10.1.0
  geocoding: ^2.1.1
  
  # Recording (choose one)
  record: ^5.0.4  # Recommended - simpler API
  # OR flutter_sound: ^9.2.13
  
  # Speech-to-text (Phase 4)
  speech_to_text: ^6.6.0
```

---

## 🔗 Related Files

- `lib/presentation/contribution/pages/new_contribution_page.dart`
- `lib/presentation/shared/widgets/step_navigator.dart`
- `lib/presentation/contribution/pages/contribution_wizard_steps/basic_info_step.dart`
- `lib/presentation/contribution/providers/contribution_providers.dart`
- `lib/core/theme/app_theme.dart`

---

**✅ Plan đã được cập nhật với feedback. Sẵn sàng tạo `/plan` chi tiết cho implementation?**
