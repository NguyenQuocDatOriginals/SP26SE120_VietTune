import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/contribution_providers.dart';
import '../../../domain/entities/enums.dart';
import '../../../domain/repositories/base_repository.dart';
import '../../../core/utils/constants.dart';
import '../../../core/utils/extensions.dart';
import '../../shared/widgets/status_badge.dart';
import '../../shared/widgets/loading_indicator.dart';
import '../../shared/widgets/error_view.dart';
import 'contribution_detail_page.dart';
import '../../auth/providers/auth_provider.dart';

class SubmissionsPage extends ConsumerStatefulWidget {
  const SubmissionsPage({super.key});

  @override
  ConsumerState<SubmissionsPage> createState() => _SubmissionsPageState();
}

class _SubmissionsPageState extends ConsumerState<SubmissionsPage> {
  VerificationStatus? _selectedFilter;
  int _currentPage = 1;

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(currentUserProvider);
    if (user == null) {
      return const Scaffold(
        body: LoadingIndicator(),
      );
    }
    final contributionsAsync = ref.watch(
      userContributionsProvider(
        (
          userId: user.id,
          statusFilter: _selectedFilter,
          params: QueryParams(page: _currentPage, limit: AppConstants.defaultPageSize),
        ),
      ),
    );

    return Scaffold(
      appBar: AppBar(
        title: const Text('Đóng góp của tôi'),
        actions: [
          PopupMenuButton<VerificationStatus?>(
            icon: const Icon(Icons.filter_list),
            onSelected: (status) {
              setState(() {
                _selectedFilter = status;
                _currentPage = 1;
              });
            },
            itemBuilder: (context) => [
              const PopupMenuItem(
                value: null,
                child: Text('Tất cả'),
              ),
              const PopupMenuItem(
                value: VerificationStatus.pending,
                child: Text('Chờ duyệt'),
              ),
              const PopupMenuItem(
                value: VerificationStatus.verified,
                child: Text('Đã xác minh'),
              ),
              const PopupMenuItem(
                value: VerificationStatus.rejected,
                child: Text('Đã từ chối'),
              ),
            ],
          ),
        ],
      ),
      body: contributionsAsync.when(
        data: (response) {
          if (response.items.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.inbox_outlined,
                    size: 64,
                    color: Colors.grey[400],
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Chưa có đóng góp nào',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: () async {
              ref.invalidate(userContributionsProvider);
            },
            child: ListView.builder(
              itemCount: response.items.length,
              itemBuilder: (context, index) {
                final contribution = response.items[index];
                return Card(
                  margin: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 8,
                  ),
                  child: ListTile(
                    title: Text(
                      contribution.songData?.title ?? 'Không có tiêu đề',
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 4),
                        StatusBadge(status: contribution.status),
                        if (contribution.submittedAt != null) ...[
                          const SizedBox(height: 8),
                          Text(
                            'Gửi lúc: ${contribution.submittedAt!.toVietnameseDateTime()}',
                            style: Theme.of(context).textTheme.bodySmall,
                          ),
                        ],
                        if (contribution.reviewComments != null) ...[
                          const SizedBox(height: 4),
                          Text(
                            'Nhận xét: ${contribution.reviewComments}',
                            style: Theme.of(context).textTheme.bodySmall,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ],
                    ),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () {
                      context.push(
                        '/contribute/submission/${contribution.id}',
                      );
                    },
                  ),
                );
              },
            ),
          );
        },
        loading: () => const LoadingIndicator(message: 'Đang tải...'),
        error: (error, stack) => ErrorView(
          message: 'Lỗi khi tải đóng góp: $error',
          onRetry: () {
            ref.invalidate(userContributionsProvider);
          },
        ),
      ),
    );
  }
}
