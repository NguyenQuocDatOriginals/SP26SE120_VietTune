# Plan: Hybrid Smart Wizard - Contribution Page Enhancement

**Created:** 2026-01-21  
**Status:** Planning  
**Priority:** High  
**Estimated Effort:** 4-5 weeks  
**Based on:** Option D from BRAINSTORM-contribution-page-review.md

---

## 📋 Context Check

### Current State
- ✅ 5-step wizard flow exists (`NewContributionPage`)
- ✅ Riverpod state management (`ContributionFormNotifier`)
- ✅ Step validation logic (`canProceedToNextStep`)
- ✅ `ReviewSubmitStep` exists but not integrated
- ✅ `shared_preferences` package available
- ❌ No draft saving functionality
- ❌ No step jumping capability
- ❌ No field-level validation feedback
- ❌ Deprecated colors in use
- ❌ No animations or modern UX

### Problem Statement
Users abandon contribution flow due to:
1. **No progress persistence** - Lose data if app closes
2. **Rigid navigation** - Must complete steps sequentially
3. **Poor feedback** - Only step-level validation, no field-level
4. **No review** - Can't see summary before submitting
5. **Outdated UX** - No animations, progress indicators, or modern patterns

---

## 🎯 Objective

Transform the contribution wizard into a **Hybrid Smart Wizard** that:
- Maintains guided step-by-step flow (reduces errors)
- Adds flexibility (step jumping, draft saving)
- Provides better feedback (field-level validation, progress indicators)
- Modernizes UX (animations, better visual design)
- Improves accessibility (screen readers, keyboard navigation)

---

## 📐 Requirements

### Functional Requirements

1. **Enhanced Wizard Structure:**
   - Keep 5 existing steps + add Review step (6 steps total)
   - Allow step jumping (if previous steps are valid)
   - Maintain step validation logic

2. **Draft Management:**
   - Auto-save drafts every 30 seconds
   - Save on field blur/change
   - Resume from last step on app restart
   - "Save & Continue Later" button

3. **Validation:**
   - Field-level validation with real-time feedback
   - Step-level validation (existing)
   - Visual indicators for required vs. optional fields
   - Error messages with actionable guidance

4. **Navigation:**
   - Step jumping (click step indicator to jump)
   - Skip optional steps (Cultural Context, Notes)
   - Quick edit from review step
   - Cancel confirmation dialog

5. **Review & Submit:**
   - Read-only review step before submit
   - Summary of all entered data
   - Quick edit links to each section
   - Success celebration animation

6. **Modern UX:**
   - Animated step transitions
   - Progress percentage indicator
   - Estimated time remaining
   - Loading states
   - Better error messages

7. **Accessibility:**
   - Screen reader support (Semantics widgets)
   - Keyboard navigation
   - High contrast mode support
   - Font scaling support

### Non-Functional Requirements

1. **Performance:**
   - Draft saves should not block UI
   - Animations should be smooth (60fps)
   - No memory leaks from state management

2. **Data Persistence:**
   - Drafts stored in `SharedPreferences`
   - JSON serialization for `Song` entity
   - Handle migration if schema changes

3. **Error Handling:**
   - Graceful degradation if draft save fails
   - Clear error messages
   - Retry mechanisms

4. **Backward Compatibility:**
   - Existing contributions should still work
   - No breaking changes to API
   - Gradual migration path

---

## 🔨 Implementation Plan

### Phase 1: Foundation & Core Features (Week 1-2)

#### Task 1.1: Create Draft Manager Service
**File:** `lib/core/services/contribution_draft_service.dart`

**Implementation:**
- Create `ContributionDraftService` class
- Use `SharedPreferences` for storage
- Methods:
  - `saveDraft(Song song, int currentStep)`
  - `loadDraft() -> DraftData?`
  - `clearDraft()`
  - `hasDraft() -> bool`
- JSON serialization for `Song` entity
- Handle errors gracefully

**Dependencies:**
- `shared_preferences` (already in pubspec.yaml)
- `Song` entity (needs `toJson`/`fromJson` or use existing serialization)

