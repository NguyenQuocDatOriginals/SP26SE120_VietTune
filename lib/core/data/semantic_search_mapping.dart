import '../../domain/entities/enums.dart';
import '../utils/constants.dart';

// Semantic Search Phase 1: Từ điển synonym theo Map (Facet Type → Key → Synonym List).
// Match dùng normalizeVietnamese() + longest-first (Phase 2).

/// ContextType → list synonym tiếng Việt (ưu tiên cụm dài khi match).
const Map<ContextType, List<String>> contextTypeSynonyms = {
  ContextType.wedding: ['đám cưới', 'hôn lễ', 'vu quy', 'cưới hỏi', 'cưới'],
  ContextType.funeral: ['đám tang', 'tang lễ', 'tang'],
  ContextType.festival: ['lễ hội', 'hội', 'lễ'],
  ContextType.religious: ['tôn giáo', 'nghi lễ tôn giáo', 'tế lễ'],
  ContextType.entertainment: ['giải trí', 'biểu diễn', 'vui chơi'],
  ContextType.work: ['lao động', 'làm việc', 'công việc'],
  ContextType.lullaby: ['ru con', 'hát ru', 'ru'],
};

/// MusicGenre → list synonym tiếng Việt.
const Map<MusicGenre, List<String>> musicGenreSynonyms = {
  MusicGenre.folk: ['dân ca', 'hát ví', 'dân gian', 'dân ca dân gian'],
  MusicGenre.ceremonial: ['nghi lễ', 'nhạc lễ', 'lễ nghi'],
  MusicGenre.courtMusic: ['nhã nhạc', 'cung đình', 'triều đình'],
  MusicGenre.operatic: ['tuồng', 'hát tuồng', 'tuồng cổ'],
  MusicGenre.contemporary: ['đương đại', 'hiện đại', 'đương đại Việt Nam'],
};

/// Province name (chuẩn) → list synonym. Key = tên tỉnh dùng cho search params; value = từ khóa match (tên + alias).
/// Có thể bổ sung "miền Bắc" → một tỉnh đại diện sau (Phase 2).
Map<String, List<String>> get provinceNameToSynonyms {
  final map = <String, List<String>>{};
  for (final name in VietnameseProvinces.allProvinces) {
    map[name] = [name];
  }
  return map;
}

/// EthnicGroup id → list synonym (tên + alias). Key = ethnicGroupId từ GetEthnicGroups.
/// Phase 1: placeholder; Phase 2 có thể merge với danh sách từ API (name + alias → id).
const Map<String, List<String>> ethnicGroupSynonyms = {
  // Ví dụ (id giả; thay bằng id thật từ API khi tích hợp):
  // 'tay_id': ['người tày', 'dân tộc tày', 'tày'],
  // 'thai_id': ['người thái', 'dân tộc thái', 'thái'],
};

/// Instrument id → list synonym. Key = instrumentId từ GetInstruments.
/// Phase 1: empty; Phase 2 bổ sung từ API.
const Map<String, List<String>> instrumentSynonyms = {};
