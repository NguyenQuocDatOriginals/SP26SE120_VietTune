import '../data/province_ethnic_mapping.dart';
import '../../domain/entities/ethnic_group.dart';

/// Service for suggesting ethnic groups based on province
/// 
/// Uses rule-based mapping to prioritize ethnic groups that are
/// most common in a given province.
class EthnicGroupSuggestionService {
  /// Get suggested ethnic group IDs for a province
  /// Returns priority-ordered list (most common first)
  List<String> getSuggestedGroupIds(String? province) {
    if (province == null || province.isEmpty) {
      return [];
    }
    return ProvinceEthnicMapping.getPriorityEthnicGroups(province);
  }
  
  /// Sort ethnic groups: Priority first, then alphabetical
  /// 
  /// Priority groups are those suggested for the given province.
  /// Non-priority groups are sorted alphabetically by name.
  List<EthnicGroup> sortGroupsByPriority(
    List<EthnicGroup> allGroups,
    String? province,
  ) {
    if (province == null || province.isEmpty) {
      // No province: sort alphabetically
      final sorted = List<EthnicGroup>.from(allGroups);
      sorted.sort((a, b) => a.name.compareTo(b.name));
      return sorted;
    }
    
    final priorityIds = getSuggestedGroupIds(province);
    if (priorityIds.isEmpty) {
      // No mapping: sort alphabetically
      final sorted = List<EthnicGroup>.from(allGroups);
      sorted.sort((a, b) => a.name.compareTo(b.name));
      return sorted;
    }
    
    // Separate priority and non-priority groups
    final priorityGroups = <EthnicGroup>[];
    final nonPriorityGroups = <EthnicGroup>[];
    
    for (final group in allGroups) {
      if (priorityIds.contains(group.id)) {
        priorityGroups.add(group);
      } else {
        nonPriorityGroups.add(group);
      }
    }
    
    // Sort priority groups by their order in priorityIds
    priorityGroups.sort((a, b) {
      final indexA = priorityIds.indexOf(a.id);
      final indexB = priorityIds.indexOf(b.id);
      return indexA.compareTo(indexB);
    });
    
    // Sort non-priority groups alphabetically
    nonPriorityGroups.sort((a, b) => a.name.compareTo(b.name));
    
    // Combine: priority first, then non-priority
    return [...priorityGroups, ...nonPriorityGroups];
  }
  
  /// Get only priority groups (suggested groups)
  List<EthnicGroup> getPriorityGroups(
    List<EthnicGroup> allGroups,
    String? province,
  ) {
    if (province == null || province.isEmpty) {
      return [];
    }
    
    final priorityIds = getSuggestedGroupIds(province);
    if (priorityIds.isEmpty) {
      return [];
    }
    
    final priorityGroups = allGroups
        .where((group) => priorityIds.contains(group.id))
        .toList();
    
    // Sort by priority order
    priorityGroups.sort((a, b) {
      final indexA = priorityIds.indexOf(a.id);
      final indexB = priorityIds.indexOf(b.id);
      return indexA.compareTo(indexB);
    });
    
    return priorityGroups;
  }
}
