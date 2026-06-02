/**
 * Neo4j GraphExplorer REST payloads (`Application.DTOs`).
 * @see backend/VietTuneArchive.Application/DTOs/GraphExplorerDtos.cs
 */

export interface GraphExplorerNodeDto {
  id: string;
  label: string;
  group: string;
}

export interface GraphExplorerLinkDto {
  source: string;
  target: string;
  type: string;
}

export interface GraphExplorerResponseDto {
  nodes: GraphExplorerNodeDto[];
  links: GraphExplorerLinkDto[];
}
