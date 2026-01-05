import { useEffect, useRef } from "react";
import { addSpotlightEffect } from "@/utils/spotlight";

export default function InstrumentsPage() {
  const introRef = useRef<HTMLDivElement>(null);
  const classificationRef = useRef<HTMLDivElement>(null);
  const bambooRef = useRef<HTMLDivElement>(null);
  const gongRef = useRef<HTMLDivElement>(null);
  const stringRef = useRef<HTMLDivElement>(null);
  const constructionRef = useRef<HTMLDivElement>(null);
  const preservationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cleanupFunctions: (() => void)[] = [];
    if (introRef.current)
      cleanupFunctions.push(addSpotlightEffect(introRef.current));
    if (classificationRef.current)
      cleanupFunctions.push(addSpotlightEffect(classificationRef.current));
    if (bambooRef.current)
      cleanupFunctions.push(addSpotlightEffect(bambooRef.current));
    if (gongRef.current)
      cleanupFunctions.push(addSpotlightEffect(gongRef.current));
    if (stringRef.current)
      cleanupFunctions.push(addSpotlightEffect(stringRef.current));
    if (constructionRef.current)
      cleanupFunctions.push(addSpotlightEffect(constructionRef.current));
    if (preservationRef.current)
      cleanupFunctions.push(addSpotlightEffect(preservationRef.current));
    return () => cleanupFunctions.forEach((cleanup) => cleanup());
  }, []);

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">
          Traditional instruments
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
            Diversity of Vietnamese musical instruments
          </h2>
          <p className="text-white leading-relaxed mb-4">
            Vietnam's 54 ethnic groups have developed an extraordinary variety
            of musical instruments adapted to their environments, cultural
            practices, and aesthetic preferences. From sophisticated bronze gong
            orchestras to delicate bamboo flutes, from powerful buffalo horn
            trumpets to refined string instruments, this diversity reflects
            centuries of creative innovation and cultural exchange.
          </p>
          <p className="text-white leading-relaxed">
            Traditional instruments are more than sound-producing objects—they
            embody cultural knowledge, spiritual beliefs, social relationships,
            and environmental wisdom. Many instruments are considered sacred,
            possess specific gender associations, or can only be played in
            particular ceremonial contexts. Understanding instruments requires
            appreciating their cultural meanings alongside their acoustic
            properties.
          </p>
        </div>

        {/* Classification */}
        <div
          ref={classificationRef}
          className="spotlight-container backdrop-blur-xl bg-white/20 rounded-2xl shadow-2xl border border-white/40 p-8 mb-8"
          style={{
            boxShadow:
              "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
          }}
        >
          <h2 className="text-2xl font-semibold text-white mb-4">
            Classification systems
          </h2>
          <div className="text-white">
            <p className="leading-relaxed mb-4">
              Traditional Vietnamese instruments can be classified using the
              Hornbostel-Sachs system based on sound production methods:
            </p>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  Idiophones (Instruments that vibrate themselves)
                </h3>
                <p className="leading-relaxed mb-2">
                  Sound produced by the instrument's body vibrating without
                  strings, membranes, or air columns:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>
                    <strong>Gongs and cymbals:</strong> <em>Chiêng</em> (flat
                    gongs), <em>cồng chiêng</em> (gong ensembles),{" "}
                    <em>thanh la</em> (small cymbals)
                  </li>
                  <li>
                    <strong>Xylophones:</strong> <em>Đàn t'rưng</em> (bamboo
                    xylophone), <em>đing năm</em> (bamboo tubes on frame)
                  </li>
                  <li>
                    <strong>Percussion:</strong> <em>Mõ</em> (wooden slit drum),{" "}
                    <em>sinh tiền</em> (metal discs), <em>song loan</em> (twin
                    bells)
                  </li>
                  <li>
                    <strong>Scrapers and clappers:</strong> <em>Phách</em>{" "}
                    (wooden clappers), <em>ve sầu</em> (bamboo scraper)
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">
                  Membranophones (Drums with stretched membranes)
                </h3>
                <p className="leading-relaxed mb-2">
                  Sound produced by vibrating stretched membranes:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>
                    <strong>Barrel drums:</strong> <em>Trống</em> (general
                    term), <em>trống cơm</em> (rice drum), <em>trống chầu</em>{" "}
                    (praise drum)
                  </li>
                  <li>
                    <strong>Frame drums:</strong> <em>Trống nguyệt</em> (moon
                    drum), <em>trống quân</em> (military drum)
                  </li>
                  <li>
                    <strong>Ceremonial drums:</strong> <em>Trống đồng</em>{" "}
                    (bronze drum - also idiophone), <em>cồng chiên</em> (large
                    ceremonial drum)
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">
                  Chordophones (String instruments)
                </h3>
                <p className="leading-relaxed mb-2">
                  Sound produced by vibrating strings:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>
                    <strong>Zithers:</strong> <em>Đàn tranh</em> (16-string
                    zither), <em>đàn bầu</em> (monochord), <em>đàn đáy</em>{" "}
                    (three-string zither)
                  </li>
                  <li>
                    <strong>Lutes:</strong> <em>Đàn tính</em> (two-string lute),{" "}
                    <em>đàn nguyệt</em> (moon-shaped lute), <em>đàn tam</em>{" "}
                    (three-string lute)
                  </li>
                  <li>
                    <strong>Fiddles:</strong> <em>Đàn nhị</em> (two-string
                    fiddle), <em>đàn gáo</em> (coconut fiddle), <em>K'ni</em>{" "}
                    (ethnic minority fiddle)
                  </li>
                  <li>
                    <strong>Tube zithers:</strong> <em>Đàn goong</em> (bamboo
                    tube zither), <em>guôc</em> (bamboo zither)
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">
                  Aerophones (Wind instruments)
                </h3>
                <p className="leading-relaxed mb-2">
                  Sound produced by vibrating air columns:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>
                    <strong>Flutes:</strong> <em>Sáo</em> (bamboo flute),{" "}
                    <em>tiêu</em> (vertical flute), <em>sli</em> (ethnic
                    minority flute)
                  </li>
                  <li>
                    <strong>Free-reed instruments:</strong> <em>Khèn</em> (mouth
                    organ), <em>đing buốt</em> (gourd mouth organ),{" "}
                    <em>đing pút</em> (pan pipes)
                  </li>
                  <li>
                    <strong>Oboes and horns:</strong> <em>Kèn bầu</em> (gourd
                    oboe), <em>kèn lá</em> (leaf oboe), <em>tù và</em> (buffalo
                    horn)
                  </li>
                  <li>
                    <strong>Trumpets:</strong> <em>Tù và</em> (long trumpet),{" "}
                    <em>pí pắp</em> (short horn), <em>saranai</em> (Cham oboe)
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bamboo Instruments */}
        <div
          ref={bambooRef}
          className="spotlight-container backdrop-blur-xl bg-white/20 rounded-2xl shadow-2xl border border-white/40 p-8 mb-8"
          style={{
            boxShadow:
              "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
          }}
        >
          <h2 className="text-2xl font-semibold text-white mb-4">
            Bamboo instruments: Innovation and adaptation
          </h2>
          <div className="space-y-4 text-white">
            <p className="leading-relaxed">
              Bamboo's abundance in Vietnam has led to extraordinary
              instrumental diversity. Different bamboo species produce distinct
              tones, and ethnic groups have developed sophisticated techniques
              for selecting, treating, and crafting bamboo into musical
              instruments.
            </p>

            <div>
              <h3 className="text-xl font-semibold mb-2">
                Đàn t'rưng (Bamboo xylophone)
              </h3>
              <p className="leading-relaxed">
                Central Highlands instrument consisting of bamboo tubes of
                graduated lengths arranged on a wooden frame. Players strike
                tubes with wooden mallets, producing clear pentatonic melodies.
                Each tube's length, diameter, and node positions determine
                pitch. Skilled makers understand bamboo acoustics and
                traditional tuning systems.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">
                Đàn goong (Bamboo tube zither)
              </h3>
              <p className="leading-relaxed">
                Unique instrument with strings attached to a bamboo tube
                resonator. Players pluck strings while holding the instrument
                against their body, using the body as an additional resonator.
                Different ethnic groups have developed regional variations with
                distinct tuning systems and playing techniques.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">
                Đing păng (Percussion tubes)
              </h3>
              <p className="leading-relaxed">
                Bamboo tubes struck on the ground or against each other to
                create powerful rhythmic patterns. Different tube sizes produce
                varying pitches. Used in gong ensembles and agricultural
                ceremonies. Players coordinate complex polyrhythmic patterns
                across multiple performers.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">
                Bamboo flutes (Various types)
              </h3>
              <p className="leading-relaxed">
                Every ethnic group has developed flute variations: transverse
                flutes, vertical flutes, notched flutes, ring flutes, nose
                flutes. Each design produces distinct timbres and requires
                specific playing techniques. Flutes often accompany vocal music,
                serve in courtship rituals, or provide pastoral entertainment.
              </p>
            </div>
          </div>
        </div>

        {/* Gong Culture */}
        <div
          ref={gongRef}
          className="spotlight-container backdrop-blur-xl bg-white/20 rounded-2xl shadow-2xl border border-white/40 p-8 mb-8"
          style={{
            boxShadow:
              "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
          }}
        >
          <h2 className="text-2xl font-semibold text-white mb-4">
            Gong culture: Sacred instruments of the highlands
          </h2>
          <div className="space-y-4 text-white">
            <p className="leading-relaxed">
              UNESCO recognized the Gong Culture of Central Highlands Vietnam as
              Masterpiece of Oral and Intangible Heritage of Humanity in 2005.
              Gongs are not merely musical instruments but sacred objects with
              spiritual power, social significance, and cosmological meaning.
            </p>

            <div>
              <h3 className="text-xl font-semibold mb-2">Types of gongs</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Chiêng:</strong> Flat gongs without bosses, producing
                  sustained resonant tones. Different sizes create various
                  pitches in ensemble performances.
                </li>
                <li>
                  <strong>Cồng:</strong> Bossed gongs with central knobs,
                  producing shorter, more percussive tones. Often used as
                  melodic leaders in ensembles.
                </li>
                <li>
                  <strong>Individual vs. ensemble:</strong> Some gongs are
                  played solo for specific rituals; others function only within
                  ensemble contexts.
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">
                Cultural significance
              </h3>
              <p className="leading-relaxed">
                Gongs are considered living entities with personalities. Each
                gong has a name, gender, and spiritual power. Ownership of gongs
                indicates wealth and prestige. Communities hold gong festivals
                during agricultural cycles, lifecycle ceremonies, and community
                gatherings. Gong music connects communities to ancestors,
                natural forces, and spiritual realms. Loss of gong knowledge
                threatens not just music but entire cosmological systems.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">
                Performance practice
              </h3>
              <p className="leading-relaxed">
                Gong ensembles require coordinated performance by multiple
                musicians, each responsible for specific gongs and rhythmic
                patterns. Players strike gongs with padded mallets, controlling
                tone through striking position and dampening techniques. Complex
                polyrhythms emerge from individual patterns interacting. Proper
                performance requires understanding both musical structure and
                ritual protocols.
              </p>
            </div>
          </div>
        </div>

        {/* String Instruments */}
        <div
          ref={stringRef}
          className="spotlight-container backdrop-blur-xl bg-white/20 rounded-2xl shadow-2xl border border-white/40 p-8 mb-8"
          style={{
            boxShadow:
              "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
          }}
        >
          <h2 className="text-2xl font-semibold text-white mb-4">
            String instruments: Refined aesthetics and technical mastery
          </h2>
          <div className="space-y-4 text-white">
            <div>
              <h3 className="text-xl font-semibold mb-2">
                Đàn bầu (Monochord)
              </h3>
              <p className="leading-relaxed">
                Unique one-string instrument with flexible neck and gourd
                resonator. Players pluck the string while bending the neck,
                creating continuous pitch variations and distinctive vibrato.
                Capable of producing portamento effects mimicking human voice
                and natural sounds. Considered emblematic of Vietnamese musical
                aesthetics emphasizing subtle ornamentation and emotional
                expression.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">
                Đàn tranh (16-string zither)
              </h3>
              <p className="leading-relaxed">
                Sophisticated zither with moveable bridges allowing pitch
                adjustments for different modal systems. Players pluck strings
                with right hand while pressing behind bridges with left hand to
                create ornamentation, vibrato, and pitch bends. Requires years
                of training to master complex techniques and modal theory.
                Central to southern chamber music and ceremonial contexts.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">
                Đàn tính (Two-string lute)
              </h3>
              <p className="leading-relaxed">
                Essential instrument in northern minority groups (Tày, Nùng,
                Thái). Trapezoid soundbox with two strings tuned in fourths or
                fifths. Used by shamans during <em>then</em> rituals,
                accompanying epic singing, and providing courtship music.
                Different ethnic groups have developed distinct playing styles,
                tuning systems, and repertoires.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">
                Đàn nhị (Two-string fiddle)
              </h3>
              <p className="leading-relaxed">
                Spike fiddle with two strings played with horsehair bow passing
                between strings. Snake skin covers hexagonal soundbox. Players
                control pitch by finger pressure without pressing strings to
                fingerboard, allowing subtle microtonal inflections. Essential
                in classical ensembles, opera accompaniment, and ceremonial
                music.
              </p>
            </div>
          </div>
        </div>

        {/* Construction and Materials */}
        <div
          ref={constructionRef}
          className="spotlight-container backdrop-blur-xl bg-white/20 rounded-2xl shadow-2xl border border-white/40 p-8 mb-8"
          style={{
            boxShadow:
              "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
          }}
        >
          <h2 className="text-2xl font-semibold text-white mb-4">
            Traditional knowledge: Construction and materials
          </h2>
          <div className="space-y-4 text-white">
            <div>
              <h3 className="text-xl font-semibold mb-2">
                Material selection and preparation
              </h3>
              <p className="leading-relaxed">
                Master craftspeople possess detailed knowledge of material
                properties. They know which bamboo species produce optimal
                tones, when to harvest materials (moon phases, seasons), how
                aging affects timber quality, and traditional treatments for
                durability. Material selection directly impacts instrument
                acoustics, requiring both scientific understanding and intuitive
                expertise.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">
                Tuning systems and temperament
              </h3>
              <p className="leading-relaxed">
                Vietnamese instruments use various tuning systems beyond Western
                equal temperament. Pentatonic modes dominate, but regional
                variations, ethnic differences, and individual preferences
                create diverse tuning practices. Masters understand intervallic
                relationships, modal characteristics, and how to adjust tunings
                for different repertoires and performance contexts.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">
                Acoustic principles and innovation
              </h3>
              <p className="leading-relaxed">
                Traditional makers understand resonance, harmonic overtones,
                soundbox design, and how physical parameters affect timbre.
                Contemporary makers balance traditional aesthetics with modern
                materials and construction techniques. Innovation occurs within
                traditional frameworks, adapting instruments to changing
                performance contexts while maintaining cultural authenticity.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">
                Symbolic decoration and cultural meaning
              </h3>
              <p className="leading-relaxed">
                Instrument decoration often carries symbolic significance:
                dragons represent power, phoenixes symbolize grace, lotus
                flowers indicate purity. Decorative choices reflect cultural
                values, social status, and aesthetic preferences. Understanding
                symbolism reveals deeper cultural meanings embedded in
                instrumental traditions.
              </p>
            </div>
          </div>
        </div>

        {/* Preservation Challenges */}
        <div
          ref={preservationRef}
          className="spotlight-container backdrop-blur-xl bg-white/20 rounded-2xl shadow-2xl border border-white/40 p-8"
          style={{
            boxShadow:
              "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
          }}
        >
          <h2 className="text-2xl font-semibold text-white mb-4">
            Preservation and documentation needs
          </h2>
          <div className="text-white">
            <p className="leading-relaxed mb-4">
              Many traditional instruments face preservation challenges:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
              <li>
                <strong>Endangered instruments:</strong> Some instruments are
                rarely played, with few remaining makers or players
              </li>
              <li>
                <strong>Lost construction knowledge:</strong> Traditional
                construction techniques disappear as master makers pass away
                without apprentices
              </li>
              <li>
                <strong>Material scarcity:</strong> Specific materials become
                unavailable due to environmental changes or regulations
              </li>
              <li>
                <strong>Context loss:</strong> Instruments lose meaning when
                extracted from cultural contexts
              </li>
              <li>
                <strong>Limited documentation:</strong> Most instruments lack
                comprehensive documentation of construction, playing techniques,
                and cultural significance
              </li>
            </ul>
            <p className="leading-relaxed">
              VietTune Archive aims to document instruments comprehensively:
              construction methods, acoustic properties, playing techniques,
              cultural contexts, regional variations, and audio examples. This
              documentation preserves knowledge for future generations,
              researchers, instrument makers, and cultural practitioners.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
