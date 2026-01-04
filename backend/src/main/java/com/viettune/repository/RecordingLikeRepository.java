package com.viettune.repository;

import com.viettune.entity.RecordingLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RecordingLikeRepository extends JpaRepository<RecordingLike, Long> {
    Optional<RecordingLike> findByUserIdAndRecordingId(Long userId, Long recordingId);
    List<RecordingLike> findByUserId(Long userId);
    List<RecordingLike> findByRecordingId(Long recordingId);
    boolean existsByUserIdAndRecordingId(Long userId, Long recordingId);
    void deleteByUserIdAndRecordingId(Long userId, Long recordingId);
}
