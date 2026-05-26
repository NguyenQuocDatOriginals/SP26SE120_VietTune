using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Neo4j.Driver;

namespace VietTuneArchive.Extensions;

public static class Neo4jServiceExtensions
{
    public static IServiceCollection AddNeo4jGraph(this IServiceCollection services, IConfiguration configuration)
    {
        var uri = configuration["Neo4j:Uri"];
        var username = configuration["Neo4j:Username"];
        var password = configuration["Neo4j:Password"];

        // The Driver instance is thread-safe and acts as a connection pool; it must be registered as a Singleton
        var driver = GraphDatabase.Driver(uri, AuthTokens.Basic(username, password));
        services.AddSingleton<IDriver>(driver);

        return services;
    }
}
