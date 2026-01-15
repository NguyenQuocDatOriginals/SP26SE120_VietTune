#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import numpy as np
from pathlib import Path
from flask import Flask, request, jsonify

import essentia
from essentia.standard import (
    MonoLoader,
    RhythmExtractor2013,
    KeyExtractor,
    Spectrum,
    SpectralPeaks,
    HPCP,
    FrameGenerator,
    SpectralCentroidTime,
    Flux,
)

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 100 * 1024 * 1024  # 100MB

ALLOWED_FORMATS = {"mp3", "wav", "flac", "ogg", "m4a", "aac"}
UPLOAD_FOLDER = "/tmp/uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "essentia-analysis-api"}), 200


@app.route("/analyze", methods=["POST"])
def analyze_audio():
    """
    Trả về:
    - tempo.bpm
    - tonal.key, tonal.scale
    - instruments[]
    - ethnic_group{primary, confidence, all_scores}
    """
    try:
        # 1. Validate file
        if "audio" not in request.files:
            return jsonify({"error": "No audio file provided", "code": "NO_FILE"}), 400

        audio_file = request.files["audio"]

        if audio_file.filename == "":
            return jsonify({"error": "No file selected", "code": "NO_FILENAME"}), 400

        file_ext = Path(audio_file.filename).suffix.lstrip(".").lower()
        if file_ext not in ALLOWED_FORMATS:
            return (
                jsonify(
                    {
                        "error": f"Unsupported format. Allowed: {', '.join(ALLOWED_FORMATS)}",
                        "code": "INVALID_FORMAT",
                    }
                ),
                400,
            )

        # 2. Lưu file tạm
        temp_path = os.path.join(UPLOAD_FOLDER, audio_file.filename)
        audio_file.save(temp_path)

        try:
            # 3. Load audio
            print(f"[ESSENTIA] Loading audio from: {temp_path}")
            audio = MonoLoader(filename=temp_path)()

            # 4. Tempo (BPM) – chỉ lấy giá trị đầu tiên để tránh lỗi unpack
            print("[ESSENTIA] Extracting tempo...")
            rhythm_extractor = RhythmExtractor2013(method="multifeature")
            rhythm_result = rhythm_extractor(audio)
            if isinstance(rhythm_result, (list, tuple)) and len(rhythm_result) > 0:
                bpm = float(rhythm_result[0])
            else:
                bpm = 0.0

            # 5. Key & Scale
            print("[ESSENTIA] Extracting key...")
            key_extractor = KeyExtractor()
            key, scale, key_strength = key_extractor(audio)

            # 6. HPCP (harmonic content)
            print("[ESSENTIA] Extracting HPCP features...")
            spectrum = Spectrum()
            spectral_peaks = SpectralPeaks()
            hpcp_algo = HPCP()

            frame_size = 4096
            hop_size = 2048

            hpcp_frames = []
            for frame in FrameGenerator(
                audio, frameSize=frame_size, hopSize=hop_size
            ):
                spec = spectrum(frame)
                peaks_freqs, peaks_mags = spectral_peaks(spec)
                hpcp_frame = hpcp_algo(peaks_freqs, peaks_mags)
                hpcp_frames.append(hpcp_frame)

            hpcp_mean = (
                np.mean(hpcp_frames, axis=0).tolist() if hpcp_frames else []
            )

            # 7. Instruments (heuristic)
            print("[ESSENTIA] Detecting instruments...")
            instruments = detect_instruments(audio)

            # 8. Ethnic group suggestion
            print("[ESSENTIA] Classifying ethnic group...")
            ethnic_group = classify_ethnic_group(
                instruments, hpcp_mean, key, scale, bpm
            )

            result = {
                "success": True,
                "tempo": {
                    "bpm": bpm,
                },
                "tonal": {
                    "key": key,
                    "scale": scale,
                    "key_strength": float(key_strength),
                    "hpcp_features": hpcp_mean,
                },
                "instruments": instruments,
                "ethnic_group": ethnic_group,
                "filename": audio_file.filename,
            }

            return jsonify(result), 200

        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)

    except Exception as e:
        print(f"[ERROR] {str(e)}")
        return jsonify({"error": str(e), "code": "PROCESSING_ERROR"}), 500


