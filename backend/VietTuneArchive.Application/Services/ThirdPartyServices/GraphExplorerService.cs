using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Neo4j.Driver;
using VietTuneArchive.Application.DTOs;
using VietTuneArchive.Application.IServices.IThirdPartyServices;

namespace VietTuneArchive.Application.Services.ThirdPartyServices
{
    public class GraphExplorerService : IGraphExplorerService
    {
        private readonly IDriver _neo4jDriver;

        public GraphExplorerService(IDriver neo4jDriver)
        {
            _neo4jDriver = neo4jDriver;
        }

        public async Task<List<GraphNodeDto>> SearchNodesAsync(string keyword, string? label = null)
        {
            if (string.IsNullOrWhiteSpace(keyword))
            {
                return new List<GraphNodeDto>();
            }

            // Anti-Injection validation for label
            if (!string.IsNullOrEmpty(label) && !Regex.IsMatch(label, "^[a-zA-Z0-9]+$"))
            {
                throw new ArgumentException("Invalid label format. Only alphanumeric characters are allowed.");
            }

            var queryLabel = string.IsNullOrEmpty(label) ? "" : $":{label}";
            var query = $"MATCH (n{queryLabel}) WHERE toLower(coalesce(n.Name, n.Title, '')) CONTAINS toLower($keyword) RETURN n LIMIT 20";

            await using var session = _neo4jDriver.AsyncSession();
            var resultList = new List<GraphNodeDto>();

            await session.ExecuteReadAsync(async tx =>
            {
                var cursor = await tx.RunAsync(query, new { keyword });
                while (await cursor.FetchAsync())
                {
                    var node = cursor.Current["n"].As<INode>();
                    var guid = node.Properties.ContainsKey("Id") ? node.Properties["Id"]?.ToString() ?? "" : "";
                    resultList.Add(MapNode(node, guid));
                }
            });

            return resultList;
        }

        public async Task<GraphResponseDto> ExpandNodeAsync(string sourceId, string? targetLabel = null, string? relationshipType = null)
        {
            if (string.IsNullOrWhiteSpace(sourceId))
            {
                return new GraphResponseDto();
            }

            // Anti-Injection validation
            if (!string.IsNullOrEmpty(targetLabel) && !Regex.IsMatch(targetLabel, "^[a-zA-Z0-9]+$"))
            {
                throw new ArgumentException("Invalid target label format. Only alphanumeric characters are allowed.");
            }

            if (!string.IsNullOrEmpty(relationshipType) && !Regex.IsMatch(relationshipType, "^[a-zA-Z0-9_]+$"))
            {
                throw new ArgumentException("Invalid relationship type format. Only alphanumeric characters and underscores are allowed.");
            }

            var relPattern = string.IsNullOrEmpty(relationshipType) ? "rel" : $"rel:{relationshipType}";
            var targetPattern = string.IsNullOrEmpty(targetLabel) ? "target" : $"target:{targetLabel}";
            var query = $"MATCH (source {{Id: $id}})-[{relPattern}]-({targetPattern}) RETURN source, rel, target LIMIT 50";

            await using var session = _neo4jDriver.AsyncSession();
            var nodesDict = new Dictionary<string, GraphNodeDto>();
            var linksList = new List<GraphLinkDto>();
            var internalIdToGuid = new Dictionary<long, string>();

            await session.ExecuteReadAsync(async tx =>
            {
                var cursor = await tx.RunAsync(query, new { id = sourceId });
                while (await cursor.FetchAsync())
                {
                    var sourceNode = cursor.Current["source"].As<INode>();
                    var targetNode = cursor.Current["target"].As<INode>();
                    var rel = cursor.Current["rel"].As<IRelationship>();

                    var sourceGuid = sourceNode.Properties.ContainsKey("Id") ? sourceNode.Properties["Id"]?.ToString() ?? "" : "";
                    var targetGuid = targetNode.Properties.ContainsKey("Id") ? targetNode.Properties["Id"]?.ToString() ?? "" : "";

                    if (!string.IsNullOrEmpty(sourceGuid))
                    {
                        internalIdToGuid[sourceNode.Id] = sourceGuid;
                        if (!nodesDict.ContainsKey(sourceGuid))
                        {
                            nodesDict[sourceGuid] = MapNode(sourceNode, sourceGuid);
                        }
                    }

                    if (!string.IsNullOrEmpty(targetGuid))
                    {
                        internalIdToGuid[targetNode.Id] = targetGuid;
                        if (!nodesDict.ContainsKey(targetGuid))
                        {
                            nodesDict[targetGuid] = MapNode(targetNode, targetGuid);
                        }
                    }

                    // Map relationship direction based on start/end node ID
                    var linkSource = internalIdToGuid.ContainsKey(rel.StartNodeId) ? internalIdToGuid[rel.StartNodeId] : sourceGuid;
                    var linkTarget = internalIdToGuid.ContainsKey(rel.EndNodeId) ? internalIdToGuid[rel.EndNodeId] : targetGuid;

                    linksList.Add(new GraphLinkDto
                    {
                        Source = linkSource,
                        Target = linkTarget,
                        Type = rel.Type
                    });
                }
            });

            return new GraphResponseDto
            {
                Nodes = nodesDict.Values.ToList(),
                Links = linksList
            };
        }

        private GraphNodeDto MapNode(INode node, string guid)
        {
            var properties = node.Properties;
            var nodeLabel = "";
            if (properties.ContainsKey("Name") && properties["Name"] != null)
            {
                nodeLabel = properties["Name"].ToString() ?? "";
            }
            else if (properties.ContainsKey("Title") && properties["Title"] != null)
            {
                nodeLabel = properties["Title"].ToString() ?? "";
            }

            var group = node.Labels.FirstOrDefault() ?? "";

            return new GraphNodeDto
            {
                Id = guid,
                Label = nodeLabel,
                Group = group
            };
        }
    }
}
