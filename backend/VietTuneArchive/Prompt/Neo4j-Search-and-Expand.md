# Backend Implementation Guide: Flexible Graph Explorer APIs

This document provides strict instructions for creating a flexible, dynamic API layer to power a frontend Knowledge Graph visualization (e.g., React Force Graph). 

## 🛑 CORE RULE: ADD-ONLY APPROACH
1. **Do Not Modify Existing Code:** Do not alter existing Entity Framework contexts, PostgreSQL repositories, or existing controllers.
2. **Neo4j Focus:** This module relies exclusively on the previously injected `IDriver` for Neo4j.
3. **Target Audience:** These endpoints are for general graph exploration. Apply standard `[Authorize]` (not restricted to Admin) so authenticated users can explore the archive.

---

## 1. Create Data Transfer Objects (DTOs)

Create a new file: `Models/DTOs/GraphExplorerDtos.cs` to standardize the JSON payload for frontend graph libraries.

**Requirements:**
* `GraphNodeDto`: Properties for `Id` (string), `Label` (string - represents the display name), and `Group` (string - represents the Neo4j Label/Category).
* `GraphLinkDto`: Properties for `Source` (string - Node ID), `Target` (string - Node ID), and `Type` (string - Relationship type).
* `GraphResponseDto`: Properties for `Nodes` (List of GraphNodeDto) and `Links` (List of GraphLinkDto).

---

## 2. Create the Explorer Service

Create the interface and implementation to handle dynamic Cypher queries.

**Files:** * `Services/Interfaces/IGraphExplorerService.cs`
* `Services/GraphExplorerService.cs`

### Method 1: `SearchNodesAsync`
**Signature:** `Task<List<GraphNodeDto>> SearchNodesAsync(string keyword, string? label = null)`
**Logic:**
1.  **Anti-Injection validation:** If `label` is provided, validate that it contains only alphanumeric characters (a-zA-Z) before using it in string interpolation.
2.  **Dynamic Cypher:** Construct a query to find nodes matching the keyword in their `Name` or `Title` properties.
    ```cypher
    // Example conceptual Cypher (Implement this safely in C#):
    MATCH (n:{Label})
    WHERE toLower(coalesce(n.Name, n.Title, '')) CONTAINS toLower($keyword)
    RETURN n LIMIT 20
    ```
3.  **Mapping:** Extract the `INode`. Map `Id` to `n["Id"]`, `Label` to `Name` or `Title` (whichever exists), and `Group` to `n.Labels.FirstOrDefault()`.

### Method 2: `ExpandNodeAsync`
**Signature:** `Task<GraphResponseDto> ExpandNodeAsync(string sourceId, string? targetLabel = null, string? relationshipType = null)`
**Logic:**
1.  **Anti-Injection validation:** Validate `targetLabel` and `relationshipType` (alphanumeric only) before interpolation.
2.  **Dynamic Cypher:** Construct a query to find a 1-hop neighborhood around the source node.
    ```cypher
    // Example conceptual Cypher:
    MATCH (source {Id: $id})-[rel:{RelType}]-(target:{TargetLabel})
    RETURN source, rel, target LIMIT 50
    ```
    *Note: The relationship `-[rel]-` must be undirected to capture both incoming and outgoing links.*
3.  **Mapping (Critical):** * Iterate through the records.
    * Maintain a `Dictionary<string, GraphNodeDto>` to ensure nodes are unique.
    * Parse `source` and `target` nodes into the dictionary.
    * Parse `rel` into a `GraphLinkDto`. Determine the correct `Source` and `Target` direction based on `rel.StartNodeId` and `rel.EndNodeId` comparing with the mapped nodes.

---

## 3. Create the API Controller

Create a new controller to expose these services to the frontend.

**File:** `Controllers/GraphExplorerController.cs`
**Route:** `/api/graph-explorer`
**Security:** `[Authorize]` (Standard authentication).

### Endpoints to implement:

* **GET `/api/graph-explorer/search`**
    * **Query Params:** `[FromQuery] string keyword`, `[FromQuery] string? label`
    * **Validation:** Return 400 Bad Request if `keyword` is null or empty.
    * **Action:** Returns `Ok(await _service.SearchNodesAsync(keyword, label))`.

* **GET `/api/graph-explorer/expand`**
    * **Query Params:** `[FromQuery] string sourceId`, `[FromQuery] string? targetLabel`, `[FromQuery] string? relType`
    * **Validation:** Return 400 Bad Request if `sourceId` is null or empty.
    * **Action:** Returns `Ok(await _service.ExpandNodeAsync(sourceId, targetLabel, relType))`.

---
**End of Instructions.** **AI Agent:** Please generate the complete C# code for `GraphExplorerDtos.cs`, `IGraphExplorerService.cs`, `GraphExplorerService.cs`, and `GraphExplorerController.cs` adhering to these dynamic query and architectural rules. Ensure Dependency Injection registration is conceptually noted for `Program.cs`.