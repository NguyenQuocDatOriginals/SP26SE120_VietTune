/// Province (Tỉnh/Thành phố) model for Vietnamese administrative data.
/// Name is normalized (e.g. "Thành phố Hồ Chí Minh" not "TP. HCM") for GPS tagging.
class Province {
  final String code;
  final String name;

  const Province({required this.code, required this.name});

  factory Province.fromJson(Map<String, dynamic> json) {
    return Province(
      code: json['code'] as String,
      name: json['name'] as String,
    );
  }

  Map<String, dynamic> toJson() => {'code': code, 'name': name};
}
