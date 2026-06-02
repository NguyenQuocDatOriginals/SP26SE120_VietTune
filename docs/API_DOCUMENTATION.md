# API Documentation: Recording Search by Multiple Filters

## Overview
Ngo�i endpoint `search-by-filter` hi?n t?i (l?c theo m?t ID cho m?i field), gi? ?�y c� m?t endpoint m?i `search-by-filter-multi` cho ph�p t�m ki?m v?i **nhi?u ID cho m?i field**.

---

## API Endpoints

### 1. Search by Single Filter (Existing)
**Endpoint:** `GET /api/recording/search-by-filter`

**Purpose:** T�m ki?m recordings v?i m?t gi� tr? duy nh?t cho m?i field.

**Query Parameters:**
```
GET /api/recording/search-by-filter?ethnicGroupId=xxx&instrumentId=yyy&page=1&pageSize=10&sortOrder=desc
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| ethnicGroupId | Guid? | No | ID c?a m?t ethnic group |
| instrumentId | Guid? | No | ID c?a m?t instrument |
| ceremonyId | Guid? | No | ID c?a m?t ceremony |
| regionCode | string? | No | Code c?a m?t region |
| communeId | Guid? | No | ID c?a m?t commune |
| page | int | No | Trang (m?c ??nh: 1) |
| pageSize | int | No | S? records tr�n trang (m?c ??nh: 10) |
| sortOrder | string? | No | "asc" ho?c "desc" (m?c ??nh: "desc") |

**Response:**
```json
{
  "isSuccess": true,
  "data": {
    "data": [
      {
        "id": "guid",
        "title": "string",
        ...
      }
    ],
    "total": 25
  },
  "message": "Found 25 recordings, returned 10"
}
```

---

### 2. Search by Multiple Filters (New)
**Endpoint:** `POST /api/recording/search-by-filter-multi`

**Purpose:** T�m ki?m recordings v?i **nhi?u ID/gi� tr? cho m?i field**. 

Khi FE g?i nhi?u IDs cho m?t field, API s? tr? v? t?t c? recordings kh?p v?i **�t nh?t m?t gi� tr?** trong m?i field (OR logic trong c�ng field, AND logic gi?a c�c fields).

**Request Body:**
```json
{
  "ethnicGroupIds": ["guid1", "guid2"],
  "instrumentIds": ["guid3", "guid4"],
  "ceremonyIds": ["guid5"],
  "regionCodes": ["code1", "code2"],
  "communeIds": ["guid6"],
  "page": 1,
  "pageSize": 10,
  "sortOrder": "desc"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| ethnicGroupIds | List<Guid> | No | Danh s�ch ethnic group IDs (OR logic) |
| instrumentIds | List<Guid> | No | Danh s�ch instrument IDs (OR logic) |
| ceremonyIds | List<Guid> | No | Danh s�ch ceremony IDs (OR logic) |
| regionCodes | List<string> | No | Danh s�ch region codes (OR logic) |
| communeIds | List<Guid> | No | Danh s�ch commune IDs (OR logic) |
| page | int | No | Trang (m?c ??nh: 1) |
| pageSize | int | No | S? records tr�n trang (m?c ??nh: 10) |
| sortOrder | string? | No | "asc" ho?c "desc" (m?c ??nh: "desc") |

**Response:**
```json
{
  "isSuccess": true,
  "data": {
    "data": [
      {
        "id": "guid",
        "title": "string",
        ...
      }
    ],
    "total": 150
  },
  "message": "Found 150 recordings, returned 10"
}
```

---

## Examples

### Example 1: T�m recordings theo nhi?u ethnic groups
```bash
curl -X POST https://viettunearchiveapi-fufkgcayeydnhdeq.japanwest-01.azurewebsites.net/api/Recording/search-by-filter-multi \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "ethnicGroupIds": ["50e1c2d4-9b0a-4f3e-8c2a-1e5f3d8a9b0c", "60f2d3e5-0c1b-5a4f-9d3b-2f6g4e9c0d1d"],
    "page": 1,
    "pageSize": 20,
    "sortOrder": "desc"
  }'
```
**K?t qu?:** Tr? v? t?t c? recordings thu?c ethnic group 1 HO?C ethnic group 2, s?p x?p theo th?i gian m?i nh?t.

### Example 2: T�m recordings theo nhi?u instruments v� nhi?u regions
```bash
curl -X POST https://viettunearchiveapi-fufkgcayeydnhdeq.japanwest-01.azurewebsites.net/api/Recording/search-by-filter-multi \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "instrumentIds": ["70g3e4f6-1d2c-6b5a-ae4c-3g7h5f0d1e2e", "80h4f5g7-2e3d-7c6b-bf5d-4h8i6g1e2f3f"],
    "regionCodes": ["N", "S"],
    "page": 1,
    "pageSize": 20,
    "sortOrder": "asc"
  }'
```
**K?t qu?:** Tr? v? t?t c? recordings s? d?ng instrument 1 HO?C instrument 2 AND t?a l?c trong region "N" HO?C region "S", s?p x?p theo th?i gian c? nh?t.

### Example 3: T�m recordings theo multiple filters (combination)
```bash
curl -X POST https://viettunearchiveapi-fufkgcayeydnhdeq.japanwest-01.azurewebsites.net/api/Recording/search-by-filter-multi \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "ethnicGroupIds": ["50e1c2d4-9b0a-4f3e-8c2a-1e5f3d8a9b0c"],
    "ceremonyIds": ["90i5g6h8-3f4e-8d7c-cg6e-5i9j7h2f3g4g", "a0j6h7i9-4g5f-9e8d-dh7f-6j0k8i3g4h5h"],
    "page": 2,
    "pageSize": 15,
    "sortOrder": "desc"
  }'
```
**K?t qu?:** Tr? v? t?t c? recordings c?a ethnic group 1 AND (ceremony 1 HO?C ceremony 2), trang 2 v?i 15 records tr�n trang.

---

## Filter Logic

### Trong c�ng m?t field: **OR logic**
- N?u g?i `"instrumentIds": ["A", "B"]`, s? l?y recordings c� instrument A **HO?C** instrument B

### Gi?a c�c fields: **AND logic**
- N?u g?i `"ethnicGroupIds": ["X"]` **AND** `"ceremonyIds": ["Y", "Z"]`:
  - S? l?y recordings c?a ethnic group X **AND** (ceremony Y **HO?C** ceremony Z)

### Empty lists: **B? qua filter**
- N?u list r?ng ho?c kh�ng g?i field ?�, filter ?� s? kh�ng ???c �p d?ng

### Guid.Empty values: **T? ??ng lo?i b?**
- C�c gi� tr? `Guid.Empty` v� empty strings s? ???c t? ??ng l?c ra tr??c khi x? l�

---

## Code Structure

### DTO Classes
**File:** `VietTuneArchive.Application/Mapper/DTOs/RecordingFilterDto.cs`
- `RecordingFilterDto`: DTO cho single filter search (existing)
- `RecordingFilterMultiDto`: DTO m?i cho multiple filter search

### Repository Method
**File:** `VietTuneArchive.Domain/Repositories/RecordingRepository.cs`
- `SearchByFilterMultiAsync()`: X? l� logic query v?i danh s�ch IDs

### Service Method
**File:** `VietTuneArchive.Application/Services/RecordingService.cs`
- `SearchByFilterMultiAsync()`: G?i repository v� map k?t qu?
- `SearchByFilterMultiApprovedAsync()`: Variant ch? l?y approved recordings

### Controller Endpoint
**File:** `VietTuneArchive.API/Controllers/RecordingController.cs`
- `[HttpPost("search-by-filter-multi")]`: Endpoint m?i

---

## Notes

1. **Pagination:** C? hai endpoint ??u h? tr? ph�n trang v?i `page` v� `pageSize` (max: 100)
2. **Sorting:** S?p x?p theo `CreatedAt` field
3. **Status Filter:** T? ??ng ch? l?y recordings c� status Approved ho?c Embargoed
4. **Performance:** T?t c? relationships (Commune, EthnicGroup, Ceremony, RecordingInstruments) ???c eager-loaded
5. **Validation:** Pagination parameters t? ??ng validate (page >= 1, pageSize <= 100)
