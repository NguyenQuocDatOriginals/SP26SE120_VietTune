using System;
using System.Threading.Tasks;
using VietTuneArchive.Domain.Entities;

namespace VietTuneArchive.Application.IServices.IThirdPartyServices
{
    public interface INeo4jSyncService
    {
        Task SyncCreateRecordingAsync(Recording recording);
        Task SyncUpdateRecordingAsync(Recording recording);
        Task SyncDeleteRecordingAsync(Guid recordingId);

        Task SyncCreateInstrumentAsync(Instrument instrument);
        Task SyncUpdateInstrumentAsync(Instrument instrument);
        Task SyncDeleteInstrumentAsync(Guid instrumentId);

        Task SyncCreateEthnicGroupAsync(EthnicGroup ethnicGroup);
        Task SyncUpdateEthnicGroupAsync(EthnicGroup ethnicGroup);
        Task SyncDeleteEthnicGroupAsync(Guid ethnicGroupId);

        Task SyncCreateCeremonyAsync(Ceremony ceremony);
        Task SyncUpdateCeremonyAsync(Ceremony ceremony);
        Task SyncDeleteCeremonyAsync(Guid ceremonyId);

        Task SyncCreateVocalStyleAsync(VocalStyle vocalStyle);
        Task SyncUpdateVocalStyleAsync(VocalStyle vocalStyle);
        Task SyncDeleteVocalStyleAsync(Guid vocalStyleId);

        Task SyncCreateMusicalScaleAsync(MusicalScale musicalScale);
        Task SyncUpdateMusicalScaleAsync(MusicalScale musicalScale);
        Task SyncDeleteMusicalScaleAsync(Guid musicalScaleId);

        Task SyncCreateProvinceAsync(Province province);
        Task SyncUpdateProvinceAsync(Province province);
        Task SyncDeleteProvinceAsync(Guid provinceId);

        Task SyncCreateDistrictAsync(District district);
        Task SyncUpdateDistrictAsync(District district);
        Task SyncDeleteDistrictAsync(Guid districtId);

        Task SyncCreateCommuneAsync(Commune commune);
        Task SyncUpdateCommuneAsync(Commune commune);
        Task SyncDeleteCommuneAsync(Guid communeId);

        Task SyncCreateTagAsync(Tag tag);
        Task SyncUpdateTagAsync(Tag tag);
        Task SyncDeleteTagAsync(Guid tagId);

        Task SyncCreateKBEntryAsync(KBEntry kbEntry);
        Task SyncUpdateKBEntryAsync(KBEntry kbEntry);
        Task SyncDeleteKBEntryAsync(Guid kbEntryId);
    }
}
