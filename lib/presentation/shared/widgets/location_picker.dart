import 'package:flutter/material.dart';
import '../../../core/utils/constants.dart';
import '../../../domain/entities/location.dart';

/// Location picker widget for Vietnamese addresses
class LocationPicker extends StatefulWidget {
  final Location? initialLocation;
  final ValueChanged<Location>? onLocationSelected;

  const LocationPicker({
    super.key,
    this.initialLocation,
    this.onLocationSelected,
  });

  @override
  State<LocationPicker> createState() => _LocationPickerState();
}

class _LocationPickerState extends State<LocationPicker> {
  String? _selectedProvince;
  String? _selectedDistrict;
  String? _selectedCommune;
  double? _latitude;
  double? _longitude;

  @override
  void initState() {
    super.initState();
    if (widget.initialLocation != null) {
      _selectedProvince = widget.initialLocation!.province;
      _selectedDistrict = widget.initialLocation!.district;
      _selectedCommune = widget.initialLocation!.commune;
      _latitude = widget.initialLocation!.latitude;
      _longitude = widget.initialLocation!.longitude;
    }
  }

  void _updateLocation() {
    if (_selectedProvince != null) {
      final location = Location(
        latitude: _latitude ?? 0.0,
        longitude: _longitude ?? 0.0,
        province: _selectedProvince,
        district: _selectedDistrict,
        commune: _selectedCommune,
      );
      widget.onLocationSelected?.call(location);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Province dropdown
        DropdownButtonFormField<String>(
          value: _selectedProvince,
          decoration: const InputDecoration(
            labelText: 'Tỉnh/Thành phố',
            border: OutlineInputBorder(),
          ),
          items: VietnameseProvinces.allProvinces
              .map((province) => DropdownMenuItem(
                    value: province,
                    child: Text(province),
                  ))
              .toList(),
          onChanged: (value) {
            setState(() {
              _selectedProvince = value;
              _selectedDistrict = null;
              _selectedCommune = null;
            });
            _updateLocation();
          },
        ),
        const SizedBox(height: 16),
        // District dropdown (placeholder - would need actual data)
        if (_selectedProvince != null)
          TextFormField(
            initialValue: _selectedDistrict,
            decoration: const InputDecoration(
              labelText: 'Quận/Huyện',
              border: OutlineInputBorder(),
            ),
            onChanged: (value) {
              setState(() => _selectedDistrict = value);
              _updateLocation();
            },
          ),
        const SizedBox(height: 16),
        // Commune dropdown (placeholder - would need actual data)
        if (_selectedDistrict != null)
          TextFormField(
            initialValue: _selectedCommune,
            decoration: const InputDecoration(
              labelText: 'Phường/Xã',
              border: OutlineInputBorder(),
            ),
            onChanged: (value) {
              setState(() => _selectedCommune = value);
              _updateLocation();
            },
          ),
        const SizedBox(height: 16),
        // GPS coordinates (optional)
        Row(
          children: [
            Expanded(
              child: TextFormField(
                initialValue: _latitude?.toString(),
                decoration: const InputDecoration(
                  labelText: 'Vĩ độ (Latitude)',
                  border: OutlineInputBorder(),
                ),
                keyboardType: TextInputType.number,
                onChanged: (value) {
                  _latitude = double.tryParse(value);
                  _updateLocation();
                },
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: TextFormField(
                initialValue: _longitude?.toString(),
                decoration: const InputDecoration(
                  labelText: 'Kinh độ (Longitude)',
                  border: OutlineInputBorder(),
                ),
                keyboardType: TextInputType.number,
                onChanged: (value) {
                  _longitude = double.tryParse(value);
                  _updateLocation();
                },
              ),
            ),
          ],
        ),
      ],
    );
  }
}
