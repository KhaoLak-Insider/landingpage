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
            style={hero}
          />

          {/* ================= INTRO ================= */}
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

          {/* ================= STORY ================= */}
          <Section style={card}>
  <table width="100%" cellPadding="0" cellSpacing="0" style={{ tableLayout: "fixed" }}>
    <tr>

      <td style={storyLeft}>
        <Text style={storyTitle}>06:47 Uhr · Coconut Beach</Text>

        <Text style={storyText}>
          Kein Lärm. Kein Touribus. Nur Licht, Wellen und ein kleiner Fischer,
          der sein Boot ins Wasser schiebt.
        </Text>

        <Text style={storyHighlight}>
          Genau solche Momente wirst du hier entdecken.
        </Text>
      </td>

      {/* 🔥 FIXED IMAGE COLUMN */}
      <td width="120" style={{ verticalAlign: "top", width: "120px" }}>
        <Img
          src="https://pub-e91d905941ab460b95ac5248c28e16f3.r2.dev/emails/welcome/sunset.jpg"
          width={120}
          height={120}
          alt="Sunset"
          style={{
            width: "120px",
            maxWidth: "120px",
            height: "auto",
            display: "block",
            borderRadius: "10px",
          }}
        />
      </td>

    </tr>
  </table>
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

          {/* ================= MARC & MELO ================= */}
          <Section style={card}>
            <table width="100%">
              <tr>

                <td width="90" style={{ verticalAlign: "top" }}>
                  <Img
                    src="https://via.placeholder.com/120x120?text=Marc+%26+Melo"
                    style={circleImage}
                  />
                </td>

                <td style={{ paddingLeft: "12px", verticalAlign: "top" }}>
                  <Text style={teamTitle}>Marc & Melo vor Ort</Text>

                  <Text style={teamText}>
                    Seit über 13 Jahren verbringen sie regelmäßig mehrere Monate in Khao Lak.
                    Sie kennen Orte, die kein Reiseführer zeigt.
                  </Text>
                </td>

              </tr>
            </table>
          </Section>

          <Hr style={hr} />

          {/* ================= APP SECTION ================= */}
          <Section style={card}>
            <Text style={featureTitle}>
              📱 So wird die Khao Lak App aussehen
            </Text>

            <Text style={featureText}>
              Aus diesem Newsletter entsteht eine echte App, die Khao Lak vor Ort verständlich macht.
            </Text>

            <Text style={featureItem}>🏝️ Interaktive Karte mit echten Spots</Text>
            <Text style={featureItem}>🗺️ Tagesplanung für deinen Urlaub</Text>
            <Text style={featureItem}>⭐ Geheimtipps von Marc & Melo</Text>
            <Text style={featureItem}>🎧 Audio Guides vor Ort</Text>

            <Img
              src="https://via.placeholder.com/300x600?text=App+Mockup"
              style={appMockup}
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
  padding: "18px",
  margin: "18px",
  borderRadius: "14px",
  border: "1px solid #e5e7eb",
};

const introBadge = {
  fontSize: "12px",
  color: "#0f766e",
  fontWeight: "bold",
};

const introTitle = {
  fontSize: "20px",
  fontWeight: "bold",
};

const introText = {
  fontSize: "14px",
  color: "#475569",
  lineHeight: "1.6",
};

/* CARD */
const card = {
  margin: "18px",
  padding: "16px",
  borderRadius: "12px",
  border: "1px solid #eee",
};

/* STORY */
const storyLeft = {
  verticalAlign: "top",
  paddingRight: "12px",
};

const storyRight = {
  verticalAlign: "top",
};

const storyTitle = {
  fontSize: "14px",
  fontWeight: "bold",
};

const storyText = {
  fontSize: "14px",
  color: "#0f172a",
  lineHeight: "1.6",
};

const storyHighlight = {
  fontSize: "14px",
  color: "#0f766e",
  fontWeight: "bold",
};

/* 🔥 FIX: smaller image */
const sideImage = {
  width: "120px",
  borderRadius: "10px",
  display: "block",
};

/* GRID */
const grid = {
  margin: "0 18px",
};

const gridItem = {
  fontSize: "14px",
  marginBottom: "6px",
};

/* TEAM */
const teamTitle = {
  fontWeight: "bold",
};

const teamText = {
  fontSize: "14px",
  color: "#475569",
  lineHeight: "1.6",
};

const circleImage = {
  width: "80px",
  height: "80px",
  borderRadius: "50%",
};

/* FEATURE */
const featureTitle = {
  fontWeight: "bold",
  marginBottom: "10px",
};

const featureText = {
  fontSize: "14px",
  color: "#475569",
};

const featureItem = {
  fontSize: "14px",
  marginBottom: "6px",
};

const appMockup = {
  width: "160px",
  marginTop: "12px",
  borderRadius: "12px",
};

/* CTA */
const center = {
  textAlign: "center" as const,
  margin: "24px 0",
};

const cta = {
  backgroundColor: "#0f766e",
  color: "#fff",
  padding: "14px 22px",
  borderRadius: "10px",
  textDecoration: "none",
  fontWeight: "bold",
};

const hr = {
  margin: "18px",
  borderColor: "#e5e7eb",
};

const footer = {
  textAlign: "center" as const,
  fontSize: "12px",
  color: "#94a3b8",
  margin: "20px 0",
};