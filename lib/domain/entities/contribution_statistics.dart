import 'package:freezed_annotation/freezed_annotation.dart';

part 'contribution_statistics.freezed.dart';
part 'contribution_statistics.g.dart';

/// Summary stats for user contributions
@freezed
class ContributionStatistics with _$ContributionStatistics {
  const factory ContributionStatistics({
    required int total,
    required int pending,
    required int verified,
    required int rejected,
  }) = _ContributionStatistics;

  factory ContributionStatistics.fromJson(Map<String, dynamic> json) =>
      _$ContributionStatisticsFromJson(json);
}
