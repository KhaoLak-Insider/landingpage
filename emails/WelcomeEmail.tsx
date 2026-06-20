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

          {/* HEADER */}
          <Heading style={h1}>
            Willkommen im Khao Lak Insider 🌴
          </Heading>

          <Text style={text}>
            Schön, dass du hier bist.
          </Text>

          <Text style={text}>
            Khao Lak ist kein Ort, den man einfach nur besucht.
            Es ist ein Ort, den man entdecken muss — abseits der Touristenrouten.
          </Text>

          <Hr style={hr} />

          {/* STORY BLOCK */}
          <Section style={box}>
            <Text style={bold}>Was du hier bekommst:</Text>

            <Text style={text}>
              👉 Echte Orte, die nicht in Reiseführern stehen
            </Text>

            <Text style={text}>
              👉 Food Spots, die nur Locals kennen
            </Text>

            <Text style={text}>
              👉 Strände ohne Menschenmassen
            </Text>

            <Text style={text}>
              👉 Updates direkt aus Khao Lak
            </Text>
          </Section>

          <Hr style={hr} />

          {/* MARC & MELO */}
          <Text style={text}>
            Marc & Melo sind direkt vor Ort unterwegs.
          </Text>

          <Text style={text}>
            Sie zeigen dir Khao Lak so, wie es wirklich ist —
            ohne Filter, ohne Touri-Inszenierung.
          </Text>

          <Hr style={hr} />

          {/* CTA */}
          <Section style={center}>
            <Text style={cta}>
              👉 Öffne die App und entdecke deinen ersten echten Spot
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