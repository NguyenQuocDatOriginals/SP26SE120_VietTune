using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using VietTuneArchive.Domain.Entities;
using VietTuneArchive.Application.IServices.IThirdPartyServices;

namespace VietTuneArchive.Extensions
{
    public class Neo4jSyncInterceptor : SaveChangesInterceptor
    {
        private readonly IServiceProvider _serviceProvider;

        public Neo4jSyncInterceptor(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        public override async ValueTask<int> SavedChangesAsync(
            SaveChangesCompletedEventData eventData,
            int result,
            CancellationToken cancellationToken = default)
        {
            if (eventData.Context == null) return result;

            var entries = eventData.Context.ChangeTracker.Entries()
                .Where(e => e.State == EntityState.Added || e.State == EntityState.Modified || e.State == EntityState.Deleted)
                .ToList();

            if (!entries.Any()) return result;

            // Resolve scoped sync service safely in a scope
            using var scope = _serviceProvider.CreateScope();
            var neo4jSync = scope.ServiceProvider.GetRequiredService<INeo4jSyncService>();
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<Neo4jSyncInterceptor>>();

            foreach (var entry in entries)
            {
                try
                {
                    if (entry.Entity is Recording recording)
                    {
                        switch (entry.State)
                        {
                            case EntityState.Added:
                                await neo4jSync.SyncCreateRecordingAsync(recording);
                                break;
                            case EntityState.Modified:
                                await neo4jSync.SyncUpdateRecordingAsync(recording);
                                break;
                            case EntityState.Deleted:
                                await neo4jSync.SyncDeleteRecordingAsync(recording.Id);
                                break;
                        }
                    }
                    else if (entry.Entity is Instrument instrument)
                    {
                        switch (entry.State)
                        {
                            case EntityState.Added:
                                await neo4jSync.SyncCreateInstrumentAsync(instrument);
                                break;
                            case EntityState.Modified:
                                await neo4jSync.SyncUpdateInstrumentAsync(instrument);
                                break;
                            case EntityState.Deleted:
                                await neo4jSync.SyncDeleteInstrumentAsync(instrument.Id);
                                break;
                        }
                    }
                    else if (entry.Entity is EthnicGroup ethnicGroup)
                    {
                        switch (entry.State)
                        {
                            case EntityState.Added:
                                await neo4jSync.SyncCreateEthnicGroupAsync(ethnicGroup);
                                break;
                            case EntityState.Modified:
                                await neo4jSync.SyncUpdateEthnicGroupAsync(ethnicGroup);
                                break;
                            case EntityState.Deleted:
                                await neo4jSync.SyncDeleteEthnicGroupAsync(ethnicGroup.Id);
                                break;
                        }
                    }
                    else if (entry.Entity is Ceremony ceremony)
                    {
                        switch (entry.State)
                        {
                            case EntityState.Added:
                                await neo4jSync.SyncCreateCeremonyAsync(ceremony);
                                break;
                            case EntityState.Modified:
                                await neo4jSync.SyncUpdateCeremonyAsync(ceremony);
                                break;
                            case EntityState.Deleted:
                                await neo4jSync.SyncDeleteCeremonyAsync(ceremony.Id);
                                break;
                        }
                    }
                    else if (entry.Entity is VocalStyle vocalStyle)
                    {
                        switch (entry.State)
                        {
                            case EntityState.Added:
                                await neo4jSync.SyncCreateVocalStyleAsync(vocalStyle);
                                break;
                            case EntityState.Modified:
                                await neo4jSync.SyncUpdateVocalStyleAsync(vocalStyle);
                                break;
                            case EntityState.Deleted:
                                await neo4jSync.SyncDeleteVocalStyleAsync(vocalStyle.Id);
                                break;
                        }
                    }
                    else if (entry.Entity is MusicalScale musicalScale)
                    {
                        switch (entry.State)
                        {
                            case EntityState.Added:
                                await neo4jSync.SyncCreateMusicalScaleAsync(musicalScale);
                                break;
                            case EntityState.Modified:
                                await neo4jSync.SyncUpdateMusicalScaleAsync(musicalScale);
                                break;
                            case EntityState.Deleted:
                                await neo4jSync.SyncDeleteMusicalScaleAsync(musicalScale.Id);
                                break;
                        }
                    }
                    else if (entry.Entity is Province province)
                    {
                        switch (entry.State)
                        {
                            case EntityState.Added:
                                await neo4jSync.SyncCreateProvinceAsync(province);
                                break;
                            case EntityState.Modified:
                                await neo4jSync.SyncUpdateProvinceAsync(province);
                                break;
                            case EntityState.Deleted:
                                await neo4jSync.SyncDeleteProvinceAsync(province.Id);
                                break;
                        }
                    }
                    else if (entry.Entity is District district)
                    {
                        switch (entry.State)
                        {
                            case EntityState.Added:
                                await neo4jSync.SyncCreateDistrictAsync(district);
                                break;
                            case EntityState.Modified:
                                await neo4jSync.SyncUpdateDistrictAsync(district);
                                break;
                            case EntityState.Deleted:
                                await neo4jSync.SyncDeleteDistrictAsync(district.Id);
                                break;
                        }
                    }
                    else if (entry.Entity is Commune commune)
                    {
                        switch (entry.State)
                        {
                            case EntityState.Added:
                                await neo4jSync.SyncCreateCommuneAsync(commune);
                                break;
                            case EntityState.Modified:
                                await neo4jSync.SyncUpdateCommuneAsync(commune);
                                break;
                            case EntityState.Deleted:
                                await neo4jSync.SyncDeleteCommuneAsync(commune.Id);
                                break;
                        }
                    }
                    else if (entry.Entity is Tag tag)
                    {
                        switch (entry.State)
                        {
                            case EntityState.Added:
                                await neo4jSync.SyncCreateTagAsync(tag);
                                break;
                            case EntityState.Modified:
                                await neo4jSync.SyncUpdateTagAsync(tag);
                                break;
                            case EntityState.Deleted:
                                await neo4jSync.SyncDeleteTagAsync(tag.Id);
                                break;
                        }
                    }
                    else if (entry.Entity is KBEntry kbEntry)
                    {
                        switch (entry.State)
                        {
                            case EntityState.Added:
                                await neo4jSync.SyncCreateKBEntryAsync(kbEntry);
                                break;
                            case EntityState.Modified:
                                await neo4jSync.SyncUpdateKBEntryAsync(kbEntry);
                                break;
                            case EntityState.Deleted:
                                await neo4jSync.SyncDeleteKBEntryAsync(kbEntry.Id);
                                break;
                        }
                    }
                }
                catch (Exception ex)
                {
                    // Fail-safe: Isolate Neo4j errors to never fail standard DB operations
                    logger.LogError(ex, $"[Neo4j Sync Interceptor Error] Failed to sync entity {entry.Entity.GetType().Name} ({entry.State}) to Neo4j.");
                }
            }

            return result;
        }
    }
}
