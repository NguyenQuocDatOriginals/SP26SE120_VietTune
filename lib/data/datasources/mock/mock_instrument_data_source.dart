import '../../models/instrument_model.dart';

/// Mock data source for instruments with 54+ traditional Vietnamese instruments
abstract class MockInstrumentDataSource {
  Future<List<InstrumentModel>> getAllInstruments();
  Future<InstrumentModel?> getInstrumentById(String id);
  Future<List<InstrumentModel>> getInstrumentsByType(String type);
  Future<List<InstrumentModel>> getInstrumentsByEthnicGroup(String ethnicGroupId);
  Future<List<InstrumentModel>> searchInstruments(String query);
}

class MockInstrumentDataSourceImpl implements MockInstrumentDataSource {
  static final List<InstrumentModel> _instruments = _generateMockInstruments();

  @override
  Future<List<InstrumentModel>> getAllInstruments() async {
    await Future.delayed(const Duration(milliseconds: 200));
    return List.from(_instruments);
  }

  @override
  Future<InstrumentModel?> getInstrumentById(String id) async {
    await Future.delayed(const Duration(milliseconds: 150));
    try {
      return _instruments.firstWhere((inst) => inst.id == id);
    } catch (e) {
      return null;
    }
  }

  @override
  Future<List<InstrumentModel>> getInstrumentsByType(String type) async {
    await Future.delayed(const Duration(milliseconds: 200));
    return _instruments.where((inst) => inst.type == type).toList();
  }

  @override
  Future<List<InstrumentModel>> getInstrumentsByEthnicGroup(String ethnicGroupId) async {
    await Future.delayed(const Duration(milliseconds: 200));
    return _instruments.where((inst) {
      return inst.associatedEthnicGroups?.contains(ethnicGroupId) == true;
    }).toList();
  }

  @override
  Future<List<InstrumentModel>> searchInstruments(String query) async {
    await Future.delayed(const Duration(milliseconds: 250));
    final lowerQuery = query.toLowerCase();
    return _instruments.where((inst) {
      return inst.name.toLowerCase().contains(lowerQuery) ||
          inst.description.toLowerCase().contains(lowerQuery);
    }).toList();
  }

