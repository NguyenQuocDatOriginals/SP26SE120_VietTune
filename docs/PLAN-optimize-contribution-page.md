# 📋 Plan: Tối ưu New Contribution Page

**Created:** 2026-01-22  
**Status:** Ready for Implementation  
**Based on:** `docs/BRAINSTORM-optimize-contribution-page.md` (Option E: Hybrid Incremental)

---

## 🎯 Project Overview

### Goal
Tối ưu hóa New Contribution Page với focus on:
- **UX Delight**: Haptic feedback, micro-interactions
- **Progressive Disclosure**: Giảm cognitive load
- **Smart Suggestions**: Rule-based (low-cost)
- **Mobile-first**: Responsive, touch-optimized

### Success Metrics
- ⏱️ Time to complete contribution: -30%
- 📉 Step abandonment rate: -25%
- ✅ Field error rate: -40%
- 😊 User satisfaction: +20%

### Timeline
- **Week 1-2**: Phase 1 & 2 (UI Polish + Micro-interactions)
- **Week 3**: Phase 3 (Progressive Disclosure)
- **Week 4+**: Phase 4 (Smart Features)

---

## 📦 Phase 1 & 2: UI Polish + Micro-interactions

**Duration:** Week 1-2  
**Priority:** P1  
**Agent:** `ui-ux-promax` + `mobile-dev`

---

### Task 1.1: Fix Deprecated Colors

**Agent:** `mobile-dev`  
**Effort:** 1 hour  
**Files:**
- `lib/core/theme/app_theme.dart`
- `lib/presentation/contribution/pages/contribution_wizard_steps/basic_info_step.dart`
- `lib/presentation/contribution/pages/contribution_wizard_steps/cultural_context_step.dart`
- `lib/presentation/contribution/pages/contribution_wizard_steps/performance_details_step.dart`
- `lib/presentation/contribution/pages/contribution_wizard_steps/notes_copyright_step.dart`

**Actions:**
1. Search for all occurrences of `AppColors.primaryRed`
2. Replace with `AppColors.primary`
3. Search for `AppColors.textOnGradient`
4. Replace with appropriate color (`AppColors.textPrimary` or `AppColors.textSecondary`)
5. Run `flutter analyze` to verify no errors

**Verification:**
- [ ] No `AppColors.primaryRed` in codebase
- [ ] No `AppColors.textOnGradient` in codebase
- [ ] All tests pass
- [ ] Visual regression check (screenshots)

---

### Task 1.2: Create HapticService

**Agent:** `mobile-dev`  
**Effort:** 2 hours  
**Files:**
- `lib/core/services/haptic_service.dart` (new)
- `lib/core/di/injection.dart` (register service)

**Actions:**
1. Create `HapticService` class with static methods:
   - `onStepComplete()` → `HapticFeedback.mediumImpact()`
   - `onValidationError()` → `HapticFeedback.heavyImpact()`
   - `onFieldFocus()` → `HapticFeedback.selectionClick()`
   - `onButtonTap()` → `HapticFeedback.lightImpact()`
   - `onDraftSaved()` → `HapticFeedback.selectionClick()`
2. Add platform check (`Platform.isIOS || Platform.isAndroid`)
3. Register in DI (optional - can be static)
4. Add unit tests

**Verification:**
- [ ] Service compiles without errors
- [ ] Methods work on iOS device
- [ ] Methods work on Android device
- [ ] No haptic on web (graceful fallback)
- [ ] Unit tests pass

---

### Task 1.3: Responsive StepNavigator

**Agent:** `ui-ux-promax`  
**Effort:** 4 hours  
**Files:**
- `lib/presentation/shared/widgets/step_navigator.dart`

**Actions:**
1. Add `LayoutBuilder` to detect screen width
2. Implement horizontal scroll for mobile (< 600px width)
3. Compact mode: Show only icons + numbers on small screens
4. Full mode: Show icons + titles on larger screens
5. Add `MediaQuery` breakpoints
6. Ensure touch targets ≥ 48dp
7. Test on various screen sizes

**Verification:**
- [ ] Horizontal scroll works on mobile (< 600px)
- [ ] Compact mode displays correctly
- [ ] Full mode displays correctly on tablet/desktop
- [ ] Touch targets ≥ 48dp
- [ ] No text overflow
- [ ] Accessibility (Semantics) still works

---

### Task 1.4: Skeleton Loading States

