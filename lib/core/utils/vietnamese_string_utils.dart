// Vietnamese string utilities (normalize for search: remove diacritics).
// E.g. "Đắk Lắk" -> "Dak Lak" so user can type "Dak Lak" to match.

const String _vietnamese =
    'àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ'
    'ÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴĐ';

const String _ascii =
    'aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyd'
    'AAAAAAAAAAAAAAAAAEEEEEEEEEEEIIIIIOOOOOOOOOOOOOOOOOUUUUUUUUUUUYYYYYD';

/// Returns [s] with Vietnamese diacritics removed (for search matching).
/// E.g. normalizeVietnamese('Đắk Lắk') => 'Dak Lak'.
String normalizeVietnamese(String s) {
  if (s.isEmpty) return s;
  final buffer = StringBuffer();
  for (final rune in s.runes) {
    final char = String.fromCharCode(rune);
    final i = _vietnamese.indexOf(char);
    buffer.write(i >= 0 ? _ascii[i] : char);
  }
  return buffer.toString();
}

/// Returns true if [name] matches [query] (case-insensitive, diacritic-insensitive).
bool vietnameseContains(String name, String query) {
  if (query.isEmpty) return true;
  final n = normalizeVietnamese(name).toLowerCase();
  final q = normalizeVietnamese(query).toLowerCase();
  return n.contains(q);
}
