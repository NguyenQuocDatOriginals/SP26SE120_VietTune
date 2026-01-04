import { Link } from "react-router-dom";
import { Music, Upload, Search, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Recording } from "@/types";
import { recordingService } from "@/services/recordingService";
import RecordingCard from "@/components/features/RecordingCard";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Button from "@/components/common/Button";

export default function HomePage() {
  const [popularRecordings, setPopularRecordings] = useState<Recording[]>([]);
  const [recentRecordings, setRecentRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecordings();
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
      <section className="bg-gradient-to-r from-amber-800 to-emerald-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              VietTune Archive
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              Intelligent Vietnamese Traditional Music Documentation System
            </p>
            <p className="text-lg mb-10 max-w-3xl mx-auto">
              Preserving the rich musical heritage of Vietnam's 54 ethnic
              minorities through collaborative documentation, intelligent
              search, and community curation.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to="/recordings">
                <Button
                  size="lg"
                  className="bg-emerald-700 text-white hover:bg-green-800 transition-all duration-300 hover:scale-105"
                >
                  <Music className="h-5 w-5 mr-2" />
                  Explore Recordings
                </Button>
              </Link>
              <Link to="/upload">
                <Button
                  size="lg"
                  className="bg-emerald-700 text-white hover:bg-green-800 transition-all duration-300 hover:scale-105"
                >
                  <Upload className="h-5 w-5 mr-2" />
                  Contribute
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Music className="h-8 w-8 text-primary-700" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Comprehensive Archive
              </h3>
              <p className="text-secondary-600">
                Systematic documentation of traditional music from all 54
                Vietnamese ethnic minorities
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-primary-700" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Intelligent Search</h3>
              <p className="text-secondary-600">
                Advanced search by ethnicity, instruments, ceremonial context,
                and musical characteristics
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary-700" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Community Driven</h3>
              <p className="text-secondary-600">
                Crowdsourced verification by researchers, master musicians, and
                cultural experts
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Recordings */}
      <section className="py-16 bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-secondary-900">
              Popular Recordings
            </h2>
            <Link
              to="/recordings"
              className="text-primary-700 hover:text-primary-800"
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
      </section>

      {/* Recent Uploads */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-secondary-900">
              Recent Uploads
            </h2>
            <Link
              to="/recordings"
              className="text-primary-700 hover:text-primary-800"
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
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-primary-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Help Preserve Vietnam's Musical Heritage
          </h2>
          <p className="text-xl mb-8 text-primary-100">
            Join our community of researchers, musicians, and cultural
            enthusiasts in documenting and preserving traditional Vietnamese
            music for future generations.
          </p>
          <Link to="/register">
            <Button
              size="lg"
              className="bg-emerald-700 text-white hover:bg-green-800 px-8 transition-all duration-300 hover:scale-105"
            >
              Get Started
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
