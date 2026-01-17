import '../../models/song_model.dart';
import '../../models/audio_metadata_model.dart';
import '../../models/cultural_context_model.dart';
import '../../models/location_model.dart';

/// Mock data source for songs with ~50 Vietnamese traditional songs
abstract class MockSongDataSource {
  Future<List<SongModel>> getAllSongs();
  Future<SongModel?> getSongById(String id);
  Future<List<SongModel>> searchSongs({
    String? query,
    List<String>? ethnicGroupIds,
    List<String>? instrumentIds,
    List<String>? genres,
    List<String>? contextTypes,
    String? province,
    String? verificationStatus,
  });
}

class MockSongDataSourceImpl implements MockSongDataSource {
  static final List<SongModel> _songs = _generateMockSongs();

  @override
  Future<List<SongModel>> getAllSongs() async {
    // Simulate network delay
    await Future.delayed(const Duration(milliseconds: 300));
    return List.from(_songs);
  }

  @override
  Future<SongModel?> getSongById(String id) async {
    await Future.delayed(const Duration(milliseconds: 200));
    try {
      return _songs.firstWhere((song) => song.id == id);
    } catch (e) {
      return null;
    }
  }

  @override
  Future<List<SongModel>> searchSongs({
    String? query,
    List<String>? ethnicGroupIds,
    List<String>? instrumentIds,
    List<String>? genres,
    List<String>? contextTypes,
    String? province,
    String? verificationStatus,
  }) async {
    await Future.delayed(const Duration(milliseconds: 400));
    
    var results = List<SongModel>.from(_songs);

    // Text search
    if (query != null && query.isNotEmpty) {
      final lowerQuery = query.toLowerCase();
      results = results.where((song) {
        return song.title.toLowerCase().contains(lowerQuery) ||
            song.description?.toLowerCase().contains(lowerQuery) == true ||
            song.lyricsNativeScript?.toLowerCase().contains(lowerQuery) == true ||
            song.lyricsVietnameseTranslation?.toLowerCase().contains(lowerQuery) == true;
      }).toList();
    }

    // Filter by ethnic group
    if (ethnicGroupIds != null && ethnicGroupIds.isNotEmpty) {
      results = results.where((song) => ethnicGroupIds.contains(song.ethnicGroupId)).toList();
    }

    // Filter by instrument
    if (instrumentIds != null && instrumentIds.isNotEmpty) {
      results = results.where((song) {
        final songInstrumentIds = song.audioMetadata?.instrumentIds ?? [];
        return instrumentIds.any((id) => songInstrumentIds.contains(id));
      }).toList();
    }

    // Filter by genre
    if (genres != null && genres.isNotEmpty) {
      results = results.where((song) => genres.contains(song.genre)).toList();
    }

    // Filter by context type
    if (contextTypes != null && contextTypes.isNotEmpty) {
      results = results.where((song) {
        return song.culturalContext != null &&
            contextTypes.contains(song.culturalContext!.type);
      }).toList();
    }

    // Filter by province
    if (province != null && province.isNotEmpty) {
      results = results.where((song) {
        return song.audioMetadata?.recordingLocation?.province == province;
      }).toList();
    }

    // Filter by verification status
    if (verificationStatus != null && verificationStatus.isNotEmpty) {
      results = results.where((song) => song.verificationStatus == verificationStatus).toList();
    }

    return results;
  }

