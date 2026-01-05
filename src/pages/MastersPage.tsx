import { useEffect, useRef } from "react";
import { addSpotlightEffect } from "@/utils/spotlight";

export default function MastersPage() {
  const introRef = useRef<HTMLDivElement>(null);
  const rolesRef = useRef<HTMLDivElement>(null);
  const notableRef = useRef<HTMLDivElement>(null);
  const challengesRef = useRef<HTMLDivElement>(null);
  const contributeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cleanupFunctions: (() => void)[] = [];
    if (introRef.current)
      cleanupFunctions.push(addSpotlightEffect(introRef.current));
    if (rolesRef.current)
      cleanupFunctions.push(addSpotlightEffect(rolesRef.current));
    if (notableRef.current)
      cleanupFunctions.push(addSpotlightEffect(notableRef.current));
    if (challengesRef.current)
      cleanupFunctions.push(addSpotlightEffect(challengesRef.current));
    if (contributeRef.current)
      cleanupFunctions.push(addSpotlightEffect(contributeRef.current));
    return () => cleanupFunctions.forEach((cleanup) => cleanup());
  }, []);

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Master musicians</h1>

        {/* Introduction */}
        <div
          ref={introRef}
          className="spotlight-container backdrop-blur-xl bg-white/20 rounded-2xl shadow-2xl border border-white/40 p-8 mb-8"
          style={{
            boxShadow:
              "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
          }}
        >
          <h2 className="text-2xl font-semibold text-white mb-4">
            Preserving intangible cultural heritage
          </h2>
          <p className="text-white leading-relaxed mb-4">
            Master musicians and tradition bearers are living repositories of
            irreplaceable knowledge about traditional music, instruments,
            performance techniques, and ceremonial practices. Many are elderly
            individuals who learned their craft through decades of oral
            transmission from previous generations. Their expertise encompasses
            not just musical performance, but also instrument construction,
            ritual contexts, linguistic nuances, and cultural meanings embedded
            in each piece.
          </p>
          <p className="text-white leading-relaxed">
            Documentation of master musicians is urgent as this generation
            represents the last direct link to pre-modern musical traditions.
            VietTune Archive serves as a platform to honor their contributions,
            preserve their performances, and facilitate knowledge transmission
            to younger generations before these traditions are lost forever.
          </p>
        </div>

        {/* Roles and Significance */}
        <div
          ref={rolesRef}
          className="spotlight-container backdrop-blur-xl bg-white/20 rounded-2xl shadow-2xl border border-white/40 p-8 mb-8"
          style={{
            boxShadow:
              "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
          }}
        >
          <h2 className="text-2xl font-semibold text-white mb-4">
            Roles of master musicians
          </h2>
          <div className="space-y-4 text-white">
            <div>
              <h3 className="text-xl font-semibold mb-2">
                Ritual specialists and shamans
              </h3>
              <p className="leading-relaxed">
                Among many ethnic groups, master musicians serve dual roles as
                both performers and spiritual intermediaries. Tày and Nùng{" "}
                <em>thầy then</em> (then masters) perform healing rituals,
                communicate with spirits, and maintain community well-being
                through music. Their knowledge encompasses not only musical
                techniques but also herbal medicine, divination, and
                cosmological understanding.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">
                Instrument makers and innovators
              </h3>
              <p className="leading-relaxed">
                Master craftspeople possess specialized knowledge of material
                selection, construction techniques, tuning systems, and acoustic
                properties. They understand which bamboo species produce optimal
                tones, how moon phases affect wood quality, and traditional
                methods for creating specific timbres. Many also innovate within
                traditional frameworks, adapting instruments to changing
                performance contexts.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">
                Epic singers and oral historians
              </h3>
              <p className="leading-relaxed">
                Epic singers preserve vast bodies of oral literature through
                performance. These narratives encode historical events,
                genealogies, migration stories, creation myths, and moral
                teachings. Masters memorize thousands of verses, understand
                complex poetic structures, and adapt performances to specific
                ceremonial contexts and audiences.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">
                Gong orchestra leaders
              </h3>
              <p className="leading-relaxed">
                In Central Highlands communities, gong masters coordinate
                complex ensemble performances, maintain proper ritual protocols,
                and preserve knowledge about each gong's spiritual significance.
                They understand intricate polyrhythmic patterns, know
                appropriate contexts for different compositions, and maintain
                social cohesion through musical leadership.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">
                Teachers and cultural transmitters
              </h3>
              <p className="leading-relaxed">
                Beyond performance, master musicians serve as teachers who
                transmit technical skills, aesthetic values, cultural knowledge,
                and ethical principles to younger generations. Their pedagogical
                methods emphasize imitation, oral instruction, and embodied
                learning within authentic cultural contexts rather than formal
                notation or classroom settings.
              </p>
            </div>
          </div>
        </div>

        {/* Notable Traditions */}
        <div
          ref={notableRef}
          className="spotlight-container backdrop-blur-xl bg-white/20 rounded-2xl shadow-2xl border border-white/40 p-8 mb-8"
          style={{
            boxShadow:
              "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
          }}
        >
          <h2 className="text-2xl font-semibold text-white mb-4">
            Notable musical traditions and their practitioners
          </h2>
          <div className="space-y-4 text-white">
            <div>
              <h3 className="text-xl font-semibold mb-2">
                Then singing (Tày, Nùng, Thái)
              </h3>
              <p className="leading-relaxed">
                <em>Then</em> masters combine musical performance with shamanic
                practices. They play the <em>đàn tính</em> while singing to
                communicate with spirits, diagnose illnesses, and perform
                healing ceremonies. The tradition requires years of
                apprenticeship, learning hundreds of ritual songs, understanding
                spiritual protocols, and mastering trance induction techniques.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">
                Khèn performance (H'Mông)
              </h3>
              <p className="leading-relaxed">
                Master <em>khèn</em> players can perform complex polyphonic
                melodies simultaneously with bass drone tones, creating
                intricate soundscapes during festivals and courtship rituals.
                Expert performers understand reed selection, breath control
                techniques, and the cultural meanings encoded in different
                melodic patterns. The instrument serves as a "voice" expressing
                emotions words cannot convey.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">
                Gong ensemble performance (Central Highlands)
              </h3>
              <p className="leading-relaxed">
                Gong masters in Ê Đê, Ba Na, Gia Rai, and other Central
                Highlands groups coordinate intricate polyrhythmic patterns
                across multiple gong sizes. Each gong is considered a spiritual
                entity with its own name and personality. Masters know proper
                striking techniques, ceremonial protocols, gong tuning methods,
                and the spiritual significance of different rhythmic cycles.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">
                Ca trù (Northern classical music)
              </h3>
              <p className="leading-relaxed">
                <em>Ca trù</em> masters preserve this sophisticated chamber
                music tradition featuring female vocalists accompanied by{" "}
                <em>đàn đáy</em> (three-string lute), <em>phách</em> (wooden
                clappers), and <em>trống chầu</em> (praise drum). The genre
                requires mastery of complex vocal ornamentation, poetic lyrics,
                and refined aesthetic sensibilities. UNESCO recognized ca trù as
                Intangible Cultural Heritage in need of urgent safeguarding.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">
                Đờn ca tài tử (Southern chamber music)
              </h3>
              <p className="leading-relaxed">
                Master musicians in the Mekong Delta region perform this amateur
                music genre featuring improvisation within modal frameworks.
                Performers play various instruments including <em>đàn tranh</em>{" "}
                (zither), <em>đàn kim</em> (moon-shaped lute), and{" "}
                <em>đàn bầu</em> (monochord), demonstrating refined technique
                and deep understanding of modal theory. UNESCO recognized this
                tradition in 2013.
              </p>
            </div>
          </div>
        </div>

        {/* Challenges and Preservation */}
        <div
          ref={challengesRef}
          className="spotlight-container backdrop-blur-xl bg-white/20 rounded-2xl shadow-2xl border border-white/40 p-8 mb-8"
          style={{
            boxShadow:
              "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
          }}
        >
          <h2 className="text-2xl font-semibold text-white mb-4">
            Challenges facing traditional transmission
          </h2>
          <div className="space-y-4 text-white">
            <div>
              <h3 className="text-xl font-semibold mb-2">
                Aging master population
              </h3>
              <p className="leading-relaxed">
                Many master musicians are in their 70s, 80s, or older. As they
                pass away, irreplaceable knowledge disappears. The oral nature
                of transmission means that unrecorded performances, techniques,
                and cultural contexts are permanently lost. Urgent documentation
                is needed before this generation is gone.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">
                Youth disinterest and migration
              </h3>
              <p className="leading-relaxed">
                Younger generations increasingly pursue modern education and
                migrate to cities for economic opportunities. Traditional music
                training requires years of dedication without immediate economic
                returns. The apprenticeship model struggles to compete with
                modern entertainment and career paths.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">
                Loss of performance contexts
              </h3>
              <p className="leading-relaxed">
                As traditional ceremonies decline and communities modernize,
                authentic performance contexts disappear. Music extracted from
                its ritual, agricultural, or social contexts loses cultural
                meaning and becomes mere entertainment. Masters who learned in
                traditional contexts struggle to transmit holistic cultural
                understanding.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">
                Limited documentation and recognition
              </h3>
              <p className="leading-relaxed">
                Most master musicians remain unknown outside their local
                communities. Lack of systematic documentation means their
                contributions go unrecognized. Economic hardship often forces
                masters to abandon cultural work for survival. Recognition as
                cultural treasures could provide both material support and
                motivation for continued transmission.
              </p>
            </div>
          </div>
        </div>

        {/* How to Contribute */}
        <div
          ref={contributeRef}
          className="spotlight-container backdrop-blur-xl bg-white/20 rounded-2xl shadow-2xl border border-white/40 p-8"
          style={{
            boxShadow:
              "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
          }}
        >
          <h2 className="text-2xl font-semibold text-white mb-4">
            Contributing to master musician documentation
          </h2>
          <div className="text-white">
            <p className="leading-relaxed mb-4">
              VietTune Archive welcomes contributions documenting master
              musicians and their traditions. Valuable documentation includes:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
              <li>
                <strong>Performance recordings:</strong> Audio or video of
                master musicians performing in authentic contexts
              </li>
              <li>
                <strong>Biographical information:</strong> Life histories,
                training backgrounds, lineages, and cultural contributions
              </li>
              <li>
                <strong>Technical knowledge:</strong> Instrument construction
                techniques, performance methods, tuning systems, and aesthetic
                principles
              </li>
              <li>
                <strong>Cultural context:</strong> Information about ritual
                uses, social functions, symbolic meanings, and community
                significance
              </li>
              <li>
                <strong>Apprenticeship documentation:</strong> Teaching methods,
                learning processes, and intergenerational transmission
              </li>
              <li>
                <strong>Historical documentation:</strong> Photographs, news
                articles, program notes, and other archival materials
              </li>
            </ul>
            <p className="leading-relaxed">
              When documenting master musicians, always obtain informed consent,
              respect cultural sensitivities, acknowledge intellectual property,
              and involve community members in the documentation process. Proper
              attribution and contextualization honor masters' contributions
              while preserving cultural integrity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
