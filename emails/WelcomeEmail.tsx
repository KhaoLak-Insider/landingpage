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

          {/* HERO IMAGE */}
          <Img
            src="https://pub-e91d905941ab460b95ac5248c28e16f3.r2.dev/emails/welcome/welcome_hero.jpg"
            alt="Khao Lak Insider"
            style={hero}
          />

          {/* TITLE */}
          <Heading style={h1}>
            Willkommen im Khao Lak Insider 🌴
          </Heading>

          <Text style={text}>
            Schön, dass du dabei bist!
          </Text>

          <Text style={text}>
            Ab jetzt bekommst du echte Insider-Tipps, versteckte Strände,
            Food-Spots und aktuelle Updates direkt aus Khao Lak.
          </Text>

          <Hr style={hr} />

          {/* MARC & MELO SECTION */}
          <Section style={box}>
            <Text style={smallTitle}>Deine Guides vor Ort</Text>

            <Text style={text}>
              <b>Marc & Melo</b> zeigen dir Khao Lak so, wie es wirklich ist –
              ohne Touri-Blabla, nur echte Erfahrungen.
            </Text>
          </Section>

          <Hr style={hr} />

          {/* CTA */}
          <Section style={center}>
            <Text style={cta}>
              👉 Öffne die App und entdecke deinen ersten Spot
            </Text>
          </Section>

          <Text style={footer}>
            Khao Lak Insider · Travel smarter 🌴
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
  borderRadius: "12px",
  overflow: "hidden",
  padding: "20px",
};

const hero = {
  width: "100%",
  borderRadius: "12px",
};

const h1 = {
  fontSize: "24px",
  color: "#0f766e",
  marginTop: "20px",
};

const text = {
  fontSize: "14px",
  color: "#333",
  lineHeight: "1.6",
};

const hr = {
  margin: "20px 0",
  borderColor: "#eee",
};

const box = {
  backgroundColor: "#f0fdfa",
  padding: "12px",
  borderRadius: "10px",
};

const smallTitle = {
  fontSize: "12px",
  color: "#0f766e",
  fontWeight: "bold",
};

const center = {
  textAlign: "center" as const,
};

const cta = {
  fontSize: "14px",
  fontWeight: "bold",
  color: "#0f766e",
};

const footer = {
  marginTop: "20px",
  fontSize: "11px",
  color: "#999",
  textAlign: "center" as const,
};