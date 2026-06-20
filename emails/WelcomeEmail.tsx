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
  Link,
} from "@react-email/components";

export default function WelcomeEmail() {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>

          {/* HERO IMAGE */}
          <Img
            src="https://pub-e91d905941ab460b95ac5248c28e16f3.r2.dev/emails/welcome/welcome_hero.jpg"
            alt="Khao Lak Insider"
            style={hero}
          />

          {/* HEADER STRIP */}
          <Section style={topBar}>
            <Text style={topBarText}>
              🌴 Khao Lak Insider · Travel smarter
            </Text>
          </Section>

          {/* TITLE */}
          <Heading style={h1}>
            Willkommen im Khao Lak Insider
          </Heading>

          <Text style={lead}>
            Du bist jetzt nicht mehr nur Besucher.
            Du bist jemand, der Khao Lak wirklich entdeckt.
          </Text>

          {/* STORY BLOCK */}
          <Section style={storyBox}>
            <Text style={storyText}>
              Stell Dir vor: 06:47 Uhr, Coconut Beach.
            </Text>

            <Text style={storyText}>
              Kein Lärm. Kein Touribus. Nur Licht, Wellen und ein kleiner Holzfischer,
              der gerade sein Boot ins Wasser schiebt.
            </Text>

            <Text style={storyTextBold}>
              Genau solche Momente zeigen wir Dir.
            </Text>
          </Section>

          <Hr style={hr} />

          {/* VALUE GRID */}
          <Section style={grid}>
            <Text style={gridItem}>🏝️ Versteckte Orte</Text>
            <Text style={gridItem}>🍜 Food Spots</Text>
            <Text style={gridItem}>🧭 Insider Wissen</Text>
            <Text style={gridItem}>📍 Updates aus Khao Lak</Text>
          </Section>

          <Hr style={hr} />

          {/* MARC & MELO */}
          <Section style={teamBox}>
            <Text style={teamTitle}>Marc & Melo vor Ort</Text>
            <Text style={teamText}>
              Wir zeigen Dir Khao Lak so, wie es wirklich ist —
              nicht wie im Reiseführer, sondern wie es sich anfühlt.
            </Text>
          </Section>

          {/* CTA */}
          <Section style={center}>
            <Link href="https://khaolak.app" style={cta}>
              🌴 Jetzt erste Spots entdecken
            </Link>
          </Section>

          {/* FOOTER */}
          <Text style={footer}>
            Khao Lak Insider · No fluff. Just real places.
          </Text>

        </Container>
      </Body>
    </Html>
  );
}

/* STYLES */

const main = {
  backgroundColor: "#f6f7fb",
  fontFamily: "Arial, sans-serif",
};

const container = {
  maxWidth: "600px",
  margin: "0 auto",
  backgroundColor: "#ffffff",
  borderRadius: "14px",
  overflow: "hidden",
};

const hero = {
  width: "100%",
  display: "block",
};

const topBar = {
  padding: "10px 18px",
  backgroundColor: "#0f766e",
};

const topBarText = {
  color: "#ffffff",
  fontSize: "12px",
  margin: 0,
};

const h1 = {
  fontSize: "30px",
  color: "#0f172a",
  margin: "18px 18px 8px",
};

const lead = {
  fontSize: "16px",
  color: "#334155",
  margin: "0 18px 18px",
  lineHeight: "1.8",
};

const storyBox = {
  backgroundColor: "#ecfeff",
  margin: "0 18px",
  padding: "16px",
  borderRadius: "12px",
};

const storyText = {
  fontSize: "15px",
  color: "#0f172a",
  lineHeight: "1.7",
  marginBottom: "10px",
};

const storyTextBold = {
  fontSize: "15px",
  color: "#0f766e",
  fontWeight: "bold",
};

const grid = {
  padding: "0 18px",
};

const gridItem = {
  fontSize: "14px",
  marginBottom: "6px",
  color: "#0f172a",
};

const teamBox = {
  backgroundColor: "#f1f5f9",
  margin: "18px",
  padding: "14px",
  borderRadius: "12px",
};

const teamTitle = {
  fontWeight: "bold",
  marginBottom: "6px",
};

const teamText = {
  fontSize: "14px",
  color: "#475569",
  lineHeight: "1.6",
};

const center = {
  textAlign: "center" as const,
  margin: "24px 0",
};

const cta = {
  display: "inline-block",
  backgroundColor: "#0f766e",
  color: "#ffffff",
  padding: "14px 22px",
  borderRadius: "10px",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
};

const hr = {
  margin: "20px 18px",
  borderColor: "#e5e7eb",
};

const footer = {
  fontSize: "12px",
  color: "#94a3b8",
  textAlign: "center" as const,
  margin: "20px 0",
};