  static List<InstrumentModel> _generateMockInstruments() {
    return [
      // String instruments
      InstrumentModel(
        id: 'inst_dan_tranh',
        name: 'Đàn tranh',
        type: 'string',
        description: 'Đàn tranh là nhạc cụ dây gảy của Việt Nam, có 16-17 dây, được sử dụng trong nhiều thể loại nhạc truyền thống.',
        materials: ['Gỗ', 'Dây tơ', 'Đồng'],
        playingTechnique: 'Dùng móng gảy để gảy dây',
        imageUrl: 'https://example.com/images/dan_tranh.jpg',
        audioSampleUrl: 'https://example.com/audio/dan_tranh_sample.mp3',
        associatedEthnicGroups: ['ethnic_kinh'],
      ),
      InstrumentModel(
        id: 'inst_dan_bau',
        name: 'Đàn bầu',
        type: 'string',
        description: 'Đàn bầu là nhạc cụ một dây độc đáo của Việt Nam, có thể tạo ra nhiều âm thanh khác nhau bằng cách uốn cần đàn.',
        materials: ['Gỗ', 'Dây tơ', 'Bầu đàn'],
        playingTechnique: 'Dùng tay phải gảy dây, tay trái uốn cần đàn',
        imageUrl: 'https://example.com/images/dan_bau.jpg',
        audioSampleUrl: 'https://example.com/audio/dan_bau_sample.mp3',
        associatedEthnicGroups: ['ethnic_kinh'],
      ),
      InstrumentModel(
        id: 'inst_dan_nhi',
        name: 'Đàn nhị',
        type: 'string',
        description: 'Đàn nhị là nhạc cụ dây kéo bằng cung vĩ, có 2 dây, phổ biến trong nhạc dân tộc Việt Nam.',
        materials: ['Gỗ', 'Dây tơ', 'Da trăn'],
        playingTechnique: 'Kéo bằng cung vĩ',
        imageUrl: 'https://example.com/images/dan_nhi.jpg',
        audioSampleUrl: 'https://example.com/audio/dan_nhi_sample.mp3',
        associatedEthnicGroups: ['ethnic_kinh', 'ethnic_tay', 'ethnic_thai'],
      ),
      InstrumentModel(
        id: 'inst_dan_tam',
        name: 'Đàn tam',
        type: 'string',
        description: 'Đàn tam là nhạc cụ dây gảy có 3 dây, thường được sử dụng trong nhạc chèo và quan họ.',
        materials: ['Gỗ', 'Dây tơ'],
        playingTechnique: 'Gảy bằng ngón tay hoặc móng gảy',
        imageUrl: 'https://example.com/images/dan_tam.jpg',
        audioSampleUrl: 'https://example.com/audio/dan_tam_sample.mp3',
        associatedEthnicGroups: ['ethnic_kinh'],
      ),
      InstrumentModel(
        id: 'inst_dan_ty_ba',
        name: 'Đàn tỳ bà',
        type: 'string',
        description: 'Đàn tỳ bà là nhạc cụ dây gảy có 4 dây, có nguồn gốc từ Trung Quốc, được sử dụng trong nhã nhạc cung đình Huế.',
        materials: ['Gỗ', 'Dây tơ'],
        playingTechnique: 'Gảy bằng móng gảy',
        imageUrl: 'https://example.com/images/dan_ty_ba.jpg',
        audioSampleUrl: 'https://example.com/audio/dan_ty_ba_sample.mp3',
        associatedEthnicGroups: ['ethnic_kinh'],
      ),
      InstrumentModel(
        id: 'inst_dan_day',
        name: 'Đàn đáy',
        type: 'string',
        description: 'Đàn đáy là nhạc cụ dây gảy có 3 dây, đặc trưng cho ca trù.',
        materials: ['Gỗ', 'Dây tơ'],
        playingTechnique: 'Gảy bằng móng gảy',
        imageUrl: 'https://example.com/images/dan_day.jpg',
        audioSampleUrl: 'https://example.com/audio/dan_day_sample.mp3',
        associatedEthnicGroups: ['ethnic_kinh'],
      ),
      InstrumentModel(
        id: 'inst_dan_tinh',
        name: 'Đàn tính',
        type: 'string',
        description: 'Đàn tính là nhạc cụ dây gảy của người Tày, có 3 dây, thường được sử dụng trong hát Then.',
        materials: ['Gỗ', 'Dây tơ', 'Bầu đàn'],
        playingTechnique: 'Gảy bằng ngón tay',
        imageUrl: 'https://example.com/images/dan_tinh.jpg',
        audioSampleUrl: 'https://example.com/audio/dan_tinh_sample.mp3',
        associatedEthnicGroups: ['ethnic_tay'],
      ),
      // Wind instruments
      InstrumentModel(
        id: 'inst_sao_truc',
        name: 'Sáo trúc',
        type: 'wind',
        description: 'Sáo trúc là nhạc cụ thổi bằng tre, có 6 lỗ bấm, phổ biến trong nhạc dân tộc Việt Nam.',
        materials: ['Tre', 'Trúc'],
        playingTechnique: 'Thổi bằng miệng, bấm lỗ để tạo nốt',
        imageUrl: 'https://example.com/images/sao_truc.jpg',
        audioSampleUrl: 'https://example.com/audio/sao_truc_sample.mp3',
        associatedEthnicGroups: ['ethnic_kinh', 'ethnic_tay', 'ethnic_thai'],
      ),
      InstrumentModel(
        id: 'inst_khen_bau',
        name: 'Kèn bầu',
        type: 'wind',
        description: 'Kèn bầu là nhạc cụ thổi có bầu bằng gỗ, thường được sử dụng trong nhã nhạc cung đình.',
        materials: ['Gỗ', 'Đồng'],
        playingTechnique: 'Thổi bằng miệng',
        imageUrl: 'https://example.com/images/ken_bau.jpg',
        audioSampleUrl: 'https://example.com/audio/ken_bau_sample.mp3',
        associatedEthnicGroups: ['ethnic_kinh'],
      ),
      InstrumentModel(
        id: 'inst_khen_mong',
        name: 'Khèn Mông',
        type: 'wind',
        description: 'Khèn là nhạc cụ thổi đặc trưng của người H\'Mông, có nhiều ống tre.',
        materials: ['Tre', 'Gỗ'],
        playingTechnique: 'Thổi bằng miệng, dùng tay bịt các ống',
        imageUrl: 'https://example.com/images/khen_mong.jpg',
        audioSampleUrl: 'https://example.com/audio/khen_mong_sample.mp3',
        associatedEthnicGroups: ['ethnic_hmong'],
      ),
      // Percussion instruments
      InstrumentModel(
        id: 'inst_chieng',
        name: 'Chiêng',
        type: 'percussion',
        description: 'Chiêng là nhạc cụ gõ bằng đồng, phổ biến ở Tây Nguyên và các dân tộc miền núi.',
        materials: ['Đồng'],
        playingTechnique: 'Gõ bằng dùi',
        imageUrl: 'https://example.com/images/chieng.jpg',
        audioSampleUrl: 'https://example.com/audio/chieng_sample.mp3',
        associatedEthnicGroups: ['ethnic_gia_rai', 'ethnic_e_de', 'ethnic_ba_na', 'ethnic_muong'],
      ),
      InstrumentModel(
        id: 'inst_trong',
        name: 'Trống',
        type: 'percussion',
        description: 'Trống là nhạc cụ gõ phổ biến trong nhiều thể loại nhạc truyền thống Việt Nam.',
        materials: ['Gỗ', 'Da trâu'],
        playingTechnique: 'Gõ bằng tay hoặc dùi',
        imageUrl: 'https://example.com/images/trong.jpg',
        audioSampleUrl: 'https://example.com/audio/trong_sample.mp3',
        associatedEthnicGroups: ['ethnic_kinh', 'ethnic_tay', 'ethnic_thai', 'ethnic_muong'],
      ),
      InstrumentModel(
        id: 'inst_klong_put',
        name: 'K\'lông pút',
        type: 'percussion',
        description: 'K\'lông pút là nhạc cụ gõ bằng tre của người Ba Na, phát ra âm thanh bằng cách vỗ tay vào đầu ống.',
        materials: ['Tre'],
        playingTechnique: 'Vỗ tay vào đầu ống',
        imageUrl: 'https://example.com/images/klong_put.jpg',
        audioSampleUrl: 'https://example.com/audio/klong_put_sample.mp3',
        associatedEthnicGroups: ['ethnic_ba_na'],
      ),
      InstrumentModel(
        id: 'inst_t_rung',
        name: 'T\'rưng',
        type: 'percussion',
        description: 'T\'rưng là nhạc cụ gõ bằng tre của người Gia Rai, có nhiều ống tre với độ dài khác nhau.',
        materials: ['Tre'],
        playingTechnique: 'Gõ bằng dùi',
        imageUrl: 'https://example.com/images/t_rung.jpg',
        audioSampleUrl: 'https://example.com/audio/t_rung_sample.mp3',
        associatedEthnicGroups: ['ethnic_gia_rai'],
      ),
      // Add more instruments to reach 50+
      ..._generateAdditionalInstruments(),
    ];
  }

