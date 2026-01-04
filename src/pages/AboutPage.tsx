import { Target, Users, Heart } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-secondary-900 mb-8">
        About VietTune Archive
      </h1>

      <div className="prose max-w-none">
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
          <p className="text-secondary-700 leading-relaxed mb-4">
            Vietnam's 54 ethnic minorities possess rich musical traditions
            passed down orally through generations. Many elderly master
            musicians hold irreplaceable knowledge about rare instruments,
            performance techniques, ceremonial songs, and regional variations.
            Unfortunately, systematic documentation efforts remain minimal -
            most recordings exist as scattered cassette tapes in provincial
            cultural centers, untranscribed and inaccessible to researchers or
            younger generations.
          </p>
          <p className="text-secondary-700 leading-relaxed">
            VietTune Archive addresses the urgent need for a specialized
            crowdsourced documentation platform before this intangible cultural
            heritage disappears. We provide intelligent search capabilities and
            collaborative curation tools needed to build comprehensive, verified
            collections.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="bg-primary-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Target className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">
              What Makes Us Different
            </h3>
            <p className="text-secondary-600">
              Unlike commercial music platforms focused on entertainment,
              traditional music requires specialized metadata capturing
              ethnomusicological details: tuning systems, modal structures,
              ritual contexts, instrument construction methods, and regional
              dialectal variations in lyrics.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="bg-primary-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Community Driven</h3>
            <p className="text-secondary-600">
              Our platform enables crowdsourced documentation with verification
              by researchers, ethnomusicologists, and master musicians
              themselves. Together, we preserve cultural heritage for future
              generations.
            </p>
          </div>
        </div>

        <div className="bg-primary-50 border-l-4 border-primary-600 p-6 mb-8">
          <h3 className="text-xl font-semibold mb-2 flex items-center">
            <Heart className="h-6 w-6 text-primary-600 mr-2" />
            Built with Purpose
          </h3>
          <p className="text-secondary-700">
            This is a capstone project for university graduation, built with the
            mission to preserve and celebrate Vietnam's rich musical heritage.
            Every contribution helps document and protect irreplaceable cultural
            knowledge.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold mb-4">Key Features</h2>
          <ul className="space-y-3 text-secondary-700">
            <li className="flex items-start">
              <span className="text-primary-600 mr-2">•</span>
              <span>
                <strong>Comprehensive Metadata:</strong> Detailed
                ethnomusicological information including tuning systems, modal
                structures, ritual contexts, and cultural significance
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-primary-600 mr-2">•</span>
              <span>
                <strong>Intelligent Search:</strong> Advanced filtering by
                ethnicity, region, instrument, recording type, and performance
                context
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-primary-600 mr-2">•</span>
              <span>
                <strong>Collaborative Verification:</strong> Community-driven
                curation with expert review from researchers and master
                musicians
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-primary-600 mr-2">•</span>
              <span>
                <strong>Digital Preservation:</strong> High-quality audio
                archiving with proper documentation for long-term preservation
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
