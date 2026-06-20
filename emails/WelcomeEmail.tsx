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

          {/* BRAND BAR */}
          <Section style={topBar}>
            <Text style={topBarText}>
              🌴 Khao Lak Insider · Travel smarter
            </Text>
          </Section>

          {/* HOOK */}
          <Heading style={h1}>
            Du hast gerade den touristischen Blick verlassen.
          </Heading>

          <Text style={lead}>
            Ab jetzt siehst Du Khao Lak anders.
            Nicht als Reiseziel — sondern als Sammlung echter Momente.
          </Text>

          {/* CINEMATIC STORY */}
          <Section style={storyBox}>
            <Text style={storyText}>
              06:47 Uhr · Coconut Beach
            </Text>

            <Text style={storyText}>
              Der Strand ist leer.
              Kein Verkehr. Kein Stimmengewirr.
              Nur das leise Rollen der Wellen.
            </Text>

            <Text style={storyText}>
              Ein kleiner Fischer schiebt sein Boot ins Wasser.
              Du merkst, dass dieser Moment nicht im Reiseführer steht.
            </Text>

            <Text style={storyTextBold}>
              Genau diese Momente bekommst Du hier.
            </Text>
          </Section>

          <Hr style={hr} />

          {/* VALUE SHIFT (no features, only promises) */}
          <Section style={grid}>
            <Text style={gridItem}>Orte, die niemand fotografiert</Text>
            <Text style={gridItem}>Essen, das nur Locals kennen</Text>
            <Text style={gridItem}>Infos direkt von vor Ort</Text>
            <Text style={gridItem}>Updates, bevor sie im Reiseführer stehen</Text>
          </Section>

          <Hr style={hr} />

          {/* MARC & MELO (PERSONAL STORY) */}
          <Section style={teamBox}>
            <Text style={teamTitle}>
              Marc & Melo sind vor Ort
            </Text>

            <Text style={teamText}>
              Sie verbringen seit über 13 Jahren regelmäßig mehrere Monate im Jahr in Khao Lak.

            Und genau deshalb zeigen sie dir den Ort so, wie ihn kaum ein Tourist je erlebt —
            ehrlich, direkt und abseits der klassischen Touri-Routen.
            </Text>
          </Section>

          {/* CTA */}
          <Section style={center}>
            <Link href="https://khaolak.app" style={cta}>
              👉 Deinen ersten echten Spot öffnen
            </Link>
          </Section>

          {/* MICRO FOOTER */}
          <Text style={footer}>
            Khao Lak Insider · No filters. Just places.
          </Text>

        </Container>
      </Body>
    </Html>
  );
}

/* ===================== STYLES ===================== */

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

const h1 = {
  fontSize: "32px",
  color: "#0f172a",
  margin: "18px 18px 10px",
  lineHeight: "1.2",
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
  marginBottom: "8px",
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