  static List<InstrumentModel> _generateAdditionalInstruments() {
    final additionalInstruments = [
      // More string instruments
      InstrumentModel(
        id: 'inst_dan_nguyet',
        name: 'Đàn nguyệt',
        type: 'string',
        description: 'Đàn nguyệt là nhạc cụ dây gảy có 2 dây, hình tròn như mặt trăng.',
        materials: ['Gỗ', 'Dây tơ'],
        playingTechnique: 'Gảy bằng móng gảy',
        associatedEthnicGroups: ['ethnic_kinh'],
      ),
      InstrumentModel(
        id: 'inst_dan_ngoc_luu',
        name: 'Đàn ngọc lưu',
        type: 'string',
        description: 'Đàn ngọc lưu là nhạc cụ dây gảy trong nhã nhạc cung đình.',
        materials: ['Gỗ', 'Dây tơ'],
        playingTechnique: 'Gảy bằng móng gảy',
        associatedEthnicGroups: ['ethnic_kinh'],
      ),
      // More wind instruments
      InstrumentModel(
        id: 'inst_ken_loa',
        name: 'Kèn loa',
        type: 'wind',
        description: 'Kèn loa là nhạc cụ thổi có loa bằng đồng.',
        materials: ['Đồng', 'Gỗ'],
        playingTechnique: 'Thổi bằng miệng',
        associatedEthnicGroups: ['ethnic_kinh'],
      ),
      InstrumentModel(
        id: 'inst_dieu',
        name: 'Điếu',
        type: 'wind',
        description: 'Điếu là nhạc cụ thổi bằng tre của người Tày.',
        materials: ['Tre'],
        playingTechnique: 'Thổi bằng miệng',
        associatedEthnicGroups: ['ethnic_tay'],
      ),
      // More percussion
      InstrumentModel(
        id: 'inst_phach',
        name: 'Phách',
        type: 'percussion',
        description: 'Phách là nhạc cụ gõ bằng tre, dùng trong ca trù.',
        materials: ['Tre'],
        playingTechnique: 'Gõ bằng tay',
        associatedEthnicGroups: ['ethnic_kinh'],
      ),
      InstrumentModel(
        id: 'inst_mo',
        name: 'Mõ',
        type: 'percussion',
        description: 'Mõ là nhạc cụ gõ bằng gỗ, dùng trong chùa và nhạc lễ.',
        materials: ['Gỗ'],
        playingTechnique: 'Gõ bằng dùi',
        associatedEthnicGroups: ['ethnic_kinh'],
      ),
    ];

    // Generate more to reach 50+
    final generated = <InstrumentModel>[];
    final types = ['string', 'wind', 'percussion', 'keyboard', 'other'];
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
    final names = [
      'Đàn cổ',
      'Sáo dọc',
      'Trống cơm',
      'Đàn tứ',
      'Kèn đồng',
      'Chiêng tre',
      'Đàn sến',
      'Sáo ngang',
      'Trống bồng',
      'Đàn đoản',
    ];

    for (int i = 0; i < 30; i++) {
      final type = types[i % types.length];
      final ethnicGroup = ethnicGroups[i % ethnicGroups.length];
      final name = '${names[i % names.length]} ${i + 1}';

      generated.add(
        InstrumentModel(
          id: 'inst_${i + 15}',
          name: name,
          type: type,
          description: 'Nhạc cụ truyền thống của Việt Nam.',
          materials: ['Gỗ', 'Tre'],
          playingTechnique: 'Chơi bằng tay',
          associatedEthnicGroups: [ethnicGroup],
        ),
      );
    }

    return [...additionalInstruments, ...generated];
  }
}
