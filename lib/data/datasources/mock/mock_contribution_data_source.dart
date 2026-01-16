import '../../models/contribution_request_model.dart';
import '../../models/song_model.dart';
import '../../models/audio_metadata_model.dart';
import '../../models/cultural_context_model.dart';
import '../../models/location_model.dart';

/// Mock data source for contribution requests
abstract class MockContributionDataSource {
  Future<List<ContributionRequestModel>> getAllContributions();
  Future<ContributionRequestModel?> getContributionById(String id);
  Future<List<ContributionRequestModel>> getUserContributions(String userId);
  Future<ContributionRequestModel> createContribution(ContributionRequestModel contribution);
  Future<ContributionRequestModel> updateContribution(String id, ContributionRequestModel contribution);
  Future<void> deleteContribution(String id);
}

class MockContributionDataSourceImpl implements MockContributionDataSource {
  static final List<ContributionRequestModel> _contributions = _generateMockContributions();

  @override
  Future<List<ContributionRequestModel>> getAllContributions() async {
    await Future.delayed(const Duration(milliseconds: 300));
    return List.from(_contributions);
  }

  @override
  Future<ContributionRequestModel?> getContributionById(String id) async {
    await Future.delayed(const Duration(milliseconds: 200));
    try {
      return _contributions.firstWhere((contrib) => contrib.id == id);
    } catch (e) {
      return null;
    }
  }

  @override
  Future<List<ContributionRequestModel>> getUserContributions(String userId) async {
    await Future.delayed(const Duration(milliseconds: 250));
    return _contributions.where((contrib) => contrib.userId == userId).toList();
  }

  @override
  Future<ContributionRequestModel> createContribution(ContributionRequestModel contribution) async {
    await Future.delayed(const Duration(milliseconds: 400));
    final newContribution = ContributionRequestModel(
      id: 'contrib_${DateTime.now().millisecondsSinceEpoch}',
      userId: contribution.userId,
      type: contribution.type,
      status: 'pending',
      songData: contribution.songData,
      notes: contribution.notes,
      submittedAt: DateTime.now().toIso8601String(),
    );
    _contributions.add(newContribution);
    return newContribution;
  }

  @override
  Future<ContributionRequestModel> updateContribution(
    String id,
    ContributionRequestModel contribution,
  ) async {
    await Future.delayed(const Duration(milliseconds: 350));
    final index = _contributions.indexWhere((c) => c.id == id);
    if (index == -1) {
      throw Exception('Contribution not found');
    }
    final updated = ContributionRequestModel(
      id: contribution.id,
      userId: contribution.userId,
      type: contribution.type,
      status: contribution.status,
      songData: contribution.songData,
      notes: contribution.notes,
      reviewComments: contribution.reviewComments,
      submittedAt: contribution.submittedAt,
      reviewedAt: contribution.reviewedAt ?? DateTime.now().toIso8601String(),
      reviewedBy: contribution.reviewedBy,
    );
    _contributions[index] = updated;
    return updated;
  }

  @override
  Future<void> deleteContribution(String id) async {
    await Future.delayed(const Duration(milliseconds: 200));
    _contributions.removeWhere((c) => c.id == id);
  }

