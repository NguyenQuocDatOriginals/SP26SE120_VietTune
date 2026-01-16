import '../../models/ethnic_group_model.dart';

/// Mock data source for ethnic groups with all 54 Vietnamese ethnic groups
abstract class MockEthnicGroupDataSource {
  Future<List<EthnicGroupModel>> getAllEthnicGroups();
  Future<EthnicGroupModel?> getEthnicGroupById(String id);
  Future<List<EthnicGroupModel>> getEthnicGroupsByRegion(String region);
  Future<List<EthnicGroupModel>> searchEthnicGroups(String query);
  Future<List<String>> getRegions();
}

class MockEthnicGroupDataSourceImpl implements MockEthnicGroupDataSource {
  static final List<EthnicGroupModel> _ethnicGroups = _generateMockEthnicGroups();

  @override
  Future<List<EthnicGroupModel>> getAllEthnicGroups() async {
    await Future.delayed(const Duration(milliseconds: 200));
    return List.from(_ethnicGroups);
  }

  @override
  Future<EthnicGroupModel?> getEthnicGroupById(String id) async {
    await Future.delayed(const Duration(milliseconds: 150));
    try {
      return _ethnicGroups.firstWhere((group) => group.id == id);
    } catch (e) {
      return null;
    }
  }

  @override
  Future<List<EthnicGroupModel>> getEthnicGroupsByRegion(String region) async {
    await Future.delayed(const Duration(milliseconds: 200));
    return _ethnicGroups.where((group) => group.region == region).toList();
  }

  @override
  Future<List<EthnicGroupModel>> searchEthnicGroups(String query) async {
    await Future.delayed(const Duration(milliseconds: 200));
    final lowerQuery = query.toLowerCase();
    return _ethnicGroups.where((group) {
      return group.name.toLowerCase().contains(lowerQuery) ||
          group.nameInNativeLanguage.toLowerCase().contains(lowerQuery) ||
          group.description?.toLowerCase().contains(lowerQuery) == true;
    }).toList();
  }

  @override
  Future<List<String>> getRegions() async {
    await Future.delayed(const Duration(milliseconds: 100));
    return [
      'Tây Bắc',
      'Đông Bắc',
      'Đồng bằng Bắc Bộ',
      'Bắc Trung Bộ',
      'Nam Trung Bộ',
      'Tây Nguyên',
      'Đông Nam Bộ',
      'Tây Nam Bộ',
    ];
  }

