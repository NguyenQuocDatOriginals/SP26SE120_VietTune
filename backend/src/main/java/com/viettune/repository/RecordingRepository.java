package com.viettune.repository;

import com.viettune.entity.Recording;
import com.viettune.enums.RecordingType;
import com.viettune.enums.Region;
import com.viettune.enums.VerificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecordingRepository extends JpaRepository<Recording, Long> {
       List<Recording> findByUploaderId(Long uploaderId);

       List<Recording> findByRecordingType(RecordingType recordingType);

       List<Recording> findByRegion(Region region);

       List<Recording> findByVerificationStatus(VerificationStatus status);

       List<Recording> findByEthnicityId(Long ethnicityId);

       @Query("SELECT r FROM Recording r WHERE " +
                     "(:type IS NULL OR r.recordingType = :type) AND " +
                     "(:region IS NULL OR r.region = :region) AND " +
                     "(:ethnicityId IS NULL OR r.ethnicity.id = :ethnicityId) AND " +
                     "(:status IS NULL OR r.verificationStatus = :status)")
       List<Recording> findByFilters(@Param("type") RecordingType type,
                     @Param("region") Region region,
                     @Param("ethnicityId") Long ethnicityId,
                     @Param("status") VerificationStatus status);

       @Query("SELECT r FROM Recording r WHERE " +
                     "LOWER(r.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                     "LOWER(r.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
       List<Recording> searchByKeyword(@Param("keyword") String keyword);

       @Query("SELECT r FROM Recording r ORDER BY r.createdAt DESC")
       List<Recording> findRecentRecordings();

       @Query("SELECT r FROM Recording r ORDER BY r.playCount DESC, r.likeCount DESC")
       List<Recording> findPopularRecordings();
}