**Agent:** `ui-ux-promax`  
**Effort:** 3 hours  
**Files:**
- `lib/presentation/contribution/pages/contribution_wizard_steps/audio_upload_step.dart`
- `lib/presentation/shared/widgets/skeleton_loader.dart` (new)

**Actions:**
1. Create `SkeletonLoader` widget (shimmer effect)
2. Replace `CircularProgressIndicator` in metadata extraction
3. Add skeleton for file info card
4. Animate skeleton with shimmer
5. Use `shimmer` package or custom implementation

**Verification:**
- [ ] Skeleton shows during metadata extraction
- [ ] Smooth shimmer animation
- [ ] Replaces loading spinner appropriately
- [ ] Works on all platforms

---

### Task 1.5: Integrate Haptic Feedback

**Agent:** `mobile-dev`  
**Effort:** 3 hours  
**Files:**
- `lib/presentation/contribution/pages/new_contribution_page.dart`
- `lib/presentation/shared/widgets/step_navigator.dart`
- `lib/presentation/contribution/providers/contribution_providers.dart`
- All step widgets

**Actions:**
1. Add haptic on step completion (when "Tiếp theo" clicked)
2. Add haptic on validation error (when field invalid)
3. Add haptic on field focus (TextFormField onTap)
4. Add haptic on button tap (all buttons)
5. Add haptic on draft saved (in auto-save timer)

**Verification:**
- [ ] Haptic triggers on step complete
- [ ] Haptic triggers on validation error
- [ ] Haptic triggers on field focus
- [ ] Haptic triggers on button tap
- [ ] Haptic triggers on draft saved
- [ ] Test on real iOS/Android devices

---

### Task 1.6: Touch Target Improvements

**Agent:** `ui-ux-promax`  
**Effort:** 2 hours  
**Files:**
- All step widgets
- `lib/presentation/shared/widgets/step_navigator.dart`

**Actions:**
1. Audit all interactive elements
2. Ensure minimum 48dp height/width
3. Add padding to small buttons
4. Increase tap area for step indicators
5. Test on mobile device

**Verification:**
- [ ] All buttons ≥ 48dp
- [ ] All tappable areas ≥ 48dp
- [ ] Step indicators easy to tap
- [ ] No accidental taps

---

## 📝 Phase 2: Form UX + Field Feedback

**Duration:** Week 2  
**Priority:** P1-P2  
**Agent:** `ui-ux-promax` + `mobile-dev`

---

### Task 2.1: Create ChipInput Widget

**Agent:** `ui-ux-promax`  
**Effort:** 6 hours  
**Files:**
- `lib/presentation/shared/widgets/chip_input.dart` (new)

**Actions:**
1. Create reusable `ChipInput` widget
2. Support adding/removing chips
3. Show suggestions dropdown
4. Handle keyboard (Enter to add chip)
5. Style with app theme
6. Add accessibility labels

**Verification:**
- [ ] Can add chips by typing + Enter
- [ ] Can remove chips by tapping X
- [ ] Suggestions dropdown works
- [ ] Keyboard navigation works
- [ ] Accessibility labels correct
- [ ] Styling matches app theme

---

### Task 2.2: Replace Text Fields with ChipInput

**Agent:** `mobile-dev`  
**Effort:** 3 hours  
**Files:**
- `lib/presentation/contribution/pages/contribution_wizard_steps/basic_info_step.dart`
- `lib/presentation/contribution/pages/contribution_wizard_steps/performance_details_step.dart`

**Actions:**
1. Replace performer names TextField with ChipInput
2. Replace instrument selection with ChipInput
3. Update `updateArtist()` to handle chip list
4. Update `updateInstruments()` to handle chip list
5. Test validation with chips

**Verification:**
- [ ] Performer names use chips
- [ ] Instruments use chips
- [ ] Validation works with chips
- [ ] State updates correctly
- [ ] Draft saving works

---

### Task 2.3: GPS Location Autocomplete

**Agent:** `mobile-dev`  
**Effort:** 5 hours  
**Files:**
- `lib/core/services/location_suggestion_service.dart` (new)
- `lib/presentation/shared/widgets/location_autocomplete.dart` (new)
- `lib/presentation/contribution/pages/contribution_wizard_steps/basic_info_step.dart`

**Actions:**
1. Add `geolocator` package
2. Create `LocationSuggestionService`
3. Implement GPS → Province detection
4. Create `LocationAutocomplete` widget
5. Integrate into Basic Info step
6. Handle permissions gracefully

