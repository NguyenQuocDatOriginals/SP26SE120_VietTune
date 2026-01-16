import 'package:dartz/dartz.dart';
import '../failures/failure.dart';

/// Query parameters for pagination and filtering
class QueryParams {
  final int page;
  final int limit;
  final Map<String, dynamic>? filters;
  final String? sortBy;
  final bool ascending;

  const QueryParams({
    this.page = 1,
    this.limit = 20,
    this.filters,
    this.sortBy,
    this.ascending = true,
  });
}

/// Paginated response wrapper
class PaginatedResponse<T> {
  final List<T> items;
  final int totalCount;
  final int page;
  final int limit;

  PaginatedResponse({
    required this.items,
    required this.totalCount,
    required this.page,
    required this.limit,
  });

  int get totalPages => (totalCount / limit).ceil();

  bool get hasNextPage => page < totalPages;
  bool get hasPreviousPage => page > 1;
}

/// Base repository interface with common CRUD operations
abstract class BaseRepository<T> {
  Future<Either<Failure, T>> getById(String id);
  Future<Either<Failure, PaginatedResponse<T>>> getAll(QueryParams params);
  Future<Either<Failure, T>> create(T entity);
  Future<Either<Failure, T>> update(String id, T entity);
  Future<Either<Failure, void>> delete(String id);
}
