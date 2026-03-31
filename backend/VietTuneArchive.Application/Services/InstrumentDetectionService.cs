using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.ML.OnnxRuntime;
using Microsoft.ML.OnnxRuntime.Tensors;
using NAudio.Wave;
using NAudio.Wave.SampleProviders;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using VietTuneArchive.Application.IServices;
using VietTuneArchive.Application.Mapper.DTOs;

namespace VietTuneArchive.Application.Services
{
    public class InstrumentDetectionService : IInstrumentDetectionService
    {
        private const int TargetSampleRate = 16000;
        private const int ChunkSamples = 48000; // 3 seconds * 16000

        private readonly InferenceSession _session;
        private readonly string[] _classNames;
        private readonly ILogger<InstrumentDetectionService> _logger;

        public InstrumentDetectionService(ILogger<InstrumentDetectionService> logger, IWebHostEnvironment env)
        {
            _logger = logger;

            try
            {
                string modelPath = Path.Combine(env.ContentRootPath, "Models", "AI", "instrument_detector_full.onnx");
                string classesPath = Path.Combine(env.ContentRootPath, "Models", "AI", "class_names.txt");

                if (!File.Exists(modelPath))
                {
                    _logger.LogWarning("ONNX model file not found at {modelPath}. Detection will fail.", modelPath);
                }

                if (!File.Exists(classesPath))
                {
                    _logger.LogWarning("Class names file not found at {classesPath}. Detection will fail.", classesPath);
                    _classNames = Array.Empty<string>();
                }
                else
                {
                    _classNames = File.ReadAllLines(classesPath)
                        .Where(line => !string.IsNullOrWhiteSpace(line))
                        .Select(line => line.Trim())
                        .ToArray();
                    _logger.LogInformation("Loaded {count} classes for instrument detection.", _classNames.Length);
                }

                if (File.Exists(modelPath))
                {
                    var sessionOptions = new SessionOptions();
                    sessionOptions.GraphOptimizationLevel = GraphOptimizationLevel.ORT_ENABLE_ALL;
                    _session = new InferenceSession(modelPath, sessionOptions);
                    _logger.LogInformation("ONNX InferenceSession initialized successfully.");
                }
                else
                {
                    _session = null!;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error initializing InstrumentDetectionService");
                // Don't throw here to allow app to start even if AI fails, 
                // but throw later when Detect is called.
                _session = null!;
                _classNames = Array.Empty<string>();
            }
        }

        public string[] SupportedInstruments => _classNames;

        public async Task<InstrumentDetectionResponse> DetectInstrumentAsync(Stream audioStream, string fileName)
        {
            if (_session == null)
            {
                throw new InvalidOperationException("ONNX InferenceSession is not initialized. Check logs for model loading errors.");
            }

            if (_classNames == null || _classNames.Length == 0)
            {
                 throw new InvalidOperationException("Class names are not loaded. Check logs for file loading errors.");
            }

            try
            {
                float[] waveform = await LoadAndResampleAudioAsync(audioStream, fileName);
                List<float[]> chunks = SplitIntoChunks(waveform);

                List<float[]> allPredictions = new();
                foreach (var chunk in chunks)
                {
                    allPredictions.Add(RunInference(chunk));
                }

                float[] avgScores = AggregatePredictions(allPredictions);

                // Argmax
                int predictedIndex = 0;
                float maxScore = -1f;
                for (int i = 0; i < avgScores.Length; i++)
                {
                    if (avgScores[i] > maxScore)
                    {
                        maxScore = avgScores[i];
                        predictedIndex = i;
                    }
                }

                var response = new InstrumentDetectionResponse
                {
                    PredictedInstrument = predictedIndex < _classNames.Length ? _classNames[predictedIndex] : "Unknown",
                    Confidence = maxScore,
                    ChunksAnalyzed = chunks.Count,
                    AudioDurationSeconds = (float)waveform.Length / TargetSampleRate,
                    AllScores = avgScores.Select((score, index) => new ClassScoreDto
                    {
                        ClassName = index < _classNames.Length ? _classNames[index] : $"Index_{index}",
                        Score = score
                    }).OrderByDescending(s => s.Score).ToList()
                };

                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during instrument detection for file {fileName}", fileName);
                throw;
            }
        }

        private async Task<float[]> LoadAndResampleAudioAsync(Stream audioStream, string fileName)
        {
            // NAudio needs seekable stream for most thin
            using var ms = new MemoryStream();
            await audioStream.CopyToAsync(ms);
            ms.Position = 0;

            string extension = Path.GetExtension(fileName).ToLower();
            WaveStream reader = extension switch
            {
                ".wav" => new WaveFileReader(ms),
                ".mp3" => new Mp3FileReader(ms),
                _ => throw new NotSupportedException($"Audio format {extension} is not supported.")
            };

            using (reader)
            {
                var outFormat = new WaveFormat(TargetSampleRate, 16, 1);
                using (var resampler = new MediaFoundationResampler(reader, outFormat))
                {
                    resampler.ResamplerQuality = 60;
                    
                    // Convert to float array
                    var byteBuffer = new byte[TargetSampleRate * 2 * 10]; // 10 second buffer
                    using var resultStream = new MemoryStream();
                    
                    int read;
                    while ((read = resampler.Read(byteBuffer, 0, byteBuffer.Length)) > 0)
                    {
                        resultStream.Write(byteBuffer, 0, read);
                    }

                    byte[] finalBytes = resultStream.ToArray();
                    float[] waveform = new float[finalBytes.Length / 2];
                    for (int i = 0; i < waveform.Length; i++)
                    {
                        waveform[i] = BitConverter.ToInt16(finalBytes, i * 2) / 32768f;
                    }
                    return waveform;
                }
            }
        }

        private List<float[]> SplitIntoChunks(float[] waveform)
        {
            List<float[]> chunks = new();
            int numChunks = (int)Math.Ceiling((double)waveform.Length / ChunkSamples);
            if (numChunks == 0) numChunks = 1;

            for (int i = 0; i < numChunks; i++)
            {
                float[] chunk = new float[ChunkSamples];
                int offset = i * ChunkSamples;
                int count = Math.Min(ChunkSamples, waveform.Length - offset);
                
                if (count > 0)
                {
                    Array.Copy(waveform, offset, chunk, 0, count);
                }
                // remaining is zero-padded by default in new float[]
                chunks.Add(chunk);
            }

            return chunks;
        }

        private float[] RunInference(float[] audioChunk)
        {
            var tensor = new DenseTensor<float>(audioChunk, new[] { ChunkSamples });
            string inputName = _session.InputMetadata.Keys.First();
            
            var inputs = new List<NamedOnnxValue>
            {
                NamedOnnxValue.CreateFromTensor(inputName, tensor)
            };

            using var results = _session.Run(inputs);
            return results.First().AsEnumerable<float>().ToArray();
        }

        private float[] AggregatePredictions(List<float[]> allPredictions)
        {
            if (allPredictions.Count == 0) return Array.Empty<float>();
            
            int numClasses = allPredictions[0].Length;
            float[] avgScores = new float[numClasses];

            foreach (var prediction in allPredictions)
            {
                for (int i = 0; i < Math.Min(numClasses, prediction.Length); i++)
                {
                    avgScores[i] += prediction[i];
                }
            }

            for (int i = 0; i < numClasses; i++)
            {
                avgScores[i] /= allPredictions.Count;
            }

            return avgScores;
        }

        public void Dispose()
        {
            _session?.Dispose();
        }
    }
}
