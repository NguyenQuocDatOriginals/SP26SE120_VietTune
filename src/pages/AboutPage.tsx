import { Target, Users, Heart } from "lucide-react";
import { useEffect, useRef } from "react";
import { addSpotlightEffect } from "@/utils/spotlight";

export default function AboutPage() {
  const missionRef = useRef<HTMLDivElement>(null);
  const differenceRef = useRef<HTMLDivElement>(null);
  const communityRef = useRef<HTMLDivElement>(null);
  const purposeRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cleanupFunctions: (() => void)[] = [];
    if (missionRef.current)
      cleanupFunctions.push(addSpotlightEffect(missionRef.current));
    if (differenceRef.current)
      cleanupFunctions.push(addSpotlightEffect(differenceRef.current));
    if (communityRef.current)
      cleanupFunctions.push(addSpotlightEffect(communityRef.current));
    if (purposeRef.current)
      cleanupFunctions.push(addSpotlightEffect(purposeRef.current));
    if (featuresRef.current)
      cleanupFunctions.push(addSpotlightEffect(featuresRef.current));
    return () => cleanupFunctions.forEach((cleanup) => cleanup());
  }, []);

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">
          About VietTune Archive
        </h1>

        <div className="prose max-w-none">
          <div
            ref={missionRef}
            className="spotlight-container backdrop-blur-xl bg-white/20 rounded-2xl shadow-2xl border border-white/40 p-8 mb-8"
            style={{
              boxShadow:
                "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
            }}
          >
            <h2 className="text-2xl font-semibold mb-4 text-white">
              Our mission
            </h2>
            <p className="text-white leading-relaxed mb-4">
              Vietnam's 54 ethnic minorities possess rich musical traditions
              passed down orally through generations. Many elderly master
              musicians hold irreplaceable knowledge about rare instruments,
              performance techniques, ceremonial songs, and regional variations.
              Unfortunately, systematic documentation efforts remain minimal -
              most recordings exist as scattered cassette tapes in provincial
              cultural centers, untranscribed and inaccessible to researchers or
              younger generations.
            </p>
            <p className="text-white leading-relaxed">
              VietTune Archive addresses the urgent need for a specialized
              crowdsourced documentation platform before this intangible
              cultural heritage disappears. We provide intelligent search
              capabilities and collaborative curation tools needed to build
              comprehensive, verified collections.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div
              ref={differenceRef}
              className="spotlight-container backdrop-blur-xl bg-white/20 rounded-2xl shadow-2xl border border-white/40 p-6"
              style={{
                boxShadow:
                  "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
              }}
            >
              <div className="bg-primary-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">
                What makes us different?
              </h3>
              <p className="text-white">
                Unlike commercial music platforms focused on entertainment,
                traditional music requires specialized metadata capturing
                ethnomusicological details: tuning systems, modal structures,
                ritual contexts, instrument construction methods, and regional
                dialectal variations in lyrics.
              </p>
            </div>

            <div
              ref={communityRef}
              className="spotlight-container backdrop-blur-xl bg-white/20 rounded-2xl shadow-2xl border border-white/40 p-6"
              style={{
                boxShadow:
                  "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
              }}
            >
              <div className="bg-primary-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">
                Community driven
              </h3>
              <p className="text-white">
                Our platform enables crowdsourced documentation with
                verification by researchers, ethnomusicologists, and master
                musicians themselves. Together, we preserve cultural heritage
                for future generations.
              </p>
            </div>
          </div>

          <div
            ref={purposeRef}
            className="spotlight-container backdrop-blur-xl bg-white/20 rounded-2xl border border-white/40 p-6 mb-8 shadow-2xl"
            style={{
              boxShadow:
                "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
            }}
          >
            <div className="bg-primary-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Heart className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-white">
              Built with purpose
            </h3>
            <p className="text-white">
              This is a capstone project for university graduation, built with
              the mission to preserve and celebrate Vietnam's rich musical
              heritage. Every contribution helps document and protect
              irreplaceable cultural knowledge.
            </p>
          </div>

          <div
            ref={featuresRef}
            className="spotlight-container backdrop-blur-xl bg-white/20 rounded-2xl shadow-2xl border border-white/40 p-8"
            style={{
              boxShadow:
                "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
            }}
          >
            <h2 className="text-2xl font-semibold mb-4 text-white">
              Key features
            </h2>
            <ul className="space-y-3 text-white">
              <li className="flex items-start">
                <span className="text-white mr-2">•</span>
                <span>
                  <strong>Comprehensive metadata:</strong> Detailed
                  ethnomusicological information including tuning systems, modal
                  structures, ritual contexts, and cultural significance
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-white mr-2">•</span>
                <span>
                  <strong>Intelligent search:</strong> Advanced filtering by
                  ethnicity, region, instrument, recording type, and performance
                  context
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-white mr-2">•</span>
                <span>
                  <strong>Collaborative verification:</strong> Community-driven
                  curation with expert review from researchers and master
                  musicians
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-white mr-2">•</span>
                <span>
                  <strong>Digital preservation:</strong> High-quality audio
                  archiving with proper documentation for long-term preservation
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
