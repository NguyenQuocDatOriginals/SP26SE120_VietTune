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

        public async Task<GraphExplorerNodeDetailDto?> GetNodeDetailAsync(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                return null;
            }

            var query = @"
                MATCH (n)
                WHERE n.Id = $id
                OPTIONAL MATCH (n)-[r]-(neighbor)
                WITH n, r, neighbor
                ORDER BY neighbor.Name ASC, neighbor.Title ASC
                WITH n,
                     collect(DISTINCT {
                       relType: type(r),
                       direction: CASE WHEN startNode(r) = n THEN 'OUT' ELSE 'IN' END,
                       neighborId: neighbor.Id,
                       neighborLabel: coalesce(neighbor.Name, neighbor.Title, ''),
                       neighborGroup: labels(neighbor)[0]
                     })[0..20] AS neighbors
                RETURN n, neighbors, COUNT { (n)--() } AS degree";

            await using var session = _neo4jDriver.AsyncSession();
            GraphExplorerNodeDetailDto? detail = null;

            await session.ExecuteReadAsync(async tx =>
            {
                var cursor = await tx.RunAsync(query, new { id });
                if (await cursor.FetchAsync())
                {
                    var record = cursor.Current;
                    var nodeObj = record["n"];
                    if (nodeObj == null || nodeObj is not INode node) return;

                    var properties = new Dictionary<string, object>();
                    foreach (var key in node.Properties.Keys)
                    {
                        properties[key] = node.Properties[key];
                    }

                    var label = "";
                    if (node.Properties.ContainsKey("Name") && node.Properties["Name"] != null)
                    {
                        label = node.Properties["Name"].ToString() ?? "";
                    }
                    else if (node.Properties.ContainsKey("Title") && node.Properties["Title"] != null)
                    {
                        label = node.Properties["Title"].ToString() ?? "";
                    }

                    var group = node.Labels.FirstOrDefault() ?? "";
                    var degree = record["degree"].As<int>();

                    var neighborsList = new List<GraphExplorerNeighborSummaryDto>();
                    var neighborsData = record["neighbors"] as IEnumerable<object>;
                    if (neighborsData != null)
                    {
                        foreach (var item in neighborsData)
                        {
                            if (item is IDictionary<string, object> dict)
                            {
                                var nId = dict.ContainsKey("neighborId") ? dict["neighborId"]?.ToString() ?? "" : "";
                                if (string.IsNullOrEmpty(nId)) continue;

                                neighborsList.Add(new GraphExplorerNeighborSummaryDto
                                {
                                    Id = nId,
                                    Label = dict.ContainsKey("neighborLabel") ? dict["neighborLabel"]?.ToString() ?? "" : "",
                                    Group = dict.ContainsKey("neighborGroup") ? dict["neighborGroup"]?.ToString() ?? "" : "",
                                    RelationType = dict.ContainsKey("relType") ? dict["relType"]?.ToString() ?? "" : "",
                                    Direction = dict.ContainsKey("direction") ? dict["direction"]?.ToString() ?? "" : ""
                                });
                            }
                        }
                    }

                    detail = new GraphExplorerNodeDetailDto
                    {
                        Id = id,
                        Label = label,
                        Group = group,
                        Properties = properties,
                        DegreeCount = degree,
                        Neighbors = neighborsList
                    };
                }
            });

            return detail;
        }

        public async Task<GraphExplorerPathResponseDto> GetShortestPathAsync(string fromId, string toId, int maxDepth)
        {
            var response = new GraphExplorerPathResponseDto();
            if (string.IsNullOrWhiteSpace(fromId) || string.IsNullOrWhiteSpace(toId))
            {
                return response;
            }

            maxDepth = Math.Clamp(maxDepth, 1, 10);

            var query = $@"
                MATCH (from), (to)
                WHERE from.Id = $fromId AND to.Id = $toId
                MATCH path = shortestPath((from)-[*..{maxDepth}]-(to))
                WITH nodes(path) AS pathNodes, relationships(path) AS pathRels
                RETURN [n IN pathNodes | {{id: n.Id, label: coalesce(n.Name, n.Title, ''), group: labels(n)[0]}}] AS nodes,
                       [r IN pathRels | {{source: startNode(r).Id, target: endNode(r).Id, type: type(r)}}] AS links";

            await using var session = _neo4jDriver.AsyncSession();

            await session.ExecuteReadAsync(async tx =>
            {
                var cursor = await tx.RunAsync(query, new { fromId, toId });
                if (await cursor.FetchAsync())
                {
                    var record = cursor.Current;
                    var nodesData = record["nodes"] as IEnumerable<object>;
                    var linksData = record["links"] as IEnumerable<object>;

                    var nodes = new List<GraphNodeDto>();
                    var links = new List<GraphLinkDto>();

                    if (nodesData != null)
                    {
                        foreach (var item in nodesData)
                        {
                            if (item is IDictionary<string, object> dict)
                            {
                                nodes.Add(new GraphNodeDto
                                {
                                    Id = dict.ContainsKey("id") ? dict["id"]?.ToString() ?? "" : "",
                                    Label = dict.ContainsKey("label") ? dict["label"]?.ToString() ?? "" : "",
                                    Group = dict.ContainsKey("group") ? dict["group"]?.ToString() ?? "" : ""
                                });
                            }
                        }
                    }

                    if (linksData != null)
                    {
                        foreach (var item in linksData)
                        {
                            if (item is IDictionary<string, object> dict)
                            {
                                links.Add(new GraphLinkDto
                                {
                                    Source = dict.ContainsKey("source") ? dict["source"]?.ToString() ?? "" : "",
                                    Target = dict.ContainsKey("target") ? dict["target"]?.ToString() ?? "" : "",
                                    Type = dict.ContainsKey("type") ? dict["type"]?.ToString() ?? "" : ""
                                });
                            }
                        }
                    }

                    if (nodes.Count > 0)
                    {
                        response.PathFound = true;
                        response.PathLength = links.Count;
                        response.Nodes = nodes;
                        response.Links = links;
                    }
                }
            });

            return response;
        }

        public async Task<GraphResponseDto> GetOverviewGraphAsync(int maxNodes = 100)
        {
            maxNodes = Math.Clamp(maxNodes, 1, 500);

            var query = @"
                MATCH (n)
                WHERE n.Id IS NOT NULL
                WITH n LIMIT $maxNodes
                OPTIONAL MATCH (n)-[r]-(m)
                WHERE m.Id IS NOT NULL
                RETURN n, r, m";

            await using var session = _neo4jDriver.AsyncSession();
            var nodesDict = new Dictionary<string, GraphNodeDto>();
            var linksList = new List<GraphLinkDto>();
            var internalIdToGuid = new Dictionary<long, string>();

            await session.ExecuteReadAsync(async tx =>
            {
                var cursor = await tx.RunAsync(query, new { maxNodes });
                while (await cursor.FetchAsync())
                {
                    var record = cursor.Current;
                    var nObj = record["n"];
                    if (nObj == null || nObj is not INode nNode) continue;

                    var nGuid = nNode.Properties.ContainsKey("Id") ? nNode.Properties["Id"]?.ToString() ?? "" : "";
                    if (!string.IsNullOrEmpty(nGuid))
                    {
                        internalIdToGuid[nNode.Id] = nGuid;
                        if (!nodesDict.ContainsKey(nGuid))
                        {
                            nodesDict[nGuid] = MapNode(nNode, nGuid);
                        }
                    }

                    var mObj = record["m"];
                    var rObj = record["r"];

                    if (mObj != null && mObj is INode mNode && rObj != null && rObj is IRelationship rel)
                    {
                        var mGuid = mNode.Properties.ContainsKey("Id") ? mNode.Properties["Id"]?.ToString() ?? "" : "";
                        if (!string.IsNullOrEmpty(mGuid))
                        {
                            internalIdToGuid[mNode.Id] = mGuid;
                            if (!nodesDict.ContainsKey(mGuid))
                            {
                                nodesDict[mGuid] = MapNode(mNode, mGuid);
                            }

                            var linkSource = internalIdToGuid.ContainsKey(rel.StartNodeId) ? internalIdToGuid[rel.StartNodeId] : nGuid;
                            var linkTarget = internalIdToGuid.ContainsKey(rel.EndNodeId) ? internalIdToGuid[rel.EndNodeId] : mGuid;

                            linksList.Add(new GraphLinkDto
                            {
                                Source = linkSource,
                                Target = linkTarget,
                                Type = rel.Type
                            });
                        }
                    }
                }
            });

            var links = linksList
                .GroupBy(l => $"{l.Source}-{l.Target}-{l.Type}")
                .Select(g => g.First())
                .ToList();

            return new GraphResponseDto
            {
                Nodes = nodesDict.Values.ToList(),
                Links = links
            };
        }

        public async Task<GraphResponseDto> GetRelationshipGraphAsync(string sourceType, string targetType, int limit = 100)
        {
            if (string.IsNullOrEmpty(sourceType) || !Regex.IsMatch(sourceType, "^[a-zA-Z0-9]+$"))
            {
                throw new ArgumentException("Invalid source type format.");
            }
            if (string.IsNullOrEmpty(targetType) || !Regex.IsMatch(targetType, "^[a-zA-Z0-9]+$"))
            {
                throw new ArgumentException("Invalid target type format.");
            }

            limit = Math.Clamp(limit, 1, 500);

            var query = $@"
                MATCH (s:{sourceType})-[r]-(t:{targetType})
                WHERE s.Id IS NOT NULL AND t.Id IS NOT NULL
                RETURN s, r, t
                LIMIT $limit";

            await using var session = _neo4jDriver.AsyncSession();
            var nodesDict = new Dictionary<string, GraphNodeDto>();
            var linksList = new List<GraphLinkDto>();
            var internalIdToGuid = new Dictionary<long, string>();

            await session.ExecuteReadAsync(async tx =>
            {
                var cursor = await tx.RunAsync(query, new { limit });
                while (await cursor.FetchAsync())
                {
                    var record = cursor.Current;
                    var sNode = record["s"].As<INode>();
                    var tNode = record["t"].As<INode>();
                    var rel = record["r"].As<IRelationship>();

                    var sGuid = sNode.Properties.ContainsKey("Id") ? sNode.Properties["Id"]?.ToString() ?? "" : "";
                    var tGuid = tNode.Properties.ContainsKey("Id") ? tNode.Properties["Id"]?.ToString() ?? "" : "";

                    if (!string.IsNullOrEmpty(sGuid))
                    {
                        internalIdToGuid[sNode.Id] = sGuid;
                        if (!nodesDict.ContainsKey(sGuid))
                        {
                            nodesDict[sGuid] = MapNode(sNode, sGuid);
                        }
                    }

                    if (!string.IsNullOrEmpty(tGuid))
                    {
                        internalIdToGuid[tNode.Id] = tGuid;
                        if (!nodesDict.ContainsKey(tGuid))
                        {
                            nodesDict[tGuid] = MapNode(tNode, tGuid);
                        }
                    }

                    var linkSource = internalIdToGuid.ContainsKey(rel.StartNodeId) ? internalIdToGuid[rel.StartNodeId] : sGuid;
                    var linkTarget = internalIdToGuid.ContainsKey(rel.EndNodeId) ? internalIdToGuid[rel.EndNodeId] : tGuid;

                    linksList.Add(new GraphLinkDto
                    {
                        Source = linkSource,
                        Target = linkTarget,
                        Type = rel.Type
                    });
                }
            });

            var links = linksList
                .GroupBy(l => $"{l.Source}-{l.Target}-{l.Type}")
                .Select(g => g.First())
                .ToList();

            return new GraphResponseDto
            {
                Nodes = nodesDict.Values.ToList(),
                Links = links
            };
        }

        public async Task<TopConnectedNodesResponseDto> GetTopConnectedNodesAsync(string? group, int limit)
        {
            limit = Math.Clamp(limit, 1, 100);

            var query = @"
                MATCH (n)
                WHERE ($group IS NULL OR $group IN labels(n)) AND n.Id IS NOT NULL
                RETURN 
                  n.Id AS id,
                  coalesce(n.Name, n.Title, '') AS label,
                  coalesce(labels(n)[0], '') AS group,
                  COUNT { (n)--() } AS degreeCount
                ORDER BY degreeCount DESC
                LIMIT $limit";

            await using var session = _neo4jDriver.AsyncSession();
            var rankList = new List<ConnectedNodeRankDto>();

            await session.ExecuteReadAsync(async tx =>
            {
                var cursor = await tx.RunAsync(query, new { group = string.IsNullOrEmpty(group) ? null : group, limit });
                while (await cursor.FetchAsync())
                {
                    var record = cursor.Current;
                    rankList.Add(new ConnectedNodeRankDto
                    {
                        Id = record["id"]?.ToString() ?? "",
                        Label = record["label"]?.ToString() ?? "",
                        Group = record["group"]?.ToString() ?? "",
                        DegreeCount = record["degreeCount"].As<int>()
                    });
                }
            });

            return new TopConnectedNodesResponseDto
            {
                Group = group,
                Limit = limit,
                RankList = rankList
            };
        }

        public async Task<MultiShortestPathResponseDto> GetMultiShortestPathAsync(List<string> nodeIds, int maxDepth)
        {
            maxDepth = Math.Clamp(maxDepth, 1, 10);

            // 1. Generate all unique pairs (i, j) with i < j
            var pairs = nodeIds
                .SelectMany((fromId, i) => nodeIds
                    .Skip(i + 1)
                    .Select(toId => new Dictionary<string, string>
                    {
                        ["fromId"] = fromId,
                        ["toId"]   = toId
                    }))
                .ToList();

            var query = $@"
                UNWIND $pairs AS pair
                MATCH (from), (to)
                WHERE from.Id = pair.fromId AND to.Id = pair.toId
                OPTIONAL MATCH path = shortestPath((from)-[*..{maxDepth}]-(to))
                RETURN
                  pair.fromId AS fromId,
                  pair.toId   AS toId,
                  path IS NOT NULL AS pathFound,
                  CASE WHEN path IS NOT NULL THEN length(path) ELSE null END AS pathLength,
                  CASE WHEN path IS NOT NULL
                       THEN [n IN nodes(path) | {{ id: n.Id, label: coalesce(n.Name, n.Title, ''), group: labels(n)[0] }}]
                       ELSE []
                  END AS nodes,
                  CASE WHEN path IS NOT NULL
                       THEN [r IN relationships(path) | {{ source: startNode(r).Id, target: endNode(r).Id, type: type(r) }}]
                       ELSE []
                  END AS links";

            await using var session = _neo4jDriver.AsyncSession();
            var pairPaths = new List<PairPathResultDto>();

            await session.ExecuteReadAsync(async tx =>
            {
                var cursor = await tx.RunAsync(query, new { pairs });
                while (await cursor.FetchAsync())
                {
                    var record = cursor.Current;
                    var fromId = record["fromId"]?.ToString() ?? "";
                    var toId = record["toId"]?.ToString() ?? "";
                    var pathFound = record["pathFound"].As<bool>();
                    int? pathLength = null;
                    if (pathFound && record["pathLength"] != null)
                    {
                        pathLength = record["pathLength"].As<int>();
                    }

                    var nodesData = record["nodes"] as IEnumerable<object>;
                    var linksData = record["links"] as IEnumerable<object>;

                    var nodes = new List<GraphNodeDto>();
                    var links = new List<GraphLinkDto>();

                    if (nodesData != null)
                    {
                        foreach (var item in nodesData)
                        {
                            if (item is IDictionary<string, object> dict)
                            {
                                nodes.Add(new GraphNodeDto
                                {
                                    Id = dict.ContainsKey("id") ? dict["id"]?.ToString() ?? "" : "",
                                    Label = dict.ContainsKey("label") ? dict["label"]?.ToString() ?? "" : "",
                                    Group = dict.ContainsKey("group") ? dict["group"]?.ToString() ?? "" : ""
                                });
                            }
                        }
                    }

                    if (linksData != null)
                    {
                        foreach (var item in linksData)
                        {
                            if (item is IDictionary<string, object> dict)
                            {
                                links.Add(new GraphLinkDto
                                {
                                    Source = dict.ContainsKey("source") ? dict["source"]?.ToString() ?? "" : "",
                                    Target = dict.ContainsKey("target") ? dict["target"]?.ToString() ?? "" : "",
                                    Type = dict.ContainsKey("type") ? dict["type"]?.ToString() ?? "" : ""
                                });
                            }
                        }
                    }

                    pairPaths.Add(new PairPathResultDto
                    {
                        FromId = fromId,
                        ToId = toId,
                        PathFound = pathFound,
                        PathLength = pathLength,
                        Nodes = nodes,
                        Links = links
                    });
                }
            });

            return new MultiShortestPathResponseDto
            {
                Pairs = pairPaths
            };
        }

        public async Task<CommonPointsResponseDto> GetCommonPointsAsync(string nodeId1, string nodeId2, int maxDepth)
        {
            maxDepth = Math.Clamp(maxDepth, 1, 3);

            var response = new CommonPointsResponseDto
            {
                NodeId1 = nodeId1,
                NodeId2 = nodeId2,
                MaxDepth = maxDepth,
                CommonNodesCount = 0
            };

            var startNodesQuery = @"
                MATCH (n)
                WHERE n.Id IN [$nodeId1, $nodeId2]
                RETURN n.Id AS id, coalesce(n.Name, n.Title, '') AS label, labels(n)[0] AS group";

            var startNodesDict = new Dictionary<string, GraphNodeDto>();

            await using var session = _neo4jDriver.AsyncSession();

            await session.ExecuteReadAsync(async tx =>
            {
                var cursor = await tx.RunAsync(startNodesQuery, new { nodeId1, nodeId2 });
                while (await cursor.FetchAsync())
                {
                    var record = cursor.Current;
                    var id = record["id"]?.ToString() ?? "";
                    if (!string.IsNullOrEmpty(id))
                    {
                        startNodesDict[id] = new GraphNodeDto
                        {
                            Id = id,
                            Label = record["label"]?.ToString() ?? "",
                            Group = record["group"]?.ToString() ?? ""
                        };
                    }
                }
            });

            if (!startNodesDict.ContainsKey(nodeId1) || !startNodesDict.ContainsKey(nodeId2))
            {
                return response;
            }

            var commonQuery = $@"
                MATCH (a), (b)
                WHERE a.Id = $nodeId1 AND b.Id = $nodeId2
                MATCH p1 = shortestPath((a)-[*..{maxDepth}]-(c))
                MATCH p2 = shortestPath((b)-[*..{maxDepth}]-(c))
                WHERE c <> a AND c <> b
                RETURN 
                  c.Id AS commonNodeId,
                  [n IN nodes(p1) + nodes(p2) | {{ id: n.Id, label: coalesce(n.Name, n.Title, ''), group: labels(n)[0] }}] AS pathNodes,
                  [r IN relationships(p1) + relationships(p2) | {{ source: startNode(r).Id, target: endNode(r).Id, type: type(r) }}] AS pathLinks";

            var nodesDict = new Dictionary<string, GraphNodeDto>();
            var linksDict = new Dictionary<string, GraphLinkDto>();
            var commonNodeIds = new HashSet<string>();

            foreach (var kvp in startNodesDict)
            {
                nodesDict[kvp.Key] = kvp.Value;
            }

            await session.ExecuteReadAsync(async tx =>
            {
                var cursor = await tx.RunAsync(commonQuery, new { nodeId1, nodeId2 });
                while (await cursor.FetchAsync())
                {
                    var record = cursor.Current;
                    var commonNodeId = record["commonNodeId"]?.ToString();
                    if (!string.IsNullOrEmpty(commonNodeId))
                    {
                        commonNodeIds.Add(commonNodeId);
                    }

                    var pathNodes = record["pathNodes"] as IEnumerable<object>;
                    var pathLinks = record["pathLinks"] as IEnumerable<object>;

                    if (pathNodes != null)
                    {
                        foreach (var item in pathNodes)
                        {
                            if (item is IDictionary<string, object> dict)
                            {
                                var id = dict.ContainsKey("id") ? dict["id"]?.ToString() ?? "" : "";
                                if (!string.IsNullOrEmpty(id) && !nodesDict.ContainsKey(id))
                                {
                                    nodesDict[id] = new GraphNodeDto
                                    {
                                        Id = id,
                                        Label = dict.ContainsKey("label") ? dict["label"]?.ToString() ?? "" : "",
                                        Group = dict.ContainsKey("group") ? dict["group"]?.ToString() ?? "" : ""
                                    };
                                }
                            }
                        }
                    }

                    if (pathLinks != null)
                    {
                        foreach (var item in pathLinks)
                        {
                            if (item is IDictionary<string, object> dict)
                            {
                                var source = dict.ContainsKey("source") ? dict["source"]?.ToString() ?? "" : "";
                                var target = dict.ContainsKey("target") ? dict["target"]?.ToString() ?? "" : "";
                                var type = dict.ContainsKey("type") ? dict["type"]?.ToString() ?? "" : "";
                                var key = $"{source}-{target}-{type}";
                                if (!string.IsNullOrEmpty(source) && !string.IsNullOrEmpty(target) && !linksDict.ContainsKey(key))
                                {
                                    linksDict[key] = new GraphLinkDto
                                    {
                                        Source = source,
                                        Target = target,
                                        Type = type
                                    };
                                }
                            }
                        }
                    }
                }
            });

            response.CommonNodesCount = commonNodeIds.Count;
            response.Nodes = nodesDict.Values.ToList();
            response.Links = linksDict.Values.ToList();

            return response;
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