  static List<SongModel> _generateMockSongs() {
    final now = DateTime.now();
    final songs = <SongModel>[
      // Dân ca - Folk songs
      SongModel(
        id: 'song_001',
        title: 'Lý con sáo',
        alternativeTitles: ['Lý con sáo sang sông', 'Lý con sáo Huế'],
        genre: 'folk',
        ethnicGroupId: 'ethnic_kinh',
        verificationStatus: 'verified',
        audioMetadata: AudioMetadataModel(
          url: 'https://example.com/audio/ly_con_sao.mp3',
          durationInSeconds: 180,
          quality: 'high',
          recordingDate: '2020-03-15T10:30:00Z',
          instrumentIds: ['inst_dan_tranh', 'inst_dan_bau'],
          recordingLocation: LocationModel(
            latitude: 16.0544,
            longitude: 108.2022,
            province: 'Thừa Thiên Huế',
            district: 'Huế',
            commune: 'Phú Hội',
          ),
          performerNames: ['Nguyễn Thị Lan', 'Trần Văn Minh'],
          recordingEquipment: 'Zoom H4n',
          recordedBy: 'Viện Âm nhạc Việt Nam',
          bitrate: 320,
          format: 'mp3',
        ),
        culturalContext: CulturalContextModel(
          type: 'entertainment',
          occasion: 'Lễ hội',
          significance: 'Bài dân ca phổ biến ở miền Trung',
          historicalBackground: 'Lý con sáo là một trong những làn điệu dân ca nổi tiếng của miền Trung Việt Nam',
        ),
        lyricsNativeScript: 'Con sáo sang sông\nGặp cơn gió mạnh\nĐôi cánh tả tơi...',
        lyricsVietnameseTranslation: 'Con sáo bay qua sông\nGặp cơn gió mạnh\nĐôi cánh tả tơi...',
        language: 'Tiếng Việt',
        author: 'Dân gian',
        performanceType: 'vocalWithAccompaniment',
        isRecordingDateEstimated: false,
        copyrightInfo: 'Viện Âm nhạc Việt Nam',
        fieldNotes: 'Ghi âm tại lễ hội địa phương.',
        description: 'Bài dân ca miền Trung nổi tiếng, thường được hát trong các lễ hội và sinh hoạt cộng đồng.',
        playCount: 15234,
        favoriteCount: 892,
        createdAt: DateTime(2020, 3, 20).toIso8601String(),
        updatedAt: DateTime(2020, 3, 20).toIso8601String(),
        contributorId: 'user_001',
        tags: ['dân ca', 'miền Trung', 'lễ hội'],
      ),
      SongModel(
        id: 'song_002',
        title: 'Quan họ Bắc Ninh',
        alternativeTitles: ['Quan họ', 'Dân ca quan họ'],
        genre: 'folk',
        ethnicGroupId: 'ethnic_kinh',
        verificationStatus: 'verified',
        audioMetadata: AudioMetadataModel(
          url: 'https://example.com/audio/quan_ho_bac_ninh.mp3',
          durationInSeconds: 240,
          quality: 'professional',
          recordingDate: '2019-05-20T14:00:00Z',
          instrumentIds: ['inst_dan_nhi', 'inst_dan_tam'],
          recordingLocation: LocationModel(
            latitude: 21.0285,
            longitude: 106.0772,
            province: 'Bắc Ninh',
            district: 'Yên Phong',
            commune: 'Hòa Long',
          ),
          performerNames: ['Câu lạc bộ Quan họ Bắc Ninh'],
          recordingEquipment: 'Neumann U87',
          recordedBy: 'UNESCO Intangible Cultural Heritage',
          bitrate: 320,
          format: 'mp3',
        ),
        culturalContext: CulturalContextModel(
          type: 'festival',
          occasion: 'Lễ hội Lim',
          significance: 'Di sản văn hóa phi vật thể của nhân loại',
          historicalBackground: 'Quan họ Bắc Ninh là di sản văn hóa phi vật thể được UNESCO công nhận năm 2009',
        ),
        lyricsNativeScript: 'Người ơi người ở đừng về\nNgười về em thiếu bộn bề...',
        lyricsVietnameseTranslation: 'Người ơi người ở đừng về\nNgười về em thiếu bộn bề...',
        language: 'Tiếng Việt',
        author: 'Dân gian',
        performanceType: 'aCappella',
        isRecordingDateEstimated: true,
        copyrightInfo: 'UNESCO Intangible Cultural Heritage',
        fieldNotes: 'Thu âm từ câu lạc bộ quan họ.',
        description: 'Dân ca quan họ Bắc Ninh - di sản văn hóa phi vật thể của nhân loại.',
        playCount: 45678,
        favoriteCount: 3456,
        createdAt: DateTime(2019, 5, 25).toIso8601String(),
        updatedAt: DateTime(2019, 5, 25).toIso8601String(),
        contributorId: 'user_002',
        tags: ['quan họ', 'Bắc Ninh', 'UNESCO', 'di sản'],
      ),
      SongModel(
        id: 'song_003',
        title: 'Ví dặm Nghệ Tĩnh',
        alternativeTitles: ['Dặm Nghệ Tĩnh', 'Ví dặm'],
        genre: 'folk',
        ethnicGroupId: 'ethnic_kinh',
        verificationStatus: 'verified',
        audioMetadata: AudioMetadataModel(
          url: 'https://example.com/audio/vi_dam_nghe_tinh.mp3',
          durationInSeconds: 200,
          quality: 'high',
          recordingDate: '2021-08-10T09:00:00Z',
          instrumentIds: ['inst_dan_nhi'],
          recordingLocation: LocationModel(
            latitude: 18.3333,
            longitude: 105.9000,
            province: 'Nghệ An',
            district: 'Nam Đàn',
            commune: 'Nam Giang',
          ),
          performerNames: ['Nghệ nhân dân gian Nghệ Tĩnh'],
          recordingEquipment: 'Tascam DR-40',
          recordedBy: 'Sở Văn hóa Nghệ An',
          bitrate: 256,
          format: 'mp3',
        ),
        culturalContext: CulturalContextModel(
          type: 'work',
          occasion: 'Lao động',
          significance: 'Dân ca lao động đặc trưng của Nghệ Tĩnh',
          historicalBackground: 'Ví dặm là loại hình dân ca độc đáo của vùng Nghệ Tĩnh, thường được hát trong lao động',
        ),
        lyricsNativeScript: 'Trèo lên cây bưởi hái hoa\nBước xuống vườn cà hái nụ tầm xuân...',
        lyricsVietnameseTranslation: 'Trèo lên cây bưởi hái hoa\nBước xuống vườn cà hái nụ tầm xuân...',
        language: 'Tiếng Việt',
        author: 'Dân gian',
        performanceType: 'vocalWithAccompaniment',
        isRecordingDateEstimated: false,
        copyrightInfo: 'Sở Văn hóa Nghệ An',
        fieldNotes: 'Ghi âm tại làng cổ Nghệ Tĩnh.',
        description: 'Dân ca ví dặm Nghệ Tĩnh - di sản văn hóa phi vật thể quốc gia.',
        playCount: 23456,
        favoriteCount: 1234,
        createdAt: DateTime(2021, 8, 15).toIso8601String(),
        updatedAt: DateTime(2021, 8, 15).toIso8601String(),
        contributorId: 'user_003',
        tags: ['ví dặm', 'Nghệ Tĩnh', 'lao động'],
      ),
      // Nhã nhạc - Court music
      SongModel(
        id: 'song_004',
        title: 'Nhã nhạc cung đình Huế',
        alternativeTitles: ['Nhã nhạc', 'Cung đình nhạc'],
        genre: 'courtMusic',
        ethnicGroupId: 'ethnic_kinh',
        verificationStatus: 'verified',
        audioMetadata: AudioMetadataModel(
          url: 'https://example.com/audio/nha_nhac_hue.mp3',
          durationInSeconds: 360,
          quality: 'professional',
          recordingDate: '2018-11-05T15:30:00Z',
          instrumentIds: ['inst_dan_tranh', 'inst_dan_ty_ba', 'inst_dan_nhi', 'inst_trong'],
          recordingLocation: LocationModel(
            latitude: 16.4677,
            longitude: 107.5906,
            province: 'Thừa Thiên Huế',
            district: 'Huế',
            commune: 'Phú Hậu',
          ),
          performerNames: ['Nhã nhạc cung đình Huế'],
          recordingEquipment: 'Sony PCM-D100',
          recordedBy: 'Trung tâm Bảo tồn Di tích Cố đô Huế',
          bitrate: 320,
          format: 'mp3',
        ),
        culturalContext: CulturalContextModel(
          type: 'ceremonial',
          occasion: 'Lễ tế',
          significance: 'Di sản văn hóa phi vật thể của nhân loại',
          historicalBackground: 'Nhã nhạc cung đình Huế là âm nhạc cung đình thời Nguyễn, được UNESCO công nhận năm 2003',
        ),
        language: 'Tiếng Việt',
        author: 'Nhạc sĩ cung đình',
        performanceType: 'instrumental',
        isRecordingDateEstimated: false,
        copyrightInfo: 'Trung tâm Bảo tồn Di tích Cố đô Huế',
        fieldNotes: 'Ghi âm tại Đại Nội Huế.',
        description: 'Nhã nhạc cung đình Huế - âm nhạc cung đình triều Nguyễn.',
        playCount: 67890,
        favoriteCount: 5678,
        createdAt: DateTime(2018, 11, 10).toIso8601String(),
        updatedAt: DateTime(2018, 11, 10).toIso8601String(),
        contributorId: 'user_004',
        tags: ['nhã nhạc', 'cung đình', 'Huế', 'UNESCO'],
      ),
      // Ethnic minority songs - Tày
      SongModel(
        id: 'song_005',
        title: 'Then Tày',
        alternativeTitles: ['Hát Then', 'Then cổ'],
        genre: 'ceremonial',
        ethnicGroupId: 'ethnic_tay',
        verificationStatus: 'verified',
        audioMetadata: AudioMetadataModel(
          url: 'https://example.com/audio/then_tay.mp3',
          durationInSeconds: 420,
          quality: 'high',
          recordingDate: '2020-06-12T11:00:00Z',
          instrumentIds: ['inst_dan_tinh'],
          recordingLocation: LocationModel(
            latitude: 22.3435,
            longitude: 103.9065,
            province: 'Lào Cai',
            district: 'Bảo Thắng',
            commune: 'Phố Lu',
          ),
          performerNames: ['Nghệ nhân Then Tày'],
          recordingEquipment: 'Zoom H5',
          recordedBy: 'Viện Văn hóa Dân tộc',
          bitrate: 256,
          format: 'mp3',
        ),
        culturalContext: CulturalContextModel(
          type: 'religious',
          occasion: 'Lễ cúng',
          significance: 'Nghi lễ Then của người Tày',
          historicalBackground: 'Then là nghi lễ tín ngưỡng quan trọng của người Tày, được UNESCO công nhận năm 2019',
        ),
        lyricsNativeScript: 'Then là nghi lễ tín ngưỡng của người Tày...',
        description: 'Nghi lễ Then của người Tày - di sản văn hóa phi vật thể của nhân loại.',
        language: 'Tày',
        author: 'Dân gian',
        performanceType: 'vocalWithAccompaniment',
        isRecordingDateEstimated: true,
        copyrightInfo: 'Viện Văn hóa Dân tộc',
        fieldNotes: 'Ghi âm trong nghi lễ Then truyền thống.',
        playCount: 12345,
        favoriteCount: 789,
        createdAt: DateTime(2020, 6, 18).toIso8601String(),
        updatedAt: DateTime(2020, 6, 18).toIso8601String(),
        contributorId: 'user_005',
        tags: ['Then', 'Tày', 'nghi lễ', 'UNESCO'],
      ),
      // Thái
      SongModel(
        id: 'song_006',
        title: 'Khắp Thái',
        alternativeTitles: ['Hát Khắp', 'Khắp cổ'],
        genre: 'folk',
        ethnicGroupId: 'ethnic_thai',
        verificationStatus: 'verified',
        audioMetadata: AudioMetadataModel(
          url: 'https://example.com/audio/khap_thai.mp3',
          durationInSeconds: 300,
          quality: 'high',
          recordingDate: '2021-02-14T10:00:00Z',
          instrumentIds: ['inst_khen_bau'],
          recordingLocation: LocationModel(
            latitude: 21.3251,
            longitude: 103.9167,
            province: 'Điện Biên',
            district: 'Mường Lay',
            commune: 'Mường Lay',
          ),
          performerNames: ['Nghệ nhân Khắp Thái'],
          recordingEquipment: 'Tascam DR-05',
          recordedBy: 'Bảo tàng Dân tộc học',
          bitrate: 256,
          format: 'mp3',
        ),
        culturalContext: CulturalContextModel(
          type: 'entertainment',
          occasion: 'Sinh hoạt cộng đồng',
          significance: 'Dân ca của người Thái',
          historicalBackground: 'Khắp là loại hình dân ca độc đáo của người Thái Tây Bắc',
        ),
        lyricsNativeScript: 'Khắp là bài hát dân ca của người Thái...',
        description: 'Dân ca Khắp của người Thái Tây Bắc.',
        language: 'Thái',
        author: 'Dân gian',
        performanceType: 'vocalWithAccompaniment',
        isRecordingDateEstimated: false,
        copyrightInfo: 'Bảo tàng Dân tộc học',
        fieldNotes: 'Thu âm trong sinh hoạt cộng đồng.',
        playCount: 9876,
        favoriteCount: 456,
        createdAt: DateTime(2021, 2, 20).toIso8601String(),
        updatedAt: DateTime(2021, 2, 20).toIso8601String(),
        contributorId: 'user_006',
        tags: ['Khắp', 'Thái', 'Tây Bắc'],
      ),
      // Mường
      SongModel(
        id: 'song_007',
        title: 'Hát Xéc Bùa',
        alternativeTitles: ['Xéc Bùa', 'Dân ca Mường'],
        genre: 'folk',
        ethnicGroupId: 'ethnic_muong',
        verificationStatus: 'verified',
        audioMetadata: AudioMetadataModel(
          url: 'https://example.com/audio/xec_bua.mp3',
          durationInSeconds: 180,
          quality: 'medium',
          recordingDate: '2020-09-08T13:00:00Z',
          instrumentIds: ['inst_chieng'],
          recordingLocation: LocationModel(
            latitude: 20.5411,
            longitude: 105.3378,
            province: 'Hòa Bình',
            district: 'Mai Châu',
            commune: 'Mai Châu',
          ),
          performerNames: ['Nghệ nhân Mường'],
          recordingEquipment: 'Zoom H1n',
          recordedBy: 'Sở Văn hóa Hòa Bình',
          bitrate: 192,
          format: 'mp3',
        ),
        culturalContext: CulturalContextModel(
          type: 'wedding',
          occasion: 'Lễ cưới',
          significance: 'Dân ca trong lễ cưới của người Mường',
          historicalBackground: 'Xéc Bùa là bài hát truyền thống trong lễ cưới của người Mường',
        ),
        lyricsNativeScript: 'Xéc Bùa là bài hát trong lễ cưới...',
        description: 'Dân ca Xéc Bùa của người Mường trong lễ cưới.',
        language: 'Mường',
        author: 'Dân gian',
        performanceType: 'aCappella',
        isRecordingDateEstimated: true,
        copyrightInfo: 'Sở Văn hóa Hòa Bình',
        fieldNotes: 'Ghi âm tại lễ cưới truyền thống.',
        playCount: 5432,
        favoriteCount: 234,
        createdAt: DateTime(2020, 9, 15).toIso8601String(),
        updatedAt: DateTime(2020, 9, 15).toIso8601String(),
        contributorId: 'user_007',
        tags: ['Xéc Bùa', 'Mường', 'lễ cưới'],
      ),
      // H'Mông
      SongModel(
        id: 'song_008',
        title: 'Hát Gầu Plềnh',
        alternativeTitles: ['Gầu Plềnh', 'Dân ca H\'Mông'],
        genre: 'folk',
        ethnicGroupId: 'ethnic_hmong',
        verificationStatus: 'verified',
        audioMetadata: AudioMetadataModel(
          url: 'https://example.com/audio/gau_plenh.mp3',
          durationInSeconds: 240,
          quality: 'high',
          recordingDate: '2021-01-20T09:30:00Z',
          instrumentIds: ['inst_khen_mong'],
          recordingLocation: LocationModel(
            latitude: 22.3364,
            longitude: 103.8440,
            province: 'Lào Cai',
            district: 'Sa Pa',
            commune: 'Sa Pa',
          ),
          performerNames: ['Nghệ nhân H\'Mông'],
          recordingEquipment: 'Zoom H4n',
          recordedBy: 'Viện Văn hóa Dân tộc',
          bitrate: 256,
          format: 'mp3',
        ),
        culturalContext: CulturalContextModel(
          type: 'festival',
          occasion: 'Lễ hội',
          significance: 'Dân ca trong lễ hội của người H\'Mông',
          historicalBackground: 'Gầu Plềnh là bài hát truyền thống trong các lễ hội của người H\'Mông',
        ),
        lyricsNativeScript: 'Gầu Plềnh là bài hát lễ hội...',
        description: 'Dân ca Gầu Plềnh của người H\'Mông trong lễ hội.',
        language: 'H\'Mông',
        author: 'Dân gian',
        performanceType: 'vocalWithAccompaniment',
        isRecordingDateEstimated: false,
        copyrightInfo: 'Viện Văn hóa Dân tộc',
        fieldNotes: 'Ghi âm tại lễ hội mùa xuân.',
        playCount: 8765,
        favoriteCount: 567,
        createdAt: DateTime(2021, 1, 25).toIso8601String(),
        updatedAt: DateTime(2021, 1, 25).toIso8601String(),
        contributorId: 'user_008',
        tags: ['Gầu Plềnh', 'H\'Mông', 'lễ hội'],
      ),
      // More songs to reach ~50
      SongModel(
        id: 'song_009',
        title: 'Hò đối đáp',
        alternativeTitles: ['Hò', 'Hò miền Nam'],
        genre: 'folk',
        ethnicGroupId: 'ethnic_kinh',
        verificationStatus: 'verified',
        audioMetadata: AudioMetadataModel(
          url: 'https://example.com/audio/ho_doi_dap.mp3',
          durationInSeconds: 200,
          quality: 'high',
          recordingDate: '2020-07-15T16:00:00Z',
          instrumentIds: ['inst_dan_tranh'],
          recordingLocation: LocationModel(
            latitude: 10.7769,
            longitude: 106.7009,
            province: 'Thành phố Hồ Chí Minh',
            district: 'Quận 1',
            commune: 'Bến Nghé',
          ),
          performerNames: ['Nghệ nhân dân gian Nam Bộ'],
          recordingEquipment: 'Tascam DR-40',
          recordedBy: 'Sở Văn hóa TP.HCM',
          bitrate: 256,
          format: 'mp3',
        ),
        culturalContext: CulturalContextModel(
          type: 'work',
          occasion: 'Lao động',
          significance: 'Dân ca lao động miền Nam',
          historicalBackground: 'Hò đối đáp là loại hình dân ca lao động phổ biến ở miền Nam',
        ),
        language: 'Tiếng Việt',
        author: 'Dân gian',
        performanceType: 'aCappella',
        isRecordingDateEstimated: false,
        copyrightInfo: 'Sở Văn hóa TP.HCM',
        fieldNotes: 'Ghi âm tại bến sông.',
        description: 'Dân ca hò đối đáp miền Nam.',
        playCount: 11234,
        favoriteCount: 678,
        createdAt: DateTime(2020, 7, 20).toIso8601String(),
        updatedAt: DateTime(2020, 7, 20).toIso8601String(),
        contributorId: 'user_009',
        tags: ['hò', 'miền Nam', 'lao động'],
      ),
      SongModel(
        id: 'song_010',
        title: 'Chèo cổ',
        alternativeTitles: ['Chèo', 'Chèo truyền thống'],
        genre: 'operatic',
        ethnicGroupId: 'ethnic_kinh',
        verificationStatus: 'verified',
        audioMetadata: AudioMetadataModel(
          url: 'https://example.com/audio/cheo_co.mp3',
          durationInSeconds: 480,
          quality: 'professional',
          recordingDate: '2019-12-10T19:00:00Z',
          instrumentIds: ['inst_dan_nhi', 'inst_dan_tam', 'inst_trong'],
          recordingLocation: LocationModel(
            latitude: 20.9101,
            longitude: 105.8378,
            province: 'Hà Nội',
            district: 'Hoàn Kiếm',
            commune: 'Phan Chu Trinh',
          ),
          performerNames: ['Đoàn Chèo Hà Nội'],
          recordingEquipment: 'Neumann U87',
          recordedBy: 'Nhà hát Chèo Việt Nam',
          bitrate: 320,
          format: 'mp3',
        ),
        culturalContext: CulturalContextModel(
          type: 'entertainment',
          occasion: 'Biểu diễn',
          significance: 'Loại hình sân khấu dân gian Bắc Bộ',
          historicalBackground: 'Chèo là loại hình sân khấu dân gian đặc trưng của vùng đồng bằng Bắc Bộ',
        ),
        language: 'Tiếng Việt',
        author: 'Soạn giả truyền thống',
        performanceType: 'vocalWithAccompaniment',
        isRecordingDateEstimated: false,
        copyrightInfo: 'Nhà hát Chèo Việt Nam',
        fieldNotes: 'Thu âm tại nhà hát.',
        description: 'Chèo cổ - loại hình sân khấu dân gian Bắc Bộ.',
        playCount: 34567,
        favoriteCount: 2345,
        createdAt: DateTime(2019, 12, 15).toIso8601String(),
        updatedAt: DateTime(2019, 12, 15).toIso8601String(),
        contributorId: 'user_010',
        tags: ['chèo', 'sân khấu', 'Bắc Bộ'],
      ),
      // Add more songs to reach ~50 total
      // I'll add a few more key ones and then create a helper to generate the rest
      SongModel(
        id: 'song_011',
        title: 'Ca trù',
        alternativeTitles: ['Hát ả đào', 'Hát nói'],
        genre: 'ceremonial',
        ethnicGroupId: 'ethnic_kinh',
        verificationStatus: 'verified',
        audioMetadata: AudioMetadataModel(
          url: 'https://example.com/audio/ca_tru.mp3',
          durationInSeconds: 360,
          quality: 'professional',
          recordingDate: '2018-05-20T20:00:00Z',
          instrumentIds: ['inst_dan_day'],
          recordingLocation: LocationModel(
            latitude: 21.0285,
            longitude: 105.8542,
            province: 'Hà Nội',
            district: 'Hoàn Kiếm',
            commune: 'Hàng Buồm',
          ),
          performerNames: ['Câu lạc bộ Ca trù Thăng Long'],
          recordingEquipment: 'Sony PCM-D100',
          recordedBy: 'UNESCO Intangible Cultural Heritage',
          bitrate: 320,
          format: 'mp3',
        ),
        culturalContext: CulturalContextModel(
          type: 'ceremonial',
          occasion: 'Lễ hội',
          significance: 'Di sản văn hóa phi vật thể của nhân loại',
          historicalBackground: 'Ca trù là loại hình nghệ thuật độc đáo, được UNESCO công nhận năm 2009',
        ),
        language: 'Tiếng Việt',
        author: 'Dân gian',
        performanceType: 'aCappella',
        isRecordingDateEstimated: false,
        copyrightInfo: 'UNESCO Intangible Cultural Heritage',
        fieldNotes: 'Thu âm tại câu lạc bộ Ca trù.',
        description: 'Ca trù - di sản văn hóa phi vật thể của nhân loại.',
        playCount: 45678,
        favoriteCount: 3456,
        createdAt: DateTime(2018, 5, 25).toIso8601String(),
        updatedAt: DateTime(2018, 5, 25).toIso8601String(),
        contributorId: 'user_011',
        tags: ['ca trù', 'UNESCO', 'di sản'],
      ),
    ];

    // Generate more songs to reach ~50 total
    final additionalSongs = _generateAdditionalSongs(now);
    return [...songs, ...additionalSongs];
  }

