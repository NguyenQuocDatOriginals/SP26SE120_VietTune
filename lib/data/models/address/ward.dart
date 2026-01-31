/// Ward (Phường/Xã/Thị trấn) model for Vietnamese administrative data.
class Ward {
  final String code;
  final String name;
  final String districtCode;

  const Ward({
    required this.code,
    required this.name,
    required this.districtCode,
  });

  factory Ward.fromJson(Map<String, dynamic> json, {String? districtCode}) {
    return Ward(
      code: json['code'] as String,
      name: json['name'] as String,
      districtCode: districtCode ?? json['district_code'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() =>
      {'code': code, 'name': name, 'district_code': districtCode};
}