**Verification:**
- [ ] GPS permission requested
- [ ] Province detected from coordinates
- [ ] Autocomplete shows suggestions
- [ ] Works offline (cached data)
- [ ] Error handling for denied permissions

---

### Task 2.4: Field-level Validation with Haptic

**Agent:** `mobile-dev`  
**Effort:** 4 hours  
**Files:**
- All step widgets with TextFormField

**Actions:**
1. Add `validator` to each TextFormField
2. Show error message below field
3. Trigger haptic on validation error
4. Animate error appearance
5. Clear error on field change

**Verification:**
- [ ] Validation errors show immediately
- [ ] Haptic triggers on error
- [ ] Error messages clear on fix
- [ ] Animations smooth
- [ ] Accessibility announcements work

---

### Task 2.5: Animated Error Messages

**Agent:** `ui-ux-promax`  
**Effort:** 2 hours  
**Files:**
- `lib/presentation/shared/widgets/animated_error_text.dart` (new)

**Actions:**
1. Create `AnimatedErrorText` widget
2. Slide-in animation
3. Fade-out animation
4. Color transition (red)
5. Icon support (error icon)

**Verification:**
- [ ] Error slides in smoothly
- [ ] Error fades out on clear
- [ ] Color transitions work
- [ ] Icon displays correctly

---

### Task 2.6: Date Picker Improvements

**Agent:** `ui-ux-promax`  
**Effort:** 2 hours  
**Files:**
- `lib/presentation/contribution/pages/contribution_wizard_steps/basic_info_step.dart`

**Actions:**
1. Improve date picker UI
2. Add month/year picker option
3. Better date formatting
4. Add haptic on date selection
5. Improve accessibility

**Verification:**
- [ ] Date picker UI improved
- [ ] Month/year picker works
- [ ] Date formatting correct
- [ ] Haptic on selection
- [ ] Accessibility improved

---

### Task 2.7: Progress Indicators per Field

**Agent:** `ui-ux-promax`  
**Effort:** 3 hours  
**Files:**
- All step widgets

**Actions:**
1. Add completion indicator per field
2. Show checkmark when field valid
3. Show progress bar per step
4. Update in real-time

**Verification:**
- [ ] Indicators show field status
- [ ] Updates in real-time
- [ ] Visual feedback clear
- [ ] Accessibility labels correct

---

## 🔄 Phase 3: Progressive Disclosure

**Duration:** Week 3  
**Priority:** P2  
**Agent:** `ui-ux-promax` + `mobile-dev`

---

### Task 3.1: Create ProgressiveDisclosureSection Widget

**Agent:** `ui-ux-promax`  
**Effort:** 5 hours  
**Files:**
- `lib/presentation/shared/widgets/progressive_disclosure_section.dart` (new)

**Actions:**
1. Create widget with required/optional fields
2. Implement expand/collapse animation
3. Add "+ Thêm chi tiết" button
4. Add haptic on expand/collapse
5. Smooth AnimatedSize transitions
6. Add accessibility labels

**Verification:**
- [ ] Required fields always visible
- [ ] Optional fields hidden by default
- [ ] Expand/collapse animates smoothly
- [ ] Haptic on expand/collapse
- [ ] Accessibility works

---

### Task 3.2: Split Basic Info → Identity Step

**Agent:** `mobile-dev`  
**Effort:** 6 hours  
**Files:**
- `lib/presentation/contribution/pages/contribution_wizard_steps/basic_info_step.dart`
- `lib/presentation/contribution/pages/contribution_wizard_steps/identity_step.dart` (new)
- `lib/presentation/contribution/pages/new_contribution_page.dart`

**Actions:**
1. Create new `IdentityStep` widget
2. Move required fields: Title, Genre, Language
3. Move optional fields to ProgressiveDisclosureSection: Location, Date
4. Update step array in `NewContributionPage`
5. Update step titles/icons
6. Update validation logic

**Verification:**
- [ ] Identity step shows required fields first
- [ ] Optional fields in expandable section
- [ ] Step navigation works
- [ ] Validation works
- [ ] Draft saving works

---

### Task 3.3: Create People Step

**Agent:** `mobile-dev`  
**Effort:** 6 hours  
**Files:**
- `lib/presentation/contribution/pages/contribution_wizard_steps/people_step.dart` (new)
- `lib/presentation/contribution/pages/new_contribution_page.dart`

