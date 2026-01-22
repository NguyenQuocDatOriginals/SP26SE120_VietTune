# Plan: Implement Contribute Function

**Created:** 2026-01-21  
**Status:** Planning  
**Priority:** Medium

---

## 📋 Context Check

### Current State
- ✅ Contribution system exists with `NewContributionPage` and wizard steps
- ✅ Router has routes: `contribute` and `contribute-new` (both point to `NewContributionPage`)
- ✅ `_handleContributeTap` function exists in `home_page.dart` with:
  - Guest check → shows auth prompt
  - Permission check → shows error snackbar
  - **TODO:** Navigate to contribution flow

### Problem
The `_handleContributeTap` function in `lib/presentation/shared/pages/home_page.dart` has a TODO comment at line 42:
```dart
// TODO: Navigate to contribution flow
```

The function currently:
1. ✅ Checks if user is guest → shows `GuestAuthPromptBottomSheet`
2. ✅ Checks if user has permission → shows error snackbar
3. ❌ **Missing:** Navigation to contribution page

---

## 🎯 Objective

Complete the `_handleContributeTap` function to navigate authenticated users with proper permissions to the contribution wizard page.

---

## 📐 Requirements

### Functional Requirements
1. Navigate to `NewContributionPage` when user taps FAB and has permission
2. Use existing route `contribute-new` (already defined in router)
3. Maintain existing guest and permission checks
4. Ensure smooth user experience with proper error handling

### Non-Functional Requirements
1. Follow existing code style and patterns
2. Use `go_router` for navigation (already imported)
3. No breaking changes to existing functionality
4. Handle edge cases gracefully

---

## 🔨 Implementation Plan

### Phase 1: Complete Navigation Logic

**File:** `lib/presentation/shared/pages/home_page.dart`

**Task 1.1:** Replace TODO with navigation call
- Location: Line 42 in `_handleContributeTap` method
- Action: Add `context.pushNamed('contribute-new')` after permission check
- Code:
  ```dart
  // Replace:
  // TODO: Navigate to contribution flow
  
  // With:
  context.pushNamed('contribute-new');
  ```

**Verification:**
- [ ] Function navigates to contribution page
- [ ] Guest users still see auth prompt
- [ ] Users without permission still see error snackbar
- [ ] No compilation errors

---

### Phase 2: Error Handling (Optional Enhancement)

**Task 2.1:** Add try-catch for navigation errors
- Wrap navigation in try-catch block
- Show error message if navigation fails
- Log error for debugging

**Code:**
```dart
try {
  context.pushNamed('contribute-new');
} catch (e) {
  if (mounted) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Không thể mở trang đóng góp: ${e.toString()}'),
        backgroundColor: AppColors.error,
      ),
    );
  }
}
```

**Verification:**
- [ ] Navigation errors are caught and displayed
- [ ] User sees friendly error message
- [ ] App doesn't crash on navigation failure

---

### Phase 3: Testing

**Task 3.1:** Manual Testing Checklist
- [ ] Test as guest user → should show auth prompt
- [ ] Test as authenticated user without permission → should show error
- [ ] Test as authenticated user with permission → should navigate to contribution page
- [ ] Test navigation back from contribution page
- [ ] Test on different screen sizes

**Task 3.2:** Unit Test (Optional)
- Create test for `_handleContributeTap` method
- Mock router and verify navigation calls
- Test permission checks

---

## 📁 Files to Modify

| File | Changes | Lines |
|------|---------|-------|
| `lib/presentation/shared/pages/home_page.dart` | Add navigation call | ~42 |

---

## 🧪 Testing Strategy

### Manual Testing
1. **Guest User Flow:**
   - Tap FAB → Should show auth prompt
   - Verify message: "Đăng nhập để đóng góp và lưu trữ di sản âm nhạc"

2. **Unauthorized User Flow:**
   - Login as user without `canSubmitContributions` permission
   - Tap FAB → Should show error snackbar
   - Verify message: "Bạn không có quyền đóng góp"

3. **Authorized User Flow:**
   - Login as user with `canSubmitContributions` permission
   - Tap FAB → Should navigate to `NewContributionPage`
   - Verify contribution wizard appears

4. **Navigation Flow:**
   - Navigate to contribution page
   - Press back button → Should return to home
   - Verify no navigation stack issues

### Edge Cases
- [ ] Router not initialized
- [ ] Route name mismatch
- [ ] Navigation during widget disposal
- [ ] Multiple rapid taps

---

## ✅ Acceptance Criteria

- [ ] FAB tap navigates authenticated users with permission to contribution page
- [ ] Guest users see auth prompt (existing behavior maintained)
- [ ] Unauthorized users see error message (existing behavior maintained)
- [ ] No compilation errors
- [ ] No runtime errors
- [ ] Navigation works smoothly
- [ ] Code follows existing patterns

---

## 📝 Implementation Notes

### Router Configuration
The route is already defined in `lib/core/router/app_router.dart`:
```dart
GoRoute(
  path: 'contribute/new',
  name: 'contribute-new',
  builder: (context, state) => const NewContributionPage(),
),
```

### Permission Check
The permission check uses `role.canSubmitContributions` from `UserRole` enum. This is already implemented and working.

### Navigation Method
Use `context.pushNamed('contribute-new')` instead of `context.push()` to leverage named routes and maintain consistency with the codebase.

---

## 🚀 Next Steps

1. **Review this plan** - Ensure all requirements are captured
2. **Implement Phase 1** - Add navigation call (minimal change)
3. **Test manually** - Verify all user flows work
4. **Optional: Implement Phase 2** - Add error handling if needed
5. **Optional: Implement Phase 3** - Add unit tests if needed

---

## 📚 Related Files

- `lib/presentation/shared/pages/home_page.dart` - Main file to modify
- `lib/core/router/app_router.dart` - Router configuration
- `lib/presentation/contribution/pages/new_contribution_page.dart` - Target page
- `lib/domain/entities/enums.dart` - UserRole enum with permission checks
- `lib/presentation/shared/widgets/guest_auth_prompt_bottom_sheet.dart` - Auth prompt widget

---

## 🔍 Verification Checklist

Before marking as complete:
- [ ] Code compiles without errors
- [ ] All manual tests pass
- [ ] No console errors or warnings
- [ ] Navigation works for all user types
- [ ] Existing functionality unchanged
- [ ] Code follows project conventions
- [ ] No breaking changes introduced

---

**End of Plan**
