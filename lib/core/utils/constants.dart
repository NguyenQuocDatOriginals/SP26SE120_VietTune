/// App-wide constants
class AppConstants {
  // Pagination
  static const int defaultPageSize = 20;
  static const int maxPageSize = 100;
  
  // Audio
  static const int audioBufferDuration = 3; // seconds
  static const double minPlaybackSpeed = 0.5;
  static const double maxPlaybackSpeed = 2.0;
  static const double defaultPlaybackSpeed = 1.0;
  
  // File upload
  static const int maxAudioFileSize = 50 * 1024 * 1024; // 50MB
  static const int maxImageFileSize = 5 * 1024 * 1024; // 5MB
  static const int maxVideoFileSize = 100 * 1024 * 1024; // 100MB (chặn trước khi compress)
  static const List<String> supportedAudioFormats = [
    'mp3',
    'wav',
    'm4a',
    'aac',
    'ogg',
  ];
  static const List<String> supportedImageFormats = [
    'jpg',
    'jpeg',
    'png',
    'webp',
  ];
  static const List<String> supportedVideoFormats = [
    'mp4',
    'mov',
    'avi',
    'mkv',
    'webm',
  ];
  
  // Search
  static const int minSearchQueryLength = 2;
  static const int maxSearchQueryLength = 100;
  static const int searchDebounceMs = 300;
  
  // Cache
  static const int imageCacheMaxSize = 100; // MB
  static const int audioCacheMaxSize = 200; // MB
}

/// Vietnamese administrative divisions
class VietnameseProvinces {
  static const List<String> regions = [
    'Tây Bắc',
    'Đông Bắc',
    'Đồng bằng sông Hồng',
    'Bắc Trung Bộ',
    'Duyên hải Nam Trung Bộ',
    'Tây Nguyên',
    'Đông Nam Bộ',
    'Đồng bằng sông Cửu Long',
  ];

  static const Map<String, List<String>> provincesByRegion = {
    'Tây Bắc': [
      'Điện Biên',
      'Lai Châu',
      'Sơn La',
      'Yên Bái',
      'Hòa Bình',
    ],
    'Đông Bắc': [
      'Hà Giang',
      'Cao Bằng',
      'Bắc Kạn',
      'Tuyên Quang',
      'Lào Cai',
      'Lạng Sơn',
      'Bắc Giang',
      'Phú Thọ',
      'Thái Nguyên',
      'Quảng Ninh',
    ],
    'Đồng bằng sông Hồng': [
      'Hà Nội',
      'Hải Phòng',
      'Hải Dương',
      'Hưng Yên',
      'Hà Nam',
      'Nam Định',
      'Thái Bình',
      'Ninh Bình',
      'Vĩnh Phúc',
      'Bắc Ninh',
    ],
    'Bắc Trung Bộ': [
      'Thanh Hóa',
      'Nghệ An',
      'Hà Tĩnh',
      'Quảng Bình',
      'Quảng Trị',
      'Thừa Thiên Huế',
    ],
    'Duyên hải Nam Trung Bộ': [
      'Đà Nẵng',
      'Quảng Nam',
      'Quảng Ngãi',
      'Bình Định',
      'Phú Yên',
      'Khánh Hòa',
      'Ninh Thuận',
      'Bình Thuận',
    ],
    'Tây Nguyên': [
      'Kon Tum',
      'Gia Lai',
      'Đắk Lắk',
      'Đắk Nông',
      'Lâm Đồng',
    ],
    'Đông Nam Bộ': [
      'Bình Phước',
      'Bình Dương',
      'Đồng Nai',
      'Tây Ninh',
      'Bà Rịa - Vũng Tàu',
      'Thành phố Hồ Chí Minh',
    ],
    'Đồng bằng sông Cửu Long': [
      'Long An',
      'Tiền Giang',
      'Bến Tre',
      'Trà Vinh',
      'Vĩnh Long',
      'Đồng Tháp',
      'An Giang',
      'Kiên Giang',
      'Cà Mau',
      'Bạc Liêu',
      'Sóc Trăng',
      'Hậu Giang',
    ],
  };

  static List<String> get allProvinces {
    return provincesByRegion.values.expand((list) => list).toList();
  }
}

/// Route paths
class AppRoutes {
  // Root
  static const String splash = '/';
  static const String home = '/home';

  // Auth
  static const String authLogin = '/auth/login';
  static const String authRegister = '/auth/register';
  
  // Discovery
  static const String discover = '/discover';
  static const String discoverSong = '/discover/song/:id';
  static const String discoverSearch = '/discover/search';
  static const String discoverInstrument = '/discover/instrument/:id';
  static const String discoverEthnicGroup = '/discover/ethnic-group/:id';
  
  // Contribution
  static const String contribute = '/contribute';
  static const String contributeNew = '/contribute/new';
  static const String contributeSubmissions = '/contribute/submissions';
  static const String contributeSubmission = '/contribute/submission/:id';
  
  // Profile
  static const String profile = '/profile';
  static const String profileFavorites = '/profile/favorites';
  static const String profileSettings = '/profile/settings';
}
