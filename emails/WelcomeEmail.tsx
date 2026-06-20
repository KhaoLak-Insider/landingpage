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

          {/* ================= HERO ================= */}
          <Img
            src="https://pub-e91d905941ab460b95ac5248c28e16f3.r2.dev/emails/welcome/welcome_hero.jpg"
            alt="Khao Lak Hero"
            style={hero}
          />

          {/* ================= TOP INTRO BOX ================= */}
          <Section style={introCard}>
            <Text style={introBadge}>
              🌴 Khao Lak Insider · Travel smarter
            </Text>

            <Text style={introTitle}>
              Du hast gerade den touristischen Blick verlassen.
            </Text>

            <Text style={introText}>
              Ab jetzt siehst du Khao Lak anders — nicht als Reiseziel, sondern als Sammlung echter Orte und Momente.
            </Text>
          </Section>

          {/* ================= STORY + SUNSET IMAGE ================= */}
          <Section style={twoCol}>
            <Section style={textCol}>
              <Text style={storyTitle}>06:47 Uhr · Coconut Beach</Text>

              <Text style={storyText}>
                Kein Lärm. Kein Touribus. Nur Licht, Wellen und ein kleiner Fischer,
                der sein Boot ins Wasser schiebt.
              </Text>

              <Text style={storyTextBold}>
                Genau solche Momente wirst du hier entdecken.
              </Text>
            </Section>

            {/* SUNSET PLACEHOLDER IMAGE */}
            <Img
              src="https://YOUR-R2-BUCKET/sunset-placeholder.jpg"
              alt="Sunset Khao Lak"
              style={sideImage}
            />
          </Section>

          <Hr style={hr} />

          {/* ================= ICON GRID ================= */}
          <Section style={grid}>
            <Text style={gridItem}>🏝️ Versteckte Orte</Text>
            <Text style={gridItem}>🍜 Food & Genuss</Text>
            <Text style={gridItem}>🧭 Insider Wissen</Text>
            <Text style={gridItem}>📍 Aktuelle Updates</Text>
          </Section>

          <Hr style={hr} />

          {/* ================= MARC & MELO SECTION ================= */}
          <Section style={twoCol}>
            <Img
              src="https://YOUR-R2-BUCKET/marc-melo.jpg"
              alt="Marc & Melo"
              style={circleImage}
            />

            <Section style={textCol}>
              <Text style={teamTitle}>Marc & Melo vor Ort</Text>

              <Text style={teamText}>
                Seit über 13 Jahren verbringen sie regelmäßig mehrere Monate in Khao Lak.
                Sie kennen Orte, die kein Reiseführer zeigt.
              </Text>
            </Section>
          </Section>

          <Hr style={hr} />

          {/* ================= APP PREVIEW SECTION ================= */}
          <Section style={twoCol}>
            <Section style={textCol}>
              <Text style={featureTitle}>
                📱 So wird die Khao Lak App aussehen
              </Text>

              <Text style={featureText}>
                Aus diesem Newsletter entsteht eine echte App, die Khao Lak vor Ort verständlich macht.
              </Text>

              <Text style={featureText}>
                Jede Woche zeigen wir dir ein neues Feature.
              </Text>

              <Text style={featureItem}>🏝️ Interaktive Karte mit echten Spots</Text>
              <Text style={featureItem}>🗺️ Tagesplanung für deinen Urlaub</Text>
              <Text style={featureItem}>⭐ Geheimtipps von Marc & Melo</Text>
              <Text style={featureItem}>🎧 Audio Guides vor Ort</Text>
            </Section>

            {/* APP MOCKUP PLACEHOLDER */}
            <Img
              src="https://YOUR-R2-BUCKET/app-mockup.jpg"
              alt="App Mockup"
              style={sideImage}
            />
          </Section>

          {/* ================= CTA ================= */}
          <Section style={center}>
            <Link href="https://khaolak.app" style={cta}>
              👉 Ersten echten Spot entdecken
            </Link>
          </Section>

          {/* ================= FOOTER ================= */}
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

/* INTRO */
const introCard = {
  backgroundColor: "#ffffff",
  margin: "18px",
  padding: "18px",
  borderRadius: "14px",
  border: "1px solid #e5e7eb",
};

const introBadge = {
  fontSize: "12px",
  color: "#0f766e",
  fontWeight: "bold",
  marginBottom: "8px",
};

const introTitle = {
  fontSize: "20px",
  fontWeight: "bold",
  color: "#0f172a",
  marginBottom: "8px",
};

const introText = {
  fontSize: "14px",
  color: "#475569",
  lineHeight: "1.6",
};

/* 2 COLUMN LAYOUT */
const twoCol = {
  display: "flex",
  flexDirection: "row" as const,
  gap: "12px",
  margin: "18px",
  alignItems: "center",
};

const textCol = {
  flex: 1,
};

const sideImage = {
  width: "200px",
  height: "auto",
  borderRadius: "12px",
  objectFit: "cover" as const,
};

const circleImage = {
  width: "120px",
  height: "120px",
  borderRadius: "50%",
  objectFit: "cover" as const,
};

/* STORY */
const storyTitle = {
  fontSize: "14px",
  fontWeight: "bold",
  marginBottom: "8px",
};

const storyText = {
  fontSize: "14px",
  color: "#0f172a",
  lineHeight: "1.6",
  marginBottom: "10px",
};

const storyTextBold = {
  fontSize: "14px",
  color: "#0f766e",
  fontWeight: "bold",
};

/* GRID */
const grid = {
  padding: "0 18px",
};

const gridItem = {
  fontSize: "14px",
  marginBottom: "6px",
  color: "#0f172a",
};

/* TEAM */
const teamTitle = {
  fontWeight: "bold",
  marginBottom: "6px",
};

const teamText = {
  fontSize: "14px",
  color: "#475569",
  lineHeight: "1.6",
};

/* FEATURE */
const featureTitle = {
  fontSize: "15px",
  fontWeight: "bold",
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
  marginBottom: "6px",
  color: "#0f172a",
};

/* CTA */
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

/* HR */
const hr = {
  margin: "20px 18px",
  borderColor: "#e5e7eb",
};

/* FOOTER */
const footer = {
  fontSize: "12px",
  color: "#94a3b8",
  textAlign: "center" as const,
  margin: "20px 0",
};