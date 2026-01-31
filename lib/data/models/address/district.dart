/// District (Quận/Huyện/Thị xã) model for Vietnamese administrative data.
class District {
  final String code;
  final String name;
  final String provinceCode;

  const District({
    required this.code,
    required this.name,
    required this.provinceCode,
  });

  factory District.fromJson(Map<String, dynamic> json, {String? provinceCode}) {
    return District(
      code: json['code'] as String,
      name: json['name'] as String,
      provinceCode: provinceCode ?? json['province_code'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() =>
      {'code': code, 'name': name, 'province_code': provinceCode};
}