  static List<SongModel> _generateAdditionalSongs(DateTime baseDate) {
    final ethnicGroups = [
      'ethnic_kinh',
      'ethnic_tay',
      'ethnic_thai',
      'ethnic_muong',
      'ethnic_hmong',
      'ethnic_nung',
      'ethnic_dao',
      'ethnic_gia_rai',
      'ethnic_e_de',
      'ethnic_ba_na',
    ];
    final genres = ['folk', 'ceremonial', 'courtMusic', 'operatic', 'contemporary'];
    final contextTypes = ['wedding', 'funeral', 'festival', 'religious', 'entertainment', 'work', 'lullaby'];
    final instruments = [
      'inst_dan_tranh',
      'inst_dan_bau',
      'inst_dan_nhi',
      'inst_dan_tam',
      'inst_dan_ty_ba',
      'inst_dan_day',
      'inst_sao_truc',
      'inst_khen_bau',
      'inst_chieng',
      'inst_trong',
    ];
    final provinces = [
      'Hà Nội',
      'Thành phố Hồ Chí Minh',
      'Bắc Ninh',
      'Thừa Thiên Huế',
      'Nghệ An',
      'Lào Cai',
      'Điện Biên',
      'Hòa Bình',
      'Kon Tum',
      'Gia Lai',
    ];

    final songs = <SongModel>[];
    final titles = [
      'Dân ca đồng bằng',
      'Hát ru',
      'Lý ngựa ô',
      'Lý chiều chiều',
      'Hò giã gạo',
      'Hát xoan',
      'Dân ca Nam Bộ',
      'Lý giao duyên',
      'Hát đúm',
      'Dân ca Tây Nguyên',
      'Hát bội',
      'Tuồng cổ',
      'Cải lương',
      'Dân ca miền núi',
      'Hát then',
      'Khắp cổ',
      'Dân ca Chăm',
      'Hát ru con',
      'Lý tình tang',
      'Dân ca Khmer',
      'Hát xẩm',
      'Dân ca Dao',
      'Hát lượn',
      'Dân ca Nùng',
      'Hát sli',
      'Dân ca Gia Rai',
      'Hát khan',
      'Dân ca Ê Đê',
      'Hát kưng',
      'Dân ca Ba Na',
      'Hát kơ tu',
      'Dân ca Xơ Đăng',
      'Hát dân ca',
      'Lý hoài nam',
      'Dân ca M\'Nông',
      'Hát dân ca',
      'Lý cây đa',
      'Dân ca Cơ Ho',
      'Hát dân ca',
    ];

    for (int i = 12; i <= 50; i++) {
      final ethnicGroup = ethnicGroups[i % ethnicGroups.length];
      final genre = genres[i % genres.length];
      final contextType = contextTypes[i % contextTypes.length];
      final instrument = instruments[i % instruments.length];
      final province = provinces[i % provinces.length];
      final title = titles[(i - 12) % titles.length];
      final createdAt = baseDate.subtract(Duration(days: (50 - i) * 30));

      songs.add(
        SongModel(
          id: 'song_${i.toString().padLeft(3, '0')}',
          title: title,
          genre: genre,
          ethnicGroupId: ethnicGroup,
          verificationStatus: i % 10 == 0 ? 'pending' : (i % 5 == 0 ? 'rejected' : 'verified'),
        language: i % 2 == 0
            ? 'Tiếng Việt'
            : 'Dân tộc ${ethnicGroup.substring(7)}',
          author: 'Dân gian',
          performanceType: i % 3 == 0 ? 'instrumental' : (i % 3 == 1 ? 'aCappella' : 'vocalWithAccompaniment'),
          isRecordingDateEstimated: i % 4 == 0,
          copyrightInfo: 'Viện Văn hóa',
          fieldNotes: 'Mock data tự sinh.',
          audioMetadata: AudioMetadataModel(
            url: 'https://example.com/audio/song_$i.mp3',
            durationInSeconds: 180 + (i * 10) % 300,
            quality: i % 4 == 0 ? 'professional' : (i % 3 == 0 ? 'high' : (i % 2 == 0 ? 'medium' : 'low')),
            recordingDate: createdAt.subtract(const Duration(days: 5)).toIso8601String(),
            instrumentIds: [instrument],
            recordingLocation: LocationModel(
              latitude: 10.0 + (i % 20) * 0.5,
              longitude: 105.0 + (i % 10) * 0.5,
              province: province,
            ),
            performerNames: ['Nghệ nhân dân gian'],
            recordingEquipment: 'Zoom H4n',
            recordedBy: 'Viện Văn hóa',
            bitrate: 256,
            format: 'mp3',
            sampleRate: 44100,
          ),
          culturalContext: CulturalContextModel(
            type: contextType,
            occasion: 'Lễ hội',
            significance: 'Dân ca truyền thống',
          ),
          description: 'Bài dân ca truyền thống của Việt Nam.',
          playCount: 1000 + (i * 100) % 50000,
          favoriteCount: 50 + (i * 10) % 5000,
          createdAt: createdAt.toIso8601String(),
          updatedAt: createdAt.toIso8601String(),
          contributorId: 'user_${(i % 20).toString().padLeft(3, '0')}',
          tags: ['dân ca', 'truyền thống'],
        ),
      );
    }

    return songs;
  }
}