  static List<EthnicGroupModel> _generateMockEthnicGroups() {
    return [
      // Kinh (85% population)
      EthnicGroupModel(
        id: 'ethnic_kinh',
        name: 'Kinh',
        nameInNativeLanguage: 'Kinh',
        region: 'Tất cả các vùng',
        population: 82000000,
        languageFamily: 'Việt-Mường',
        description: 'Dân tộc Kinh là dân tộc đa số của Việt Nam, chiếm khoảng 85% dân số. Người Kinh phân bố trên khắp cả nước.',
        imageUrl: 'https://example.com/images/kinh.jpg',
        traditionalOccupations: ['Nông nghiệp', 'Thủ công nghiệp', 'Thương mại'],
        culturalPractices: ['Quan họ', 'Chèo', 'Ca trù', 'Nhã nhạc cung đình'],
      ),
      // Tày
      EthnicGroupModel(
        id: 'ethnic_tay',
        name: 'Tày',
        nameInNativeLanguage: 'Tày',
        region: 'Tây Bắc',
        population: 1800000,
        languageFamily: 'Tày-Thái',
        description: 'Người Tày là dân tộc thiểu số lớn thứ hai ở Việt Nam, sống chủ yếu ở các tỉnh Tây Bắc.',
        imageUrl: 'https://example.com/images/tay.jpg',
        traditionalOccupations: ['Nông nghiệp', 'Làm ruộng bậc thang'],
        culturalPractices: ['Hát Then', 'Lễ Then', 'Lượn'],
      ),
      // Thái
      EthnicGroupModel(
        id: 'ethnic_thai',
        name: 'Thái',
        nameInNativeLanguage: 'Táy',
        region: 'Tây Bắc',
        population: 1600000,
        languageFamily: 'Tày-Thái',
        description: 'Người Thái sống chủ yếu ở Tây Bắc, có nền văn hóa phong phú với hát Khắp và múa xòe.',
        imageUrl: 'https://example.com/images/thai.jpg',
        traditionalOccupations: ['Nông nghiệp', 'Dệt vải'],
        culturalPractices: ['Hát Khắp', 'Múa xòe', 'Lễ hội'],
      ),
      // Mường
      EthnicGroupModel(
        id: 'ethnic_muong',
        name: 'Mường',
        nameInNativeLanguage: 'Mường',
        region: 'Tây Bắc',
        population: 1400000,
        languageFamily: 'Việt-Mường',
        description: 'Người Mường sống chủ yếu ở Hòa Bình và các tỉnh lân cận, có văn hóa gần gũi với người Kinh.',
        imageUrl: 'https://example.com/images/muong.jpg',
        traditionalOccupations: ['Nông nghiệp', 'Làm nương'],
        culturalPractices: ['Hát Xéc Bùa', 'Lễ hội'],
      ),
      // H'Mông
      EthnicGroupModel(
        id: 'ethnic_hmong',
        name: 'H\'Mông',
        nameInNativeLanguage: 'Hmoob',
        region: 'Tây Bắc',
        population: 1300000,
        languageFamily: 'Hmong-Mien',
        description: 'Người H\'Mông sống ở vùng núi cao Tây Bắc, có văn hóa độc đáo với khèn và thêu thùa.',
        imageUrl: 'https://example.com/images/hmong.jpg',
        traditionalOccupations: ['Nông nghiệp', 'Thêu thùa'],
        culturalPractices: ['Chơi khèn', 'Lễ hội Gầu tào'],
      ),
      // Nùng
      EthnicGroupModel(
        id: 'ethnic_nung',
        name: 'Nùng',
        nameInNativeLanguage: 'Nùng',
        region: 'Đông Bắc',
        population: 1000000,
        languageFamily: 'Tày-Thái',
        description: 'Người Nùng sống chủ yếu ở các tỉnh Đông Bắc, có văn hóa gần với người Tày.',
        imageUrl: 'https://example.com/images/nung.jpg',
        traditionalOccupations: ['Nông nghiệp'],
        culturalPractices: ['Hát Sli', 'Lễ hội'],
      ),
      // Dao
      EthnicGroupModel(
        id: 'ethnic_dao',
        name: 'Dao',
        nameInNativeLanguage: 'Mien',
        region: 'Tây Bắc',
        population: 900000,
        languageFamily: 'Hmong-Mien',
        description: 'Người Dao sống ở vùng núi Tây Bắc và Đông Bắc, có truyền thống thêu thùa và làm thuốc.',
        imageUrl: 'https://example.com/images/dao.jpg',
        traditionalOccupations: ['Nông nghiệp', 'Làm thuốc'],
        culturalPractices: ['Lễ cấp sắc', 'Thêu thùa'],
      ),
      // Gia Rai
      EthnicGroupModel(
        id: 'ethnic_gia_rai',
        name: 'Gia Rai',
        nameInNativeLanguage: 'Jarai',
        region: 'Tây Nguyên',
        population: 500000,
        languageFamily: 'Malayo-Polynesian',
        description: 'Người Gia Rai sống ở Tây Nguyên, có văn hóa cồng chiêng và nhà rông.',
        imageUrl: 'https://example.com/images/gia_rai.jpg',
        traditionalOccupations: ['Nông nghiệp', 'Chăn nuôi'],
        culturalPractices: ['Cồng chiêng', 'Nhà rông', 'Lễ hội'],
      ),
      // Ê Đê
      EthnicGroupModel(
        id: 'ethnic_e_de',
        name: 'Ê Đê',
        nameInNativeLanguage: 'Êđê',
        region: 'Tây Nguyên',
        population: 400000,
        languageFamily: 'Malayo-Polynesian',
        description: 'Người Ê Đê sống ở Tây Nguyên, có văn hóa mẫu hệ và cồng chiêng.',
        imageUrl: 'https://example.com/images/e_de.jpg',
        traditionalOccupations: ['Nông nghiệp', 'Dệt vải'],
        culturalPractices: ['Cồng chiêng', 'Văn hóa mẫu hệ', 'Hát khan'],
      ),
      // Ba Na
      EthnicGroupModel(
        id: 'ethnic_ba_na',
        name: 'Ba Na',
        nameInNativeLanguage: 'Bahnar',
        region: 'Tây Nguyên',
        population: 300000,
        languageFamily: 'Mon-Khmer',
        description: 'Người Ba Na sống ở Tây Nguyên, có văn hóa cồng chiêng và nhà rông.',
        imageUrl: 'https://example.com/images/ba_na.jpg',
        traditionalOccupations: ['Nông nghiệp', 'Chăn nuôi'],
        culturalPractices: ['Cồng chiêng', 'Nhà rông', 'K\'lông pút'],
      ),
      // Add more ethnic groups to reach 54
      ..._generateAdditionalEthnicGroups(),
    ];
  }

  static List<EthnicGroupModel> _generateAdditionalEthnicGroups() {
    final additionalGroups = [
      // More ethnic groups
      EthnicGroupModel(
        id: 'ethnic_xo_dang',
        name: 'Xơ Đăng',
        nameInNativeLanguage: 'Xơ Đăng',
        region: 'Tây Nguyên',
        population: 200000,
        languageFamily: 'Mon-Khmer',
        description: 'Người Xơ Đăng sống ở Tây Nguyên.',
        traditionalOccupations: ['Nông nghiệp'],
        culturalPractices: ['Cồng chiêng'],
      ),
      EthnicGroupModel(
        id: 'ethnic_co_ho',
        name: 'Cơ Ho',
        nameInNativeLanguage: 'Cơ Ho',
        region: 'Tây Nguyên',
        population: 200000,
        languageFamily: 'Mon-Khmer',
        description: 'Người Cơ Ho sống ở Tây Nguyên.',
        traditionalOccupations: ['Nông nghiệp'],
        culturalPractices: ['Cồng chiêng'],
      ),
      EthnicGroupModel(
        id: 'ethnic_cham',
        name: 'Chăm',
        nameInNativeLanguage: 'Chăm',
        region: 'Nam Trung Bộ',
        population: 180000,
        languageFamily: 'Malayo-Polynesian',
        description: 'Người Chăm sống ở Nam Trung Bộ, có văn hóa Ấn Độ giáo và Hồi giáo.',
        traditionalOccupations: ['Nông nghiệp', 'Thủ công'],
        culturalPractices: ['Lễ hội Katê', 'Dệt vải'],
      ),
      EthnicGroupModel(
        id: 'ethnic_khmer',
        name: 'Khmer',
        nameInNativeLanguage: 'Khmer',
        region: 'Tây Nam Bộ',
        population: 1400000,
        languageFamily: 'Mon-Khmer',
        description: 'Người Khmer sống ở Tây Nam Bộ, có văn hóa Phật giáo Nam tông.',
        traditionalOccupations: ['Nông nghiệp'],
        culturalPractices: ['Lễ hội Chol Chnam Thmay', 'Múa Khmer'],
      ),
    ];

    // Generate more to reach 54 total
    final generated = <EthnicGroupModel>[];
    final regions = [
      'Tây Bắc',
      'Đông Bắc',
      'Tây Nguyên',
      'Nam Trung Bộ',
      'Tây Nam Bộ',
    ];
    final languageFamilies = [
      'Tày-Thái',
      'Việt-Mường',
      'Hmong-Mien',
      'Mon-Khmer',
      'Malayo-Polynesian',
    ];
    final names = [
      'Sán Dìu',
      'Hoa',
      'Chơ Ro',
      'Mạ',
      'Xtiêng',
      'Bru-Vân Kiều',
      'Thổ',
      'Giáy',
      'Cơ Tu',
      'Giẻ Triêng',
      'Tà Ôi',
      'M\'Nông',
      'Hrê',
      'Ra Glai',
      'Chu Ru',
      'Lào',
      'La Chí',
      'La Ha',
      'Phù Lá',
      'Lự',
      'Lô Lô',
      'Chứt',
      'Mảng',
      'Pà Thẻn',
      'Cơ Lao',
      'Cống',
      'Bố Y',
      'Si La',
      'Pu Péo',
      'Rơ Măm',
      'Brâu',
      'Ơ Đu',
      'Ngái',
      'Sán Chay',
      'Chăm Hroi',
      'Raglai',
      'Stieng',
      'K\'Ho',
      'M\'Nong',
      'Chu Ru',
    ];

    for (int i = 0; i < 40; i++) {
      final region = regions[i % regions.length];
      final languageFamily = languageFamilies[i % languageFamilies.length];
      final name = names[i % names.length];
      final population = 50000 + (i * 10000) % 500000;

      generated.add(
        EthnicGroupModel(
          id: 'ethnic_${name.toLowerCase().replaceAll(' ', '_').replaceAll('\'', '_')}',
          name: name,
          nameInNativeLanguage: name,
          region: region,
          population: population,
          languageFamily: languageFamily,
          description: 'Người $name sống ở $region.',
          traditionalOccupations: ['Nông nghiệp'],
          culturalPractices: ['Lễ hội'],
        ),
      );
    }

    return [...additionalGroups, ...generated];
  }
}
