import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/contribution_providers.dart';
import '../../../../domain/entities/enums.dart';
import '../../../../domain/entities/song.dart';
import '../../../shared/widgets/ethnic_group_selector.dart';
import '../../../shared/widgets/instrument_selector.dart';
import '../../../shared/widgets/location_picker.dart';

/// Step 2: Basic Information
class BasicInfoStep extends ConsumerWidget {
  const BasicInfoStep({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final formState = ref.watch(contributionFormProvider);
    final formNotifier = ref.read(contributionFormProvider.notifier);
    final song = formState.songData;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Bước 2: Thông tin cơ bản',
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          const SizedBox(height: 24),
          // Song title
          TextFormField(
            initialValue: song?.title,
            decoration: const InputDecoration(
              labelText: 'Tên bài hát *',
              border: OutlineInputBorder(),
              hintText: 'Nhập tên bài hát',
            ),
            onChanged: (value) => formNotifier.updateTitle(value),
          ),
          const SizedBox(height: 16),
          // Alternative titles
          TextFormField(
            initialValue: song?.alternativeTitles?.join(', '),
            decoration: const InputDecoration(
              labelText: 'Tên khác (tùy chọn)',
              border: OutlineInputBorder(),
              hintText: 'Các tên khác, phân cách bằng dấu phẩy',
            ),
            maxLines: 2,
            onChanged: (value) {
              final alternatives = value.split(',').map((e) => e.trim()).where((e) => e.isNotEmpty).toList();
              if (song != null) {
                final updatedSong = song.copyWith(
                  alternativeTitles: alternatives.isEmpty ? null : alternatives,
                );
                formNotifier.updateSongData(updatedSong);
              }
            },
          ),
          const SizedBox(height: 16),
          // Genre dropdown
          DropdownButtonFormField<MusicGenre>(
            value: song?.genre ?? MusicGenre.folk,
            decoration: const InputDecoration(
              labelText: 'Thể loại *',
              border: OutlineInputBorder(),
            ),
            items: MusicGenre.values.map((genre) {
              return DropdownMenuItem(
                value: genre,
                child: Text(_getGenreText(genre)),
              );
            }).toList(),
            onChanged: (value) {
              if (value != null) {
                formNotifier.updateGenre(value);
              }
            },
          ),
          const SizedBox(height: 24),
          // Ethnic group selector
          const Text(
            'Dân tộc *',
            style: TextStyle(fontWeight: FontWeight.w500),
          ),
          const SizedBox(height: 8),
          EthnicGroupSelector(
            selectedId: song?.ethnicGroupId,
            onSelected: (group) {
              if (group != null) {
                formNotifier.updateEthnicGroup(group.id);
              }
            },
          ),
          const SizedBox(height: 24),
          // Instrument selector
          const Text(
            'Nhạc cụ',
            style: TextStyle(fontWeight: FontWeight.w500),
          ),
          const SizedBox(height: 8),
          SizedBox(
            height: 200,
            child: InstrumentSelector(
              selectedIds: song?.audioMetadata?.instrumentIds ?? [],
              onSelectionChanged: (ids) => formNotifier.updateInstruments(ids),
            ),
          ),
          const SizedBox(height: 24),
          // Location picker
          const Text(
            'Địa điểm',
            style: TextStyle(fontWeight: FontWeight.w500),
          ),
          const SizedBox(height: 8),
          if (song != null)
            LocationPicker(
              initialLocation: song.audioMetadata?.recordingLocation,
              onLocationSelected: (location) {
                final audioMetadata = song.audioMetadata;
                if (audioMetadata != null && song != null) {
                  final updatedMetadata = audioMetadata.copyWith(
                    recordingLocation: location,
                  );
                  final updatedSong = song.copyWith(
                    audioMetadata: updatedMetadata,
                  );
                  formNotifier.updateSongData(updatedSong);
                }
              },
            ),
        ],
      ),
    );
  }

  String _getGenreText(MusicGenre genre) {
    switch (genre) {
      case MusicGenre.folk:
        return 'Dân ca';
      case MusicGenre.ceremonial:
        return 'Nghi lễ';
      case MusicGenre.courtMusic:
        return 'Nhã nhạc';
      case MusicGenre.operatic:
        return 'Tuồng';
      case MusicGenre.contemporary:
        return 'Đương đại';
    }
  }
}
