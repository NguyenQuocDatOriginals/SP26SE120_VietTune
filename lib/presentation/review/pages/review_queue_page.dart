import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/di/injection.dart';
import '../../../domain/entities/enums.dart';
import '../../../domain/entities/contribution_request.dart';
import '../../../domain/repositories/base_repository.dart';
import '../../../domain/repositories/contribution_repository.dart';
import '../../shared/widgets/loading_indicator.dart';
import '../../shared/widgets/error_view.dart';
import '../../auth/providers/auth_provider.dart';

final pendingContributionsProvider = FutureProvider((ref) async {
  final repository = getIt<ContributionRepository>();
  final result = await repository.getContributionsByStatus(
    VerificationStatus.pending,
    const QueryParams(),
  );
  return result.fold(
    (failure) => throw failure,
    (response) => response.items,
  );
});

class ReviewQueuePage extends ConsumerWidget {
  const ReviewQueuePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    final role = user?.role;
    if (role == null || !role.canReviewContributions) {
      return const Scaffold(
        body: Center(
          child: Text('Bạn không có quyền truy cập mục này.'),
        ),
      );
    }

    final pendingAsync = ref.watch(pendingContributionsProvider);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Hàng chờ thẩm định'),
      ),
      body: pendingAsync.when(
        data: (items) {
          if (items.isEmpty) {
            return const Center(child: Text('Không có đóng góp đang chờ.'));
          }
          return ListView.separated(
            itemCount: items.length,
            separatorBuilder: (_, __) => const Divider(height: 1),
            itemBuilder: (context, index) {
              final item = items[index];
              return ListTile(
                title: Text(item.songData?.title ?? 'Bản ghi mới'),
                subtitle: Text('Người gửi: ${item.userId}'),
                trailing: _buildActions(context, ref, item),
              );
            },
          );
        },
        loading: () => const LoadingIndicator(),
        error: (error, stack) => ErrorView(
          message: 'Error loading queue: $error',
          onRetry: () => ref.invalidate(pendingContributionsProvider),
        ),
      ),
    );
  }

  Widget _buildActions(
    BuildContext context,
    WidgetRef ref,
    ContributionRequest item,
  ) {
    return Wrap(
      spacing: 8,
      children: [
        TextButton(
          onPressed: () => _approve(context, ref, item),
          child: const Text('Phê duyệt'),
        ),
        TextButton(
          onPressed: () => _reject(context, ref, item),
          child: const Text('Từ chối'),
        ),
      ],
    );
  }

  Future<void> _approve(
    BuildContext context,
    WidgetRef ref,
    ContributionRequest item,
  ) async {
    final user = ref.read(currentUserProvider);
    if (user == null) return;
    final repository = getIt<ContributionRepository>();
    final result = await repository.approveContribution(
      id: item.id,
      expertId: user.id,
      comments: 'Approved',
    );
    if (!context.mounted) return;
    result.fold(
      (failure) => _showSnack(context, failure.toString()),
      (_) {
        ref.invalidate(pendingContributionsProvider);
        _showSnack(context, 'Đã phê duyệt');
      },
    );
  }

  Future<void> _reject(
    BuildContext context,
    WidgetRef ref,
    ContributionRequest item,
  ) async {
    final user = ref.read(currentUserProvider);
    if (user == null) return;
    final repository = getIt<ContributionRepository>();
    final result = await repository.rejectContribution(
      id: item.id,
      expertId: user.id,
      reason: 'Rejected',
    );
    if (!context.mounted) return;
    result.fold(
      (failure) => _showSnack(context, failure.toString()),
      (_) {
        ref.invalidate(pendingContributionsProvider);
        _showSnack(context, 'Đã từ chối');
      },
    );
  }

  void _showSnack(BuildContext context, String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }
}
