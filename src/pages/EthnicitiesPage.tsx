import { useEffect, useRef } from "react";
import { addSpotlightEffect } from "@/utils/spotlight";

export default function EthnicitiesPage() {
  const introRef = useRef<HTMLDivElement>(null);
  const northernRef = useRef<HTMLDivElement>(null);
  const centralRef = useRef<HTMLDivElement>(null);
  const southernRef = useRef<HTMLDivElement>(null);
  const musicalRef = useRef<HTMLDivElement>(null);
  const additionalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cleanupFunctions: (() => void)[] = [];
    if (introRef.current)
      cleanupFunctions.push(addSpotlightEffect(introRef.current));
    if (northernRef.current)
      cleanupFunctions.push(addSpotlightEffect(northernRef.current));
    if (centralRef.current)
      cleanupFunctions.push(addSpotlightEffect(centralRef.current));
    if (southernRef.current)
      cleanupFunctions.push(addSpotlightEffect(southernRef.current));
    if (musicalRef.current)
      cleanupFunctions.push(addSpotlightEffect(musicalRef.current));
    if (additionalRef.current)
      cleanupFunctions.push(addSpotlightEffect(additionalRef.current));
    return () => cleanupFunctions.forEach((cleanup) => cleanup());
  }, []);

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">
          Vietnamese ethnicities
        </h1>

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
            Overview of Vietnam's ethnic diversity
          </h2>
          <p className="text-white leading-relaxed mb-4">
            Vietnam is home to 54 officially recognized ethnic groups, each with
            distinct cultural identities, languages, and musical traditions. The
            Kinh (Viet) people comprise approximately 86% of the population,
            while the remaining 53 ethnic minorities represent about 14%,
            primarily residing in mountainous and highland regions.
          </p>
          <p className="text-white leading-relaxed">
            These ethnic minorities are categorized into eight major
            ethnolinguistic families: Austroasiatic, Tai-Kadai, Hmong-Mien,
            Austronesian, Sino-Tibetan, and others. Each group has developed
            unique musical instruments, performance practices, vocal techniques,
            and ceremonial traditions passed down through oral transmission for
            centuries.
          </p>
        </div>

        {/* Northern Region */}
        <div
          ref={northernRef}
          className="spotlight-container backdrop-blur-xl bg-white/20 rounded-2xl shadow-2xl border border-white/40 p-8 mb-8"
          style={{
            boxShadow:
              "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
          }}
        >
          <h2 className="text-2xl font-semibold text-white mb-4">
            Northern highlands ethnicities
          </h2>
          <div className="space-y-4 text-white">
            <div>
              <h3 className="text-xl font-semibold mb-2">Tày (Tay)</h3>
              <p className="leading-relaxed">
                The Tày people are the largest ethnic minority in Vietnam,
                primarily residing in northern mountain provinces. Their musical
                traditions include the <em>đàn tính</em> (two-string lute) and{" "}
                <em>then</em> singing, a spiritual practice performed by shamans
                during religious ceremonies. The <em>sli</em> flute and{" "}
                <em>pí lè</em> reed instrument are also central to their folk
                music.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">Nùng (Nung)</h3>
              <p className="leading-relaxed">
                Closely related to the Tày, the Nùng people share similar
                musical instruments including the <em>đàn tính</em> and various
                percussion instruments. Their <em>sli</em> songs accompany
                agricultural work and courtship rituals. The <em>then</em>{" "}
                ritual music plays a vital role in their spiritual practices.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">Thái (Thai)</h3>
              <p className="leading-relaxed">
                The Thái people, divided into Black Thái, White Thái, and Red
                Thái subgroups, have rich vocal traditions including{" "}
                <em>khắp</em> and <em>xòe</em> singing. Their instrumental music
                features the <em>đàn tính</em>, <em>pí pắp</em> (buffalo horn),
                and various drums used in the <em>xòe</em> circle dance.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">H'Mông (Hmong)</h3>
              <p className="leading-relaxed">
                The H'Mông people are renowned for their <em>khèn</em>{" "}
                (free-reed mouth organ), which produces complex polyphonic
                melodies during festivals and courtship rituals. Their vocal
                traditions include <em>hát đối đáp</em> (antiphonal singing) and
                epic narratives that preserve historical memories and cultural
                identity.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">Dao (Yao)</h3>
              <p className="leading-relaxed">
                The Dao people maintain diverse musical practices including the{" "}
                <em>tiêu</em> flute, <em>đàn nhị</em> (two-string fiddle), and
                various percussion instruments. Their ceremonial music,
                particularly during <em>cấp sắc</em> (ordination) rituals,
                incorporates Taoist religious elements with indigenous
                traditions.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">Mường (Muong)</h3>
              <p className="leading-relaxed">
                The Mường people, linguistically related to the Kinh, preserve
                ancient Vietnamese musical forms. Their <em>mò mường</em> shaman
                songs and gong ensemble music reflect pre-Buddhist animist
                traditions. The <em>chiêng</em> (gong) plays a central role in
                community ceremonies.
              </p>
            </div>
          </div>
        </div>

        {/* Central Highlands */}
        <div
          ref={centralRef}
          className="spotlight-container backdrop-blur-xl bg-white/20 rounded-2xl shadow-2xl border border-white/40 p-8 mb-8"
          style={{
            boxShadow:
              "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
          }}
        >
          <h2 className="text-2xl font-semibold text-white mb-4">
            Central highlands ethnicities (Tây Nguyên)
          </h2>
          <div className="space-y-4 text-white">
            <div>
              <h3 className="text-xl font-semibold mb-2">Ê Đê (Ede)</h3>
              <p className="leading-relaxed">
                The Ê Đê people are famous for their gong culture, recognized by
                UNESCO as Intangible Cultural Heritage. Their gong ensembles (
                <em>chiêng</em>) consist of multiple sizes producing a layered
                soundscape during festivals, funerals, and agricultural
                celebrations. The <em>đing năm</em> (bamboo xylophone) and{" "}
                <em>goong</em> (bamboo tube zither) are unique to their musical
                tradition.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">Ba Na (Bahnar)</h3>
              <p className="leading-relaxed">
                The Ba Na people maintain elaborate gong traditions and unique
                bamboo instruments including the <em>đing tút</em> (bamboo tubes
                struck with sticks) and <em>ta lốt</em> (bamboo xylophone).
                Their ceremonial music accompanies communal house (<em>rông</em>
                ) rituals and buffalo sacrifice ceremonies.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">Gia Rai (Jarai)</h3>
              <p className="leading-relaxed">
                The Gia Rai people are known for their sophisticated gong
                orchestras and diverse bamboo instruments. The{" "}
                <em>klong put</em> (bamboo tubes struck on the ground) creates
                powerful rhythmic patterns. Their vocal traditions include epic
                narratives and lullabies with distinctive pentatonic scales.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">Sedang</h3>
              <p className="leading-relaxed">
                The Sedang people maintain gong traditions and unique wind
                instruments. Their <em>ta-ri-ang</em> (gourd mouth organ) and
                various flutes produce haunting melodies during courtship and
                ceremonies. Community gong performances accompany agricultural
                cycles and lifecycle rituals.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">Co Ho (Koho)</h3>
              <p className="leading-relaxed">
                The Co Ho people use gongs, drums, and unique bamboo
                instruments. Their <em>tà-linh</em> singing style and bamboo
                flute music accompany rice wine ceremonies and community
                gatherings. The <em>dung-kar</em> (buffalo horn trumpet)
                announces important events.
              </p>
            </div>
          </div>
        </div>

        {/* Southern and Coastal */}
        <div
          ref={southernRef}
          className="spotlight-container backdrop-blur-xl bg-white/20 rounded-2xl shadow-2xl border border-white/40 p-8 mb-8"
          style={{
            boxShadow:
              "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
          }}
        >
          <h2 className="text-2xl font-semibold text-white mb-4">
            Southern and coastal ethnicities
          </h2>
          <div className="space-y-4 text-white">
            <div>
              <h3 className="text-xl font-semibold mb-2">Chăm (Cham)</h3>
              <p className="leading-relaxed">
                The Chăm people, descendants of the ancient Champa Kingdom,
                maintain Hindu and Islamic musical traditions. Their{" "}
                <em>saranai</em> (oboe), <em>ginang</em> (drums), and{" "}
                <em>paranung</em> (barrel drum) accompany religious ceremonies,
                particularly the <em>Kate</em> festival. Their vocal music
                blends ancient Austronesian traditions with South Asian
                influences.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">Khmer</h3>
              <p className="leading-relaxed">
                The Khmer people of the Mekong Delta maintain strong connections
                to Cambodian classical music traditions. Their <em>tro</em>{" "}
                (spike fiddle), <em>skor</em> (drums), and <em>korng</em> (gong
                circles) accompany Buddhist ceremonies and traditional theater.
                The <em>ayai</em> folk singing style is popular at festivals.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">Hoa (Chinese)</h3>
              <p className="leading-relaxed">
                The Hoa people preserve various regional Chinese opera
                traditions including <em>tuồng</em> and <em>hát bội</em>,
                alongside instrumental music featuring the <em>erhu</em>, pipa,
                and various percussion instruments. Their temple music
                accompanies religious festivals and ancestor worship ceremonies.
              </p>
            </div>
          </div>
        </div>

        {/* Musical Characteristics */}
        <div
          ref={musicalRef}
          className="spotlight-container backdrop-blur-xl bg-white/20 rounded-2xl shadow-2xl border border-white/40 p-8 mb-8"
          style={{
            boxShadow:
              "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
          }}
        >
          <h2 className="text-2xl font-semibold text-white mb-4">
            Common musical characteristics
          </h2>
          <div className="space-y-4 text-white">
            <div>
              <h3 className="text-xl font-semibold mb-2">
                Gong culture (Văn hóa Cồng chiêng)
              </h3>
              <p className="leading-relaxed">
                Gong ensembles are central to many highland ethnic groups,
                particularly in the Central Highlands. Different gong sizes
                produce specific pitches creating complex polyrhythmic and
                polyphonic textures. Gongs are considered sacred objects
                connecting communities to ancestral spirits and natural forces.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">Bamboo instruments</h3>
              <p className="leading-relaxed">
                Bamboo's abundance has led to extraordinary diversity in bamboo
                instruments across ethnic groups: xylophones, tube zithers,
                flutes, mouth organs, percussion tubes, and more. Each
                instrument reflects specific environmental adaptations and
                cultural aesthetics.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">
                Vocal traditions and oral literature
              </h3>
              <p className="leading-relaxed">
                Epic singing traditions preserve historical narratives, creation
                myths, and cultural knowledge. Antiphonal singing (call and
                response) is common in courtship practices. Vocal techniques
                often include ornamentation, microtonal inflections, and nasal
                timbres specific to each ethnic group.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">
                Ceremonial and ritual music
              </h3>
              <p className="leading-relaxed">
                Music plays essential roles in lifecycle ceremonies (birth,
                coming-of-age, marriage, death), agricultural rituals (planting,
                harvest), spiritual practices (shamanism, animism, Buddhism),
                and community celebrations. These performances maintain social
                cohesion and transmit cultural values across generations.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">
                Pentatonic and modal systems
              </h3>
              <p className="leading-relaxed">
                While many groups use pentatonic (five-tone) scales, significant
                variation exists in tuning systems, modal structures, and
                melodic patterns. Some groups use anhemitonic (no semitones)
                scales, while others incorporate microtonal inflections and
                complex modal systems.
              </p>
            </div>
          </div>
        </div>

        {/* Additional Groups */}
        <div
          ref={additionalRef}
          className="spotlight-container backdrop-blur-xl bg-white/20 rounded-2xl shadow-2xl border border-white/40 p-8"
          style={{
            boxShadow:
              "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
          }}
        >
          <h2 className="text-2xl font-semibold text-white mb-4">
            Other notable ethnic groups
          </h2>
          <div className="text-white">
            <p className="leading-relaxed mb-4">
              Many other ethnic groups maintain distinct musical traditions
              including:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-semibold mb-2">Northern groups:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>La Chí, La Ha, Lự, Lô Lô</li>
                  <li>Phù Lá, Pa Thẻn, Giáy</li>
                  <li>Bố Y, Cống, Si La</li>
                  <li>Sán Chay, Sán Dìu</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold mb-2">
                  Central and southern groups:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Xơ Đăng, Brâu, Bru-Vân Kiều</li>
                  <li>Cơ Tu, Giẻ Triêng, Hrê</li>
                  <li>Mnông, Mạ, Rơ Măm</li>
                  <li>Ra Glai, Chơ Ro, Chu Ru</li>
                </ul>
              </div>
            </div>
            <p className="leading-relaxed mt-4">
              Each group contributes unique instruments, vocal styles, and
              ceremonial practices to Vietnam's extraordinary musical diversity.
              Documentation and preservation efforts are crucial as many master
              musicians are elderly and traditional transmission methods face
              challenges from modernization.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
