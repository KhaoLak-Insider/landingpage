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
      <Body style={{ ...main, margin: 0, padding: 0 }}>

        <Container style={container}>

          {/* HERO */}
          <Img
            src="https://pub-e91d905941ab460b95ac5248c28e16f3.r2.dev/emails/welcome/welcome_hero.jpg"
            alt="Khao Lak Insider"
            style={hero}
          />

          {/* TOP BAR */}
          <Section style={topBar}>
            <Text style={topBarText}>
              🌴 Khao Lak Insider · Travel smarter
            </Text>
          </Section>

          {/* INTRO BOX (FIXED - jetzt echte Box wie gewünscht) */}
          <Section style={introBox}>
            <Text style={introTitle}>
              Du hast gerade den touristischen Blick verlassen.
            </Text>

            <Text style={introText}>
              Ab jetzt siehst Du Khao Lak anders — nicht als Reiseziel, sondern als Sammlung echter Orte und Momente.
            </Text>
          </Section>

          {/* STORY */}
          <Section style={storyBox}>
            <Text style={storyText}>
              06:47 Uhr · Coconut Beach
            </Text>

            <Text style={storyText}>
              Kein Lärm. Kein Touribus. Nur Licht, Wellen und ein kleiner Fischer,
              der sein Boot ins Wasser schiebt.
            </Text>

            <Text style={storyTextBold}>
              Genau solche Momente wirst Du hier entdecken.
            </Text>
          </Section>

          <Hr style={hr} />

          {/* VALUE BLOCK */}
          <Section style={grid}>
            <Text style={gridItem}>🏝️ Orte, die niemand zeigt</Text>
            <Text style={gridItem}>🍜 Essen, das nur Locals kennen</Text>
            <Text style={gridItem}>🧭 Insider Wissen direkt vor Ort</Text>
            <Text style={gridItem}>📍 Updates aus Khao Lak in Echtzeit</Text>
          </Section>

          <Hr style={hr} />

          {/* MARC & MELO */}
          <Section style={teamBox}>
            <Text style={teamTitle}>
              Marc & Melo vor Ort
            </Text>

            <Text style={teamText}>
              Sie verbringen seit über 13 Jahren regelmäßig mehrere Monate im Jahr in Khao Lak.
              In dieser Zeit haben sie den Ort weit über die klassischen Touristenrouten hinaus kennengelernt —
              und genau deshalb zeigen sie Dir Khao Lak so, wie es wirklich ist: ehrlich, direkt und abseits der typischen Reisewege.
            </Text>
          </Section>

          <Hr style={hr} />

          {/* FEATURE BOX */}
          <Section style={featureBox}>

            <Text style={featureTitle}>
              📱 So wird die Khao Lak App für Dich aussehen
            </Text>

            <Text style={featureText}>
              Was hier gerade entsteht, ist mehr als ein Newsletter.
              In den nächsten Wochen wächst daraus eine App, die Dir Khao Lak wirklich verständlich macht.
            </Text>

            <Text style={featureText}>
              Und jede Woche zeigen wir Dir ein neues Feature im Detail.
            </Text>

            <Text style={featureItem}>🏝️ Interaktive Karte mit echten Spots</Text>
            <Text style={featureItem}>🗺️ Intelligente Tagespläne</Text>
            <Text style={featureItem}>⭐ Geheimtipps von Marc & Melo</Text>
            <Text style={featureItem}>📍 Live Updates aus Khao Lak</Text>
            <Text style={featureItem}>🎧 Audio & Story Guides</Text>

          </Section>

          {/* CTA */}
          <Section style={center}>
            <Link href="https://khao lak.app" style={cta}>
              👉 Deinen ersten echten Spot öffnen
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

/* ================= STYLES ================= */

const main = {
  backgroundColor: "#f6f7fb",
  fontFamily: "Arial, sans-serif",
};

const container = {
  width: "600px",
  margin: "0 auto",
  backgroundColor: "#ffffff",
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

/* ✅ NEW INTRO BOX */
const introBox = {
  backgroundColor: "#ecfeff",
  margin: "18px",
  padding: "18px",
  borderRadius: "12px",
  borderLeft: "4px solid #0f766e",
};

const introTitle = {
  fontSize: "16px",
  fontWeight: "bold",
  color: "#0f172a",
  marginBottom: "8px",
};

const introText = {
  fontSize: "14px",
  color: "#334155",
  lineHeight: "1.6",
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
  marginBottom: "8px",
  color: "#0f172a",
};

const featureBox = {
  backgroundColor: "#f1f5f9",
  margin: "18px",
  padding: "16px",
  borderRadius: "12px",
};

const featureTitle = {
  fontWeight: "bold",
  fontSize: "15px",
  marginBottom: "10px",
};

const featureText = {
  fontSize: "14px",
  color: "#475569",
  lineHeight: "1.6",
  marginBottom: "10px",
};

const featureItem = {
  fontSize: "14px",
  color: "#0f172a",
  marginBottom: "6px",
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
  margin: "26px 0",
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