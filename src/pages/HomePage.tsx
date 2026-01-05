import { Link } from "react-router-dom";
import { Music, Upload, Search, Users } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Recording } from "@/types";
import { recordingService } from "@/services/recordingService";
import RecordingCard from "@/components/features/RecordingCard";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { addSpotlightEffect } from "@/utils/spotlight";

export default function HomePage() {
  const [popularRecordings, setPopularRecordings] = useState<Recording[]>([]);
  const [recentRecordings, setRecentRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);

  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const popularRef = useRef<HTMLDivElement>(null);
  const recentRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchRecordings();

    // Add spotlight effects
    const cleanupFunctions: (() => void)[] = [];

    if (heroRef.current)
      cleanupFunctions.push(addSpotlightEffect(heroRef.current));
    if (featuresRef.current)
      cleanupFunctions.push(addSpotlightEffect(featuresRef.current));
    if (popularRef.current)
      cleanupFunctions.push(addSpotlightEffect(popularRef.current));
    if (recentRef.current)
      cleanupFunctions.push(addSpotlightEffect(recentRef.current));
    if (ctaRef.current)
      cleanupFunctions.push(addSpotlightEffect(ctaRef.current));

    return () => {
      cleanupFunctions.forEach((cleanup) => cleanup());
    };
  }, []);

  const fetchRecordings = async () => {
    try {
      const [popular, recent] = await Promise.all([
        recordingService.getPopularRecordings(8),
        recordingService.getRecentRecordings(8),
      ]);
      setPopularRecordings(popular.data || []);
      setRecentRecordings(recent.data || []);
    } catch (error) {
      console.error("Error fetching recordings:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            ref={heroRef}
            className="spotlight-container backdrop-blur-xl bg-white/20 rounded-2xl shadow-2xl border border-white/40 p-8"
            style={{
              boxShadow:
                "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
            }}
          >
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                VietTune Archive
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-primary-100">
                Intelligent Vietnamese traditional music documentation system
              </p>
              <p className="text-lg mb-10 max-w-3xl mx-auto">
                Preserving the rich musical heritage of Vietnam's 54 ethnic
                minorities through collaborative documentation, intelligent
                search, and community curation.
              </p>
              <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Link to="/recordings">
                  <button className="btn-liquid-glass-primary flex items-center justify-center gap-2 min-w-[200px]">
                    <Music className="h-5 w-5" />
                    Explore recordings
                  </button>
                </Link>
                <Link to="/upload">
                  <button className="btn-liquid-glass-primary flex items-center justify-center gap-2 min-w-[200px]">
                    <Upload className="h-5 w-5" />
                    Contribute
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            ref={featuresRef}
            className="spotlight-container backdrop-blur-xl bg-white/20 rounded-2xl shadow-2xl border border-white/40 p-8"
            style={{
              boxShadow:
                "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Music className="h-8 w-8 text-primary-700" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">
                  Comprehensive archive
                </h3>
                <p className="text-white">
                  Systematic documentation of traditional music from all 54
                  Vietnamese ethnic minorities
                </p>
              </div>

              <div className="text-center p-6">
                <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-primary-700" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">
                  Intelligent search
                </h3>
                <p className="text-white">
                  Advanced search by ethnicity, instruments, ceremonial context,
                  and musical characteristics
                </p>
              </div>

              <div className="text-center p-6">
                <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-primary-700" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">
                  Community driven
                </h3>
                <p className="text-white">
                  Crowdsourced verification by researchers, master musicians,
                  and cultural experts
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Recordings */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            ref={popularRef}
            className="spotlight-container backdrop-blur-xl bg-white/20 rounded-2xl shadow-2xl border border-white/40 p-8"
            style={{
              boxShadow:
                "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
            }}
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-white">
                Popular recordings
              </h2>
              <Link
                to="/recordings"
                className="text-white hover:text-green-300 transition-colors"
              >
                View all →
              </Link>
            </div>

            {loading ? (
              <LoadingSpinner size="lg" />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {popularRecordings.map((recording) => (
                  <RecordingCard key={recording.id} recording={recording} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Recent Uploads */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            ref={recentRef}
            className="spotlight-container backdrop-blur-xl bg-white/20 rounded-2xl shadow-2xl border border-white/40 p-8"
            style={{
              boxShadow:
                "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
            }}
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-white">Recent uploads</h2>
              <Link
                to="/recordings"
                className="text-white hover:text-green-300 active:text-green-200 transition-colors"
              >
                View all →
              </Link>
            </div>

            {loading ? (
              <LoadingSpinner size="lg" />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {recentRecordings.map((recording) => (
                  <RecordingCard key={recording.id} recording={recording} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-8 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            ref={ctaRef}
            className="spotlight-container backdrop-blur-xl bg-white/20 rounded-2xl shadow-2xl border border-white/40 p-8"
            style={{
              boxShadow:
                "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
            }}
          >
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">
                Help preserve Vietnam's musical heritage
              </h2>
              <p className="text-xl mb-8 text-primary-100">
                Join our community of researchers, musicians, and cultural
                enthusiasts in documenting and preserving traditional Vietnamese
                music for future generations.
              </p>
              <Link to="/register">
                <button className="btn-liquid-glass-primary min-w-[180px]">
                  Get started
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