def detect_instruments(audio):
    """
    Heuristic: dùng spectral centroid để đoán nhóm nhạc cụ.
    """
    try:
        spectrum = Spectrum()
        centroid = SpectralCentroidTime()

        frame_size = 2048
        hop_size = 512

        spectral_features = []

        for frame in FrameGenerator(audio, frameSize=frame_size, hopSize=hop_size):
            spec = spectrum(frame)
            cent = centroid(spec)
            spectral_features.append(cent)

        if not spectral_features:
            return []

        mean_centroid = float(np.mean(spectral_features))
        std_centroid = float(np.std(spectral_features))

        instruments = []

        if std_centroid > 1500:
            instruments.append("Ensemble")

        if mean_centroid > 5000:
            instruments.extend(["Strings", "High Percussion"])
        elif 2000 < mean_centroid <= 5000:
            instruments.extend(["Vocals", "Woodwinds", "Mid-range Instruments"])
        else:
            instruments.extend(["Bass", "Low Percussion", "Bass Strings"])

        seen = set()
        unique_instruments = []
        for inst in instruments:
            if inst not in seen:
                unique_instruments.append(inst)
                seen.add(inst)

        return unique_instruments[:5]
    except Exception as e:
        print(f"[ERROR] Instrument detection: {str(e)}")
        return ["Unknown"]


def classify_ethnic_group(instruments, hpcp, key, scale, bpm):
    """
    Gợi ý ethnic group dựa trên:
    - instruments
    - HPCP
    - key/scale
    - tempo
    """
    try:
        ethnic_scores = {}

        instrument_str = " ".join(instruments).lower()

        if any(x in instrument_str for x in ["sitar", "tabla", "sarod", "bansuri"]):
            ethnic_scores["Indian"] = ethnic_scores.get("Indian", 0) + 0.9

        if any(x in instrument_str for x in ["oud", "ney", "daf", "qanun"]):
            ethnic_scores["Arab"] = ethnic_scores.get("Arab", 0) + 0.9

        if any(x in instrument_str for x in ["kora", "talking drum", "djembe", "kpanlogo"]):
            ethnic_scores["African"] = ethnic_scores.get("African", 0) + 0.9

        if any(x in instrument_str for x in ["guitar", "mandolin", "castanets"]):
            ethnic_scores["Spanish"] = ethnic_scores.get("Spanish", 0) + 0.7

        if any(x in instrument_str for x in ["erhu", "pipa", "guzheng"]):
            ethnic_scores["East_Asian"] = ethnic_scores.get("East_Asian", 0) + 0.9

        if hpcp:
            hpcp_array = np.array(hpcp)
            if len(hpcp_array) > 24:
                ethnic_scores["Arab"] = ethnic_scores.get("Arab", 0) + 0.3
                ethnic_scores["Turkish"] = ethnic_scores.get("Turkish", 0) + 0.3

        if 40 <= bpm <= 80:
            ethnic_scores["Classical_Western"] = ethnic_scores.get(
                "Classical_Western", 0
            ) + 0.2
        elif 80 <= bpm <= 120:
            ethnic_scores["Folk"] = ethnic_scores.get("Folk", 0) + 0.2
        elif bpm > 120:
            ethnic_scores["Energetic"] = ethnic_scores.get("Energetic", 0) + 0.2

        if scale == "minor":
            ethnic_scores["Arab"] = ethnic_scores.get("Arab", 0) + 0.1
            ethnic_scores["East_Asian"] = ethnic_scores.get("East_Asian", 0) + 0.1

        if not ethnic_scores:
            return {"primary": "Unclassified", "confidence": 0.0, "all_scores": {}}

        primary_ethnic = max(ethnic_scores, key=ethnic_scores.get)
        confidence = float(min(ethnic_scores[primary_ethnic], 1.0))

        return {
            "primary": primary_ethnic.replace("_", " "),
            "confidence": confidence,
            "all_scores": {k: float(v) for k, v in ethnic_scores.items()},
        }
    except Exception as e:
        print(f"[ERROR] Ethnic classification: {str(e)}")
        return {"primary": "Unclassified", "confidence": 0.0, "all_scores": {}}


if __name__ == "__main__":
    print("[ESSENTIA] Starting Essentia Analysis API...")
    print("[ESSENTIA] Version:", essentia.__version__)
    app.run(host="0.0.0.0", port=5000, debug=False)