  static List<ContributionRequestModel> _generateMockContributions() {
    final now = DateTime.now();
    return [
      ContributionRequestModel(
        id: 'contrib_001',
        userId: 'user_001',
        type: 'newSong',
        status: 'pending',
        songData: SongModel(
          id: 'song_new_001',
          title: 'Dân ca mới',
          genre: 'folk',
          ethnicGroupId: 'ethnic_kinh',
          verificationStatus: 'pending',
          audioMetadata: AudioMetadataModel(
            url: 'https://example.com/audio/new_song_001.mp3',
            durationInSeconds: 200,
            quality: 'medium',
            recordingDate: now.subtract(const Duration(days: 5)).toIso8601String(),
            instrumentIds: ['inst_dan_tranh'],
            recordingLocation: LocationModel(
              latitude: 21.0285,
              longitude: 105.8542,
              province: 'Hà Nội',
            ),
            performerNames: ['Nghệ nhân'],
            recordingEquipment: 'Zoom H4n',
            recordedBy: 'user_001',
            bitrate: 256,
            format: 'mp3',
          ),
          culturalContext: CulturalContextModel(
            type: 'entertainment',
            occasion: 'Lễ hội',
            significance: 'Dân ca mới',
          ),
          description: 'Bài dân ca mới được đóng góp.',
        ),
        notes: 'Đây là bài dân ca mới tôi ghi lại từ bà ngoại.',
        submittedAt: now.subtract(const Duration(days: 3)).toIso8601String(),
      ),
      ContributionRequestModel(
        id: 'contrib_002',
        userId: 'user_002',
        type: 'newSong',
        status: 'verified',
        songData: SongModel(
          id: 'song_new_002',
          title: 'Hát ru cổ',
          genre: 'folk',
          ethnicGroupId: 'ethnic_tay',
          verificationStatus: 'verified',
          audioMetadata: AudioMetadataModel(
            url: 'https://example.com/audio/new_song_002.mp3',
            durationInSeconds: 150,
            quality: 'high',
            recordingDate: now.subtract(const Duration(days: 10)).toIso8601String(),
            instrumentIds: ['inst_dan_tinh'],
            recordingLocation: LocationModel(
              latitude: 22.3435,
              longitude: 103.9065,
              province: 'Lào Cai',
            ),
            performerNames: ['Nghệ nhân Tày'],
            recordingEquipment: 'Tascam DR-40',
            recordedBy: 'user_002',
            bitrate: 320,
            format: 'mp3',
          ),
          culturalContext: CulturalContextModel(
            type: 'lullaby',
            occasion: 'Ru con',
            significance: 'Hát ru truyền thống',
          ),
          description: 'Bài hát ru cổ của người Tày.',
        ),
        notes: 'Bài hát ru này được truyền lại qua nhiều thế hệ.',
        submittedAt: now.subtract(const Duration(days: 15)).toIso8601String(),
        reviewedAt: now.subtract(const Duration(days: 12)).toIso8601String(),
        reviewedBy: 'admin_001',
        reviewComments: 'Bài hát đã được xác minh và thêm vào kho lưu trữ.',
      ),
      ContributionRequestModel(
        id: 'contrib_003',
        userId: 'user_003',
        type: 'audioUpload',
        status: 'rejected',
        songData: SongModel(
          id: 'song_new_003',
          title: 'Dân ca không rõ nguồn gốc',
          genre: 'folk',
          ethnicGroupId: 'ethnic_kinh',
          verificationStatus: 'rejected',
          audioMetadata: AudioMetadataModel(
            url: 'https://example.com/audio/new_song_003.mp3',
            durationInSeconds: 180,
            quality: 'low',
            recordingDate: now.subtract(const Duration(days: 20)).toIso8601String(),
            instrumentIds: ['inst_dan_tranh'],
            recordingLocation: LocationModel(
              latitude: 10.7769,
              longitude: 106.7009,
              province: 'Thành phố Hồ Chí Minh',
            ),
            performerNames: ['Không rõ'],
            recordingEquipment: 'Điện thoại',
            recordedBy: 'user_003',
            bitrate: 128,
            format: 'mp3',
          ),
          description: 'Bài dân ca không rõ nguồn gốc.',
        ),
        notes: 'Tôi nghe bài này nhưng không biết tên và nguồn gốc.',
        submittedAt: now.subtract(const Duration(days: 25)).toIso8601String(),
        reviewedAt: now.subtract(const Duration(days: 22)).toIso8601String(),
        reviewedBy: 'admin_001',
        reviewComments: 'Không đủ thông tin để xác minh. Vui lòng cung cấp thêm thông tin về nguồn gốc và người biểu diễn.',
      ),
      ContributionRequestModel(
        id: 'contrib_004',
        userId: 'user_001',
        type: 'metadata',
        status: 'pending',
        songData: SongModel(
          id: 'song_001',
          title: 'Lý con sáo',
          genre: 'folk',
          ethnicGroupId: 'ethnic_kinh',
          verificationStatus: 'verified',
          description: 'Bài dân ca miền Trung nổi tiếng.',
        ),
        notes: 'Tôi muốn bổ sung thông tin về lịch sử của bài hát này.',
        submittedAt: now.subtract(const Duration(days: 1)).toIso8601String(),
      ),
      ContributionRequestModel(
        id: 'contrib_005',
        userId: 'user_004',
        type: 'lyrics',
        status: 'verified',
        songData: SongModel(
          id: 'song_002',
          title: 'Quan họ Bắc Ninh',
          genre: 'folk',
          ethnicGroupId: 'ethnic_kinh',
          verificationStatus: 'verified',
          lyricsNativeScript: 'Người ơi người ở đừng về\nNgười về em thiếu bộn bề...',
          lyricsVietnameseTranslation: 'Người ơi người ở đừng về\nNgười về em thiếu bộn bề...',
        ),
        notes: 'Tôi đã thêm lời bài hát cho bài quan họ này.',
        submittedAt: now.subtract(const Duration(days: 8)).toIso8601String(),
        reviewedAt: now.subtract(const Duration(days: 6)).toIso8601String(),
        reviewedBy: 'admin_001',
        reviewComments: 'Lời bài hát đã được xác minh và cập nhật.',
      ),
    ];
  }
}
