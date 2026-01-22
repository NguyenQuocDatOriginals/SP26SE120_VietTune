/// Province to Ethnic Group Priority Mapping
/// 
/// Maps Vietnamese provinces to priority ethnic groups based on:
/// - Historical presence and population distribution
/// - Cultural significance in the region
/// - Data sources: Vietnam Census 2019, Cultural Heritage documentation
/// 
/// Priority order: Most common → Less common (but still significant)
class ProvinceEthnicMapping {
  /// Map of province name → list of ethnic group IDs (priority order)
  static const Map<String, List<String>> provinceToEthnicGroups = {
    // Tây Bắc
    'Điện Biên': ['ethnic_thai', 'ethnic_hmong', 'ethnic_kho_mu', 'ethnic_khmu'],
    'Lai Châu': ['ethnic_hmong', 'ethnic_thai', 'ethnic_dao', 'ethnic_giay'],
    'Sơn La': ['ethnic_thai', 'ethnic_hmong', 'ethnic_kho_mu', 'ethnic_muong'],
    'Yên Bái': ['ethnic_tay', 'ethnic_dao', 'ethnic_hmong', 'ethnic_nung'],
    'Hòa Bình': ['ethnic_muong', 'ethnic_dao', 'ethnic_tay'],
    
    // Đông Bắc
    'Hà Giang': ['ethnic_hmong', 'ethnic_tay', 'ethnic_dao', 'ethnic_nung', 'ethnic_giay'],
    'Cao Bằng': ['ethnic_tay', 'ethnic_nung', 'ethnic_dao', 'ethnic_hmong'],
    'Bắc Kạn': ['ethnic_tay', 'ethnic_dao', 'ethnic_nung'],
    'Tuyên Quang': ['ethnic_tay', 'ethnic_dao', 'ethnic_san_chay'],
    'Lào Cai': ['ethnic_hmong', 'ethnic_tay', 'ethnic_dao', 'ethnic_giay', 'ethnic_phu_la'],
    'Lạng Sơn': ['ethnic_tay', 'ethnic_nung', 'ethnic_dao'],
    'Bắc Giang': ['ethnic_tay', 'ethnic_nung', 'ethnic_san_chay'],
    'Phú Thọ': ['ethnic_muong', 'ethnic_dao', 'ethnic_tay'],
    'Thái Nguyên': ['ethnic_tay', 'ethnic_nung', 'ethnic_san_chay'],
    'Quảng Ninh': ['ethnic_tay', 'ethnic_dao', 'ethnic_san_diu'],
    
    // Đồng bằng sông Hồng
    'Hà Nội': ['ethnic_kinh', 'ethnic_muong', 'ethnic_dao'],
    'Hải Phòng': ['ethnic_kinh', 'ethnic_dao'],
    'Hải Dương': ['ethnic_kinh', 'ethnic_dao'],
    'Hưng Yên': ['ethnic_kinh'],
    'Hà Nam': ['ethnic_kinh', 'ethnic_muong'],
    'Nam Định': ['ethnic_kinh', 'ethnic_muong'],
    'Thái Bình': ['ethnic_kinh'],
    'Ninh Bình': ['ethnic_kinh', 'ethnic_muong'],
    'Vĩnh Phúc': ['ethnic_kinh', 'ethnic_dao', 'ethnic_san_chay'],
    'Bắc Ninh': ['ethnic_kinh', 'ethnic_dao'],
    
    // Bắc Trung Bộ
    'Thanh Hóa': ['ethnic_kinh', 'ethnic_muong', 'ethnic_thai', 'ethnic_tho'],
    'Nghệ An': ['ethnic_kinh', 'ethnic_thai', 'ethnic_tho', 'ethnic_khmu'],
    'Hà Tĩnh': ['ethnic_kinh', 'ethnic_chut'],
    'Quảng Bình': ['ethnic_kinh', 'ethnic_chut', 'ethnic_bru_van_kiem'],
    'Quảng Trị': ['ethnic_kinh', 'ethnic_bru_van_kiem', 'ethnic_paco', 'ethnic_tau_o'],
    'Thừa Thiên Huế': ['ethnic_kinh', 'ethnic_tau_o', 'ethnic_paco', 'ethnic_co_tu'],
    
    // Duyên hải Nam Trung Bộ
    'Đà Nẵng': ['ethnic_kinh', 'ethnic_co_tu'],
    'Quảng Nam': ['ethnic_kinh', 'ethnic_co_tu', 'ethnic_xo_dang'],
    'Quảng Ngãi': ['ethnic_kinh', 'ethnic_hrê', 'ethnic_co'],
    'Bình Định': ['ethnic_kinh', 'ethnic_ba_na', 'ethnic_cham'],
    'Phú Yên': ['ethnic_kinh', 'ethnic_e_de', 'ethnic_cham'],
    'Khánh Hòa': ['ethnic_kinh', 'ethnic_raglai', 'ethnic_cham'],
    'Ninh Thuận': ['ethnic_kinh', 'ethnic_cham', 'ethnic_raglai'],
    'Bình Thuận': ['ethnic_kinh', 'ethnic_cham', 'ethnic_raglai'],
    
    // Tây Nguyên
    'Kon Tum': ['ethnic_ba_na', 'ethnic_xo_dang', 'ethnic_gia_rai', 'ethnic_e_de'],
    'Gia Lai': ['ethnic_gia_rai', 'ethnic_ba_na', 'ethnic_e_de'],
    'Đắk Lắk': ['ethnic_e_de', 'ethnic_gia_rai', 'ethnic_ba_na'],
    'Đắk Nông': ['ethnic_e_de', 'ethnic_gia_rai', 'ethnic_ba_na'],
    'Lâm Đồng': ['ethnic_co_ho', 'ethnic_cham', 'ethnic_gia_rai'],
    
    // Đông Nam Bộ
    'Bình Phước': ['ethnic_kinh', 'ethnic_stieng', 'ethnic_khmer'],
    'Tây Ninh': ['ethnic_kinh', 'ethnic_khmer', 'ethnic_cham'],
    'Bình Dương': ['ethnic_kinh', 'ethnic_stieng'],
    'Đồng Nai': ['ethnic_kinh', 'ethnic_cham', 'ethnic_cho_ro'],
    'Bà Rịa - Vũng Tàu': ['ethnic_kinh', 'ethnic_chau_ma'],
    'Thành phố Hồ Chí Minh': ['ethnic_kinh', 'ethnic_cham', 'ethnic_khmer', 'ethnic_hoa'],
    
    // Đồng bằng sông Cửu Long
    'Long An': ['ethnic_kinh', 'ethnic_khmer', 'ethnic_hoa'],
    'Tiền Giang': ['ethnic_kinh', 'ethnic_khmer', 'ethnic_hoa'],
    'Bến Tre': ['ethnic_kinh', 'ethnic_khmer'],
    'Trà Vinh': ['ethnic_kinh', 'ethnic_khmer', 'ethnic_hoa'],
    'Vĩnh Long': ['ethnic_kinh', 'ethnic_khmer', 'ethnic_hoa'],
    'Đồng Tháp': ['ethnic_kinh', 'ethnic_khmer', 'ethnic_hoa'],
    'An Giang': ['ethnic_kinh', 'ethnic_khmer', 'ethnic_cham', 'ethnic_hoa'],
    'Kiên Giang': ['ethnic_kinh', 'ethnic_khmer', 'ethnic_hoa'],
    'Cần Thơ': ['ethnic_kinh', 'ethnic_khmer', 'ethnic_hoa'],
    'Hậu Giang': ['ethnic_kinh', 'ethnic_khmer', 'ethnic_hoa'],
    'Sóc Trăng': ['ethnic_kinh', 'ethnic_khmer', 'ethnic_hoa'],
    'Bạc Liêu': ['ethnic_kinh', 'ethnic_khmer', 'ethnic_hoa'],
    'Cà Mau': ['ethnic_kinh', 'ethnic_khmer', 'ethnic_hoa'],
  };
  
  /// Get priority ethnic group IDs for a province
  /// Returns empty list if province not found
  static List<String> getPriorityEthnicGroups(String province) {
    return provinceToEthnicGroups[province] ?? [];
  }
  
  /// Check if a province has mapping data
  static bool hasMapping(String province) {
    return provinceToEthnicGroups.containsKey(province);
  }
  
  /// Get all provinces with mappings
  static List<String> getAllProvinces() {
    return provinceToEthnicGroups.keys.toList()..sort();
  }
}
