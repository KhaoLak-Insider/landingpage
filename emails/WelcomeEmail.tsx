import {
  Html,
  Head,
  Body,
  Container,
  Heading,
  Text,
  Img,
  Section,
  Hr,
} from "@react-email/components";

export default function WelcomeEmail() {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>

          {/* HERO */}
          <Img
            src="https://pub-e91d905941ab460b95ac5248c28e16f3.r2.dev/emails/welcome/welcome_hero.jpg"
            style={hero}
          />

          {/* OPENING STORY */}
          <Heading style={h1}>
            Du bist jetzt nicht mehr nur Besucher.
          </Heading>

          <Text style={text}>
            Stell dir vor: 06:47 Uhr, Coconut Beach.
          </Text>

          <Text style={text}>
            Das Meer ist komplett ruhig. Kein Lärm. Keine Touristenbusse.
            Nur Sand, Licht und ein kleiner Holzbootfahrer, der gerade sein Boot ins Wasser schiebt.
          </Text>

          <Text style={text}>
            Genau solche Momente wirst du hier entdecken.
          </Text>

          <Hr style={hr} />

          {/* VALUE SHIFT */}
          <Section style={box}>
            <Text style={bold}>Khao Lak Insider ist kein Reiseführer.</Text>

            <Text style={text}>
              Es ist dein Blick hinter die Kulissen.
            </Text>

            <Text style={text}>👉 Orte, die Google nicht zeigt</Text>
            <Text style={text}>👉 Food Spots ohne Touri-Menüs</Text>
            <Text style={text}>👉 Strände, an denen du alleine bist</Text>
            <Text style={text}>👉 Updates direkt von vor Ort</Text>
          </Section>

          <Hr style={hr} />

          {/* MARC & MELO */}
          <Text style={text}>
            Marc & Melo leben genau dort, wo andere Urlaub machen.
          </Text>

          <Text style={text}>
            Sie suchen nicht nach Sehenswürdigkeiten —
            sie finden Orte, die man nur kennt, wenn man wirklich dort war.
          </Text>

          <Hr style={hr} />

          {/* MOMENT SHIFT */}
          <Text style={text}>
            Vielleicht sitzt du gerade noch zu Hause.
          </Text>

          <Text style={text}>
            Aber dein erster echter Khao Lak Moment beginnt genau hier.
          </Text>

          <Hr style={hr} />

          {/* CTA */}
          <Section style={center}>
            <Text style={cta}>
              👉 Öffne die App und finde deinen ersten versteckten Spot
            </Text>
          </Section>

          {/* FOOTER */}
          <Text style={footer}>
            Khao Lak Insider · Travel smarter 🌴
          </Text>

        </Container>
      </Body>
    </Html>
  );
}

/* STYLES */
const main = { backgroundColor: "#f6f7fb", fontFamily: "Arial" };
const container = { maxWidth: 600, margin: "0 auto", background: "#fff", padding: 20 };
const hero = { width: "100%", borderRadius: 12 };
const h1 = { fontSize: 22, color: "#0f766e" };
const text = { fontSize: 14, color: "#334155", lineHeight: 1.6 };
const hr = { margin: "20px 0" };
const box = { background: "#ecfeff", padding: 14, borderRadius: 10 };
const bold = { fontWeight: "bold" };
const center = { textAlign: "center" as const };
const cta = { fontWeight: "bold", color: "#0f766e" };
const footer = { fontSize: 11, color: "#94a3b8", textAlign: "center" as const };