**Verification:**
- [ ] Draft saves successfully
- [ ] Draft loads correctly
- [ ] Draft clears on submit
- [ ] Handles corrupted data gracefully

---

#### Task 1.2: Integrate Review Step
**File:** `lib/presentation/contribution/pages/new_contribution_page.dart`

**Implementation:**
- Add `ReviewSubmitStep` to steps array (make it step 6)
- Update `stepTitles` array
- Update step count from 5 to 6
- Move submit logic from `NotesCopyrightStep` to `ReviewSubmitStep`
- Update `NotesCopyrightStep` to remove submit button

**Changes:**
```dart
final steps = [
  const AudioUploadStep(),
  const BasicInfoStep(),
  const CulturalContextStep(),
  const PerformanceDetailsStep(),
  const NotesCopyrightStep(),
  const ReviewSubmitStep(), // NEW
];

final stepTitles = [
  'Tải lên & Tự nhận diện',
  'Thông tin định danh',
  'Bối cảnh văn hóa',
  'Chi tiết biểu diễn',
  'Ghi chú & Bản quyền',
  'Xem lại & Gửi', // NEW
];
```

**Verification:**
- [ ] Review step appears as step 6
- [ ] Submit button works from review step
- [ ] Can navigate back from review step
- [ ] All data displays correctly in review

---

#### Task 1.3: Update Theme Colors
**File:** `lib/presentation/contribution/pages/new_contribution_page.dart`

**Implementation:**
- Replace `AppColors.primaryRed` with `AppColors.primary`
- Replace `AppColors.textOnGradient` with `AppColors.textPrimary`
- Replace `AppColors.textSecondaryOnGradient` with `AppColors.textSecondary`
- Replace `AppColors.gradientBottom` with `AppColors.backgroundDark`

**Verification:**
- [ ] No deprecated colors remain
- [ ] Colors match app theme
- [ ] No visual regressions

---

#### Task 1.4: Add Draft Auto-Save
**File:** `lib/presentation/contribution/providers/contribution_providers.dart`

**Implementation:**
- Inject `ContributionDraftService` into `ContributionFormNotifier`
- Add `Timer` for auto-save (every 30 seconds)
- Call `saveDraft()` on:
  - Timer tick (auto-save)
  - Field updates (debounced)
  - Step changes
- Handle save errors silently (log only)

**Code Pattern:**
```dart
Timer? _autoSaveTimer;

void _startAutoSave() {
  _autoSaveTimer?.cancel();
  _autoSaveTimer = Timer.periodic(
    const Duration(seconds: 30),
    (_) => _saveDraft(),
  );
}

Future<void> _saveDraft() async {
  try {
    await _draftService.saveDraft(
      state.songData!,
      state.currentStep,
    );
  } catch (e) {
    debugPrint('Failed to save draft: $e');
  }
}
```

**Verification:**
- [ ] Draft saves every 30 seconds
- [ ] Draft saves on field changes (debounced)
- [ ] No UI blocking during save
- [ ] Errors handled gracefully

---

#### Task 1.5: Resume from Draft
**File:** `lib/presentation/contribution/pages/new_contribution_page.dart`

**Implementation:**
- Check for draft on page load
- Show dialog: "Resume draft?" with options:
  - "Resume" → Load draft and navigate to last step
  - "Start New" → Clear draft and start fresh
- Load draft data into `ContributionFormNotifier`
- Navigate to last step

**Verification:**
- [ ] Draft detection works
- [ ] Resume dialog appears
- [ ] Draft loads correctly
- [ ] Navigation to last step works
- [ ] "Start New" clears draft

---

### Phase 2: Enhanced Navigation & Validation (Week 2-3)

#### Task 2.1: Step Navigator Widget
**File:** `lib/presentation/shared/widgets/step_navigator.dart`

**Implementation:**
- Create `StepNavigator` widget
- Display all steps as clickable indicators
- Show completion status (completed/in-progress/pending)
- Allow jumping to completed steps
- Disable jumping to invalid steps
- Visual feedback on hover/tap

**Features:**
- Step numbers with icons
- Progress indicators
- Tooltips showing step names
- Disabled state for invalid steps

**Verification:**
- [ ] Steps are clickable
- [ ] Can jump to completed steps
- [ ] Invalid steps are disabled
- [ ] Visual feedback works

---

#### Task 2.2: Integrate Step Navigator
**File:** `lib/presentation/contribution/pages/new_contribution_page.dart`

**Implementation:**
- Replace simple progress bar with `StepNavigator`
- Add step jumping logic to `ContributionFormNotifier`
- Validate previous steps before allowing jump
- Show confirmation if jumping will lose unsaved changes

**Verification:**
- [ ] Step navigator displays correctly
- [ ] Step jumping works
- [ ] Validation prevents invalid jumps
- [ ] Confirmation dialog appears when needed

---

#### Task 2.3: Field-Level Validation
**File:** `lib/presentation/contribution/pages/contribution_wizard_steps/*.dart`

**Implementation:**
- Add `TextFormField` validators to each step
- Real-time validation feedback
- Error messages below fields
- Visual indicators (red border, error icon)
- Required field indicators (*)

**Example:**
```dart
TextFormField(
  decoration: InputDecoration(
    labelText: 'Tiêu đề *',
    errorText: _titleError,
    suffixIcon: _titleError != null 
      ? Icon(Icons.error, color: AppColors.error)
      : null,
  ),
  validator: (value) {
    if (value == null || value.isEmpty) {
      return 'Vui lòng nhập tiêu đề';
    }
    return null;
  },
  onChanged: (value) {
    // Real-time validation
    setState(() {
      _titleError = value.isEmpty ? 'Vui lòng nhập tiêu đề' : null;
    });
  },
)
```

**Verification:**
- [ ] Field validation works
- [ ] Error messages display
- [ ] Visual indicators appear
- [ ] Required fields marked

---

#### Task 2.4: Skip Optional Steps
**File:** `lib/presentation/contribution/pages/new_contribution_page.dart`

**Implementation:**
- Add "Skip" button on optional steps (Cultural Context, Notes)
- Skip button appears alongside "Next" button
- Skip sets step data to null/empty
- Update step indicator to show "skipped" state

**Verification:**
- [ ] Skip button appears on optional steps
- [ ] Skip works correctly
- [ ] Step indicator shows skipped state
- [ ] Can go back and fill skipped steps

---

### Phase 3: Modern UX & Animations (Week 3-4)

#### Task 3.1: Animated Step Transitions
**File:** `lib/presentation/contribution/pages/new_contribution_page.dart`

**Implementation:**
- Wrap step content in `AnimatedSwitcher`
- Add slide/fade transitions
- Smooth animations (300ms duration)
- Direction-aware (slide left/right based on direction)

**Code:**
```dart
AnimatedSwitcher(
  duration: const Duration(milliseconds: 300),
  transitionBuilder: (child, animation) {
    return SlideTransition(
      position: Tween<Offset>(
        begin: Offset(_isMovingForward ? 1.0 : -1.0, 0),
        end: Offset.zero,
      ).animate(animation),
      child: FadeTransition(
        opacity: animation,
        child: child,
      ),
    );
  },
  child: steps[formState.currentStep],
)
```

**Verification:**
- [ ] Animations are smooth
- [ ] Direction-aware transitions
- [ ] No performance issues
- [ ] Works on all devices

---

#### Task 3.2: Progress Indicators
**File:** `lib/presentation/contribution/pages/new_contribution_page.dart`

**Implementation:**
- Add progress percentage (e.g., "67% Complete")
- Add estimated time remaining
- Visual progress bar with percentage
- Completion indicators per step

**Features:**
- Percentage calculation: `(currentStep + 1) / totalSteps * 100`
- Time estimation: `(totalSteps - currentStep) * 2 minutes` (rough estimate)
- Progress bar with gradient fill

**Verification:**
- [ ] Progress percentage accurate
- [ ] Time estimation reasonable
- [ ] Visual indicators clear
- [ ] Updates on step change

---

#### Task 3.3: Loading States
**File:** `lib/presentation/contribution/pages/contribution_wizard_steps/*.dart`

**Implementation:**
- Add loading indicators for:
  - File upload
  - Metadata extraction
  - Draft saving
  - Form submission
- Use `CircularProgressIndicator` or `LinearProgressIndicator`
- Disable buttons during loading
- Show loading overlay when needed

**Verification:**
- [ ] Loading states appear
- [ ] Buttons disabled during loading
- [ ] No double submissions
- [ ] Loading messages clear

---

#### Task 3.4: Success Celebration
**File:** `lib/presentation/contribution/pages/contribution_wizard_steps/review_submit_step.dart`

**Implementation:**
- Add success animation on submit
- Use `Lottie` animation (already in dependencies)
- Show success message
- Navigate to submissions page after delay
- Confetti effect (optional)

**Verification:**
- [ ] Success animation plays
- [ ] Message displays correctly
- [ ] Navigation works
- [ ] User feedback is positive

---

### Phase 4: Accessibility & Polish (Week 4-5)

#### Task 4.1: Screen Reader Support
**File:** `lib/presentation/contribution/pages/**/*.dart`

**Implementation:**
- Add `Semantics` widgets to key elements
- Label all interactive elements
- Describe form fields
- Announce step changes
- Provide hints for complex interactions

**Example:**
```dart
Semantics(
  label: 'Bước 1: Tải lên file âm thanh',
  hint: 'Chọn file từ thiết bị hoặc ghi âm trực tiếp',
  child: Text('Bước 1: Tải lên file âm thanh'),
)
```

**Verification:**
- [ ] Screen reader announces correctly
- [ ] All elements labeled
- [ ] Navigation announced
- [ ] Tested with TalkBack/VoiceOver

---

#### Task 4.2: Keyboard Navigation
**File:** `lib/presentation/contribution/pages/**/*.dart`

**Implementation:**
- Ensure all fields are focusable
- Tab order is logical
- Enter key submits forms
- Escape key cancels dialogs
- Arrow keys navigate where appropriate

**Verification:**
- [ ] Tab navigation works
- [ ] Enter key submits
- [ ] Escape key cancels
- [ ] Focus indicators visible

---

#### Task 4.3: High Contrast & Font Scaling
**File:** `lib/presentation/contribution/pages/**/*.dart`

**Implementation:**
- Use `MediaQuery.textScaleFactor` for font sizes
- Support high contrast mode
- Ensure sufficient color contrast (WCAG AA)
- Test with large fonts

**Verification:**
- [ ] Font scaling works
- [ ] High contrast mode supported
- [ ] Color contrast meets WCAG AA
- [ ] Layout doesn't break with large fonts

---

#### Task 4.4: Cancel Confirmation Dialog
**File:** `lib/presentation/contribution/pages/new_contribution_page.dart`

**Implementation:**
- Show confirmation dialog when canceling
- Options: "Save Draft", "Discard", "Cancel"
- Save draft if user chooses
- Clear draft if user discards

**Verification:**
- [ ] Dialog appears on cancel
- [ ] Options work correctly
- [ ] Draft saved if requested
- [ ] Draft cleared if discarded

---

#### Task 4.5: Quick Edit from Review
**File:** `lib/presentation/contribution/pages/contribution_wizard_steps/review_submit_step.dart`

**Implementation:**
- Add "Edit" buttons next to each section in review
- Clicking edit jumps to that step
- Highlight which section is being edited
- Return to review after editing

**Verification:**
- [ ] Edit buttons work
- [ ] Navigation to step works
- [ ] Highlighting works
- [ ] Return to review works

---

## 📁 Files to Create/Modify

### New Files
| File | Purpose |
|------|---------|
| `lib/core/services/contribution_draft_service.dart` | Draft management service |
| `lib/presentation/shared/widgets/step_navigator.dart` | Step navigation widget |
| `lib/presentation/shared/widgets/field_validator.dart` | Reusable field validation |

### Modified Files
| File | Changes |
|------|---------|
| `lib/presentation/contribution/pages/new_contribution_page.dart` | Add review step, step navigator, animations, progress |
| `lib/presentation/contribution/providers/contribution_providers.dart` | Add draft auto-save, step jumping logic |
| `lib/presentation/contribution/pages/contribution_wizard_steps/notes_copyright_step.dart` | Remove submit button |
| `lib/presentation/contribution/pages/contribution_wizard_steps/review_submit_step.dart` | Enhance with quick edit, success animation |
| `lib/presentation/contribution/pages/contribution_wizard_steps/*.dart` | Add field-level validation |
| `lib/core/di/injection.dart` | Register `ContributionDraftService` |

---

## 🧪 Testing Strategy

### Unit Tests
- [ ] `ContributionDraftService` - save/load/clear
- [ ] Step validation logic
- [ ] Field validation logic
- [ ] Step jumping logic

### Widget Tests
- [ ] `StepNavigator` widget
- [ ] Draft resume dialog
- [ ] Cancel confirmation dialog
- [ ] Review step display

### Integration Tests
- [ ] Full contribution flow
- [ ] Draft save and resume
- [ ] Step jumping
- [ ] Submit with validation

### Manual Testing
- [ ] Test on Android/iOS
- [ ] Test with screen reader
- [ ] Test with large fonts
- [ ] Test with slow network
- [ ] Test app restart during flow

---

## ✅ Acceptance Criteria

### Phase 1
- [ ] Draft saves automatically
- [ ] Draft resumes correctly
- [ ] Review step integrated
- [ ] Theme colors updated
- [ ] No deprecated colors

### Phase 2
- [ ] Step navigator works
- [ ] Step jumping works
- [ ] Field validation works
- [ ] Skip optional steps works

### Phase 3
- [ ] Animations smooth
- [ ] Progress indicators accurate
- [ ] Loading states clear
- [ ] Success celebration works

### Phase 4
- [ ] Screen reader support
- [ ] Keyboard navigation works
- [ ] High contrast supported
- [ ] Cancel confirmation works
- [ ] Quick edit from review works

---

## 📝 Implementation Notes

### Draft Storage Format
```json
{
  "songData": { /* Song JSON */ },
  "currentStep": 3,
  "savedAt": "2026-01-21T10:30:00Z",
  "version": "1.0"
}
```

### Step Validation Rules
- Step 0 (Audio): Must have audio URL
- Step 1 (Basic Info): Title, Artist, Genre, Language required
- Step 2 (Cultural): Ethnic Group required
- Step 3 (Performance): Performance Type + Instruments required
- Step 4 (Notes): Optional
- Step 5 (Review): All previous steps validated

### Animation Timing
- Step transition: 300ms
- Progress update: 200ms
- Loading fade: 150ms
- Success celebration: 2000ms

---

## 🚀 Rollout Plan

### Phase 1: Internal Testing (Week 1-2)
- Implement Phase 1 features
- Test with team
- Fix critical bugs

### Phase 2: Beta Testing (Week 3)
- Release to beta testers
- Gather feedback
- Iterate on UX

### Phase 3: Gradual Rollout (Week 4-5)
- Release to 10% of users
- Monitor metrics (abandonment rate, completion rate)
- Fix issues
- Rollout to 100%

---

## 📊 Success Metrics

### Key Performance Indicators
- **Abandonment Rate:** Target < 30% (current unknown)
- **Completion Rate:** Target > 70%
- **Time to Complete:** Target < 15 minutes
- **Draft Resume Rate:** Target > 50% of drafts resumed
- **Error Rate:** Target < 5% submission errors

### User Feedback
- User satisfaction score
- Feature requests
- Bug reports
- Accessibility feedback

---

## 🔍 Risk Mitigation

### Risks
1. **Draft corruption** - Handle gracefully, validate on load
2. **Performance issues** - Optimize animations, debounce saves
3. **Breaking changes** - Maintain backward compatibility
4. **Storage limits** - Limit draft size, cleanup old drafts

### Mitigation
- Comprehensive error handling
- Performance testing
- Gradual rollout
- Draft cleanup strategy

---

**End of Plan**
