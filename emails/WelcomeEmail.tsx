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

          {/* HERO */}
          <Img
            src="https://pub-e91d905941ab460b95ac5248c28e16f3.r2.dev/emails/welcome/welcome_hero.jpg"
            style={hero}
            alt="Khao Lak Insider"
          />

          {/* INTRO */}
          <Section style={introBox}>
            <Heading style={h1}>
              Du bist jetzt nicht mehr nur Besucher.
            </Heading>

            <Text style={lead}>
              Ab jetzt siehst du Khao Lak so, wie es wirklich ist —
              nicht als Reiseziel, sondern als Sammlung echter Orte, Momente und Erlebnisse.
            </Text>
          </Section>

          {/* SECTION 1 */}
          <Section style={card}>
            <Img
              src="https://pub-e91d905941ab460b95ac5248c28e16f3.r2.dev/emails/welcome/coconut_beach.jpg"
              style={cardImg}
            />
            <Text style={cardTitle}>🌅 06:47 Uhr · Coconut Beach</Text>
            <Text style={cardText}>
              Kein Lärm. Kein Touribus. Nur Licht, Wellen und ein kleiner Fischer.
            </Text>
          </Section>

          {/* SECTION 2 */}
          <Section style={cardAlt}>
            <Img
              src="https://pub-e91d905941ab460b95ac5248c28e16f3.r2.dev/emails/welcome/hidden_food.jpg"
              style={cardImg}
            />
            <Text style={cardTitle}>🍜 Food Spots, die du nicht im Guide findest</Text>
            <Text style={cardText}>
              Kleine Küchen. 3 Tische. Familienrezepte seit Jahrzehnten.
            </Text>
          </Section>

          {/* SECTION 3 */}
          <Section style={card}>
            <Img
              src="https://pub-e91d905941ab460b95ac5248c28e16f3.r2.dev/emails/welcome/boat.jpg"
              style={cardImg}
            />
            <Text style={cardTitle}>🛶 Orte ohne Touristenroute</Text>
            <Text style={cardText}>
              Kleine Buchten, Boote, Strände ohne Namen auf Google Maps.
            </Text>
          </Section>

          <Hr style={hr} />

          {/* MARC & MELO */}
          <Section style={teamBox}>
            <Text style={teamTitle}>Marc & Melo vor Ort</Text>
            <Text style={teamText}>
              Über 13 Jahre Erfahrung in Khao Lak – mehrere Monate pro Jahr vor Ort.
              Nicht als Touristen. Sondern als Menschen, die dort leben, wo andere Urlaub machen.
            </Text>
          </Section>

          <Hr style={hr} />

          {/* CTA */}
          <Section style={center}>
            <Link href="https://khaolak.app" style={cta}>
              🌴 Erste echte Spots entdecken
            </Link>
          </Section>

          {/* FOOTER */}
          <Text style={footer}>
            Khao Lak Insider · Travel smarter
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
  width: "600px",
  margin: "0 auto",
  backgroundColor: "#ffffff",
};

const hero = {
  width: "100%",
};

const introBox = {
  padding: "18px",
};

const h1 = {
  fontSize: "22px",
  color: "#0f172a",
  marginBottom: "10px",
};

const lead = {
  fontSize: "15px",
  color: "#334155",
  lineHeight: "1.6",
};

const card = {
  margin: "18px",
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  overflow: "hidden",
};

const cardAlt = {
  margin: "18px",
  backgroundColor: "#f8fafc",
  borderRadius: "12px",
  overflow: "hidden",
};

const cardImg = {
  width: "100%",
  display: "block",
};

const cardTitle = {
  fontSize: "15px",
  fontWeight: "bold",
  margin: "10px 12px 4px",
};

const cardText = {
  fontSize: "14px",
  color: "#475569",
  margin: "0 12px 12px",
};

const teamBox = {
  backgroundColor: "#f1f5f9",
  margin: "18px",
  padding: "14px",
  borderRadius: "12px",
};

const teamTitle = {
  fontWeight: "bold",
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
  backgroundColor: "#0f766e",
  color: "#fff",
  padding: "14px 20px",
  borderRadius: "10px",
  textDecoration: "none",
  fontWeight: "bold",
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