**Actions:**
1. Create new `PeopleStep` widget
2. Move fields: Performers, Ethnic Group, Author
3. Use ProgressiveDisclosureSection for Author (optional)
4. Update step array
5. Update validation logic
6. Update step titles/icons

**Verification:**
- [ ] People step shows required fields
- [ ] Author in expandable section
- [ ] Step navigation works
- [ ] Validation works
- [ ] Draft saving works

---

### Task 3.4: Update Step Navigation

**Agent:** `mobile-dev`  
**Effort:** 2 hours  
**Files:**
- `lib/presentation/contribution/pages/new_contribution_page.dart`
- `lib/presentation/contribution/providers/contribution_providers.dart`

**Actions:**
1. Update `_steps` array (now 7 steps)
2. Update `_stepTitles` array
3. Update `_stepIcons` array
4. Update validation logic in provider
5. Update `canJumpToStep()` logic

**Verification:**
- [ ] Step count correct (7 steps)
- [ ] Step titles correct
- [ ] Step icons correct
- [ ] Navigation works
- [ ] Validation works

---

### Task 3.5: Conditional Performance Details

**Agent:** `mobile-dev`  
**Effort:** 3 hours  
**Files:**
- `lib/presentation/contribution/pages/contribution_wizard_steps/performance_details_step.dart`

**Actions:**
1. Show Instrument Tuning only if instruments selected
2. Show Vocal Style only if vocal performance
3. Use ProgressiveDisclosureSection
4. Update validation logic

**Verification:**
- [ ] Conditional fields show/hide correctly
- [ ] Validation adapts to conditions
- [ ] UX clear and intuitive

---

### Task 3.6: Merge Notes + Copyright + Review

**Agent:** `mobile-dev`  
**Effort:** 4 hours  
**Files:**
- `lib/presentation/contribution/pages/contribution_wizard_steps/notes_copyright_step.dart`
- `lib/presentation/contribution/pages/contribution_wizard_steps/review_submit_step.dart`

**Actions:**
1. Merge Notes + Copyright into Review step
2. Add inline editing in review
3. Update step array (now 6 steps total)
4. Update validation

**Verification:**
- [ ] Notes + Copyright in Review step
- [ ] Inline editing works
- [ ] Step count correct (6 steps)
- [ ] Submit works

---

## 🤖 Phase 4: Rule-based Smart Features

**Duration:** Week 4+  
**Priority:** P2-P3  
**Agent:** `mobile-dev` + `mobile-dev` (backend if needed)

---

### Task 4.1: Create Province → Ethnic Group Mapping

**Agent:** `mobile-dev`  
**Effort:** 4 hours  
**Files:**
- `lib/core/data/province_ethnic_mapping.dart` (new)

**Actions:**
1. Create static map: `Map<String, List<String>>`
2. Map all 63 provinces to priority ethnic groups
3. Include data source references
4. Add helper method to get priority list

**Verification:**
- [ ] All 63 provinces mapped
- [ ] Priority order correct
- [ ] Helper method works
- [ ] Data source documented

---

### Task 4.2: Create EthnicGroupSuggestionService

**Agent:** `mobile-dev`  
**Effort:** 3 hours  
**Files:**
- `lib/core/services/ethnic_group_suggestion_service.dart` (new)

**Actions:**
1. Create service with `getSuggestedGroups(province)`
2. Sort ethnic groups: Priority first, then alphabetical
3. Return sorted list
4. Register in DI

**Verification:**
- [ ] Service returns priority groups first
- [ ] Sorting works correctly
- [ ] Service registered in DI
- [ ] Unit tests pass

---

### Task 4.3: UI with Suggested Badge

**Agent:** `ui-ux-promax`  
**Effort:** 4 hours  
**Files:**
- `lib/presentation/contribution/pages/contribution_wizard_steps/people_step.dart`
- `lib/presentation/shared/widgets/ethnic_group_selector.dart`

**Actions:**
1. Show "📍 Gợi ý cho [Province]:" badge
2. Display priority groups as chips
3. Show full dropdown below
4. Update when province changes
5. Add haptic on suggestion tap

**Verification:**
- [ ] Badge shows correct province
- [ ] Priority chips display
- [ ] Full dropdown works
- [ ] Updates on province change
- [ ] Haptic on tap

---

### Task 4.4: Recording Feature Implementation

**Agent:** `mobile-dev`  
**Effort:** 8 hours  
**Files:**
- `lib/core/services/recording_service.dart` (new)
- `lib/presentation/contribution/pages/contribution_wizard_steps/audio_upload_step.dart`

**Actions:**
1. Add `record` package
2. Create `RecordingService`
3. Implement start/stop/pause recording
4. Handle permissions
5. Show recording UI (waveform, timer)
6. Save recording to file
7. Integrate into AudioUploadStep
8. Add haptic feedback

**Verification:**
- [ ] Recording starts/stops
- [ ] Permissions handled
- [ ] UI shows recording state
- [ ] File saved correctly
- [ ] Haptic feedback works
- [ ] Works on iOS/Android

---

### Task 4.5: Audio Metadata Auto-fill

**Agent:** `mobile-dev`  
**Effort:** 3 hours  
**Files:**
- `lib/core/utils/audio_metadata_extractor.dart`

**Actions:**
1. Extract ID3 tags if available
2. Auto-fill title, artist, genre
3. Show suggestions dialog
4. User can accept/reject

**Verification:**
- [ ] ID3 tags extracted
- [ ] Auto-fill works
- [ ] Suggestions dialog shows
- [ ] User can accept/reject

---

### Task 4.6: Speech-to-text for Notes

**Agent:** `mobile-dev`  
**Effort:** 5 hours  
**Files:**
- `lib/core/services/speech_to_text_service.dart` (new)
- `lib/presentation/contribution/pages/contribution_wizard_steps/notes_copyright_step.dart`

**Actions:**
1. Add `speech_to_text` package
2. Create `SpeechToTextService`
3. Implement start/stop listening
4. Show listening UI
5. Insert text into notes field
6. Handle permissions
7. Add haptic feedback

**Verification:**
- [ ] Speech recognition works
- [ ] Permissions handled
- [ ] Text inserted correctly
- [ ] UI shows listening state
- [ ] Haptic feedback works
- [ ] Works on iOS/Android

---

## 📦 Dependencies

### New Packages Required

```yaml
dependencies:
  # Location
  geolocator: ^10.1.0
  geocoding: ^2.1.1
  
  # Recording
  record: ^5.0.4
  
  # Speech-to-text
  speech_to_text: ^6.6.0
  
  # Skeleton loading (optional)
  shimmer: ^3.0.0
```

---

## ✅ Verification Checklist

### Phase 1 & 2
- [ ] All deprecated colors fixed
- [ ] HapticService created and working
- [ ] StepNavigator responsive on mobile
- [ ] Skeleton loading implemented
- [ ] Haptic feedback integrated
- [ ] Touch targets ≥ 48dp

### Phase 2
- [ ] ChipInput widget created
- [ ] Performer/instrument fields use chips
- [ ] GPS location autocomplete works
- [ ] Field-level validation with haptic
- [ ] Animated error messages
- [ ] Date picker improved
- [ ] Progress indicators per field

### Phase 3
- [ ] ProgressiveDisclosureSection widget created
- [ ] Basic Info split into Identity + People
- [ ] Step navigation updated
- [ ] Conditional Performance Details
- [ ] Notes + Copyright merged into Review

### Phase 4
- [ ] Province → Ethnic mapping created
- [ ] EthnicGroupSuggestionService works
- [ ] UI shows suggested groups
- [ ] Recording feature implemented
- [ ] Audio metadata auto-fill works
- [ ] Speech-to-text works

### General
- [ ] All tests pass
- [ ] No linter errors
- [ ] Accessibility verified
- [ ] Performance acceptable
- [ ] Works on iOS/Android/Web

---

## 🚀 Next Steps

1. **Review this plan** - Confirm approach and timeline
2. **Set up dependencies** - Add packages to `pubspec.yaml`
3. **Start Phase 1** - Begin with Task 1.1 (Fix colors)
4. **Test incrementally** - Test each phase before moving to next
5. **Gather feedback** - User testing after Phase 1 & 2

---

## 📝 Notes

- **Haptic feedback**: Test on real devices (iOS/Android), not emulator
- **Progressive Disclosure**: Monitor user behavior, may need adjustments
- **Smart suggestions**: Start with rule-based, can upgrade to ML later
- **Recording**: Consider file size limits and storage cleanup
- **Accessibility**: Ensure all new features are accessible

---

**Plan Status:** ✅ Ready for Implementation  
**Next Command:** `/create` to start Phase 1
