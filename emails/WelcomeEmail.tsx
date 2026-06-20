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
          />

          {/* INTRO */}
          <Section style={introBox}>
            <Heading style={h1}>
              Du hast gerade den touristischen Blick verlassen.
            </Heading>

            <Text style={lead}>
              Ab jetzt siehst Du Khao Lak anders — nicht als Reiseziel, sondern als Sammlung echter Orte und Momente.
            </Text>
          </Section>

          <Hr style={hr} />

          {/* SECTION 1 */}
          <Section style={card}>
            <table width="100%">
              <tr>

                <td width="40%" style={{ verticalAlign: "top" }}>
                  <Img
                    src="https://pub-e91d905941ab460b95ac5248c28e16f3.r2.dev/emails/welcome/coconut_beach.jpg"
                    style={img}
                  />
                </td>

                <td width="60%" style={textCol}>
                  <Text style={title}>🌅 06:47 Uhr · Coconut Beach</Text>

                  <Text style={text}>
                    Kein Lärm. Kein Touribus. Nur Licht, Wellen und ein kleiner Fischer.
                  </Text>

                  <Text style={highlight}>
                    Genau solche Momente wirst Du hier entdecken.
                  </Text>
                </td>

              </tr>
            </table>
          </Section>

          {/* SECTION 2 */}
          <Section style={card}>
            <table width="100%">
              <tr>

                <td width="40%" style={{ verticalAlign: "top" }}>
                  <Img
                    src="https://pub-e91d905941ab460b95ac5248c28e16f3.r2.dev/emails/welcome/food.jpg"
                    style={img}
                  />
                </td>

                <td width="60%" style={textCol}>
                  <Text style={title}>🍜 Food Spots wie Locals sie kennen</Text>

                  <Text style={text}>
                    Kleine Küchen, frische Gerichte, Orte ohne Google Maps Bewertungen.
                  </Text>

                  <Text style={highlight}>
                    Genau das zeigen wir dir.
                  </Text>
                </td>

              </tr>
            </table>
          </Section>

          {/* SECTION 3 */}
          <Section style={card}>
            <table width="100%">
              <tr>

                <td width="40%" style={{ verticalAlign: "top" }}>
                  <Img
                    src="https://pub-e91d905941ab460b95ac5248c28e16f3.r2.dev/emails/welcome/boat.jpg"
                    style={img}
                  />
                </td>

                <td width="60%" style={textCol}>
                  <Text style={title}>🛶 Orte ohne Touristenroute</Text>

                  <Text style={text}>
                    Kleine Buchten, versteckte Strände, echte Thailand-Momente.
                  </Text>

                  <Text style={highlight}>
                    Abseits von allem, was du kennst.
                  </Text>
                </td>

              </tr>
            </table>
          </Section>

          <Hr style={hr} />

          {/* MARC & MELO */}
          <Section style={box}>
            <Text style={boxTitle}>Marc & Melo vor Ort</Text>

            <Text style={boxText}>
              Über 13 Jahre Erfahrung in Khao Lak — mehrere Monate pro Jahr direkt vor Ort.
              Nicht als Touristen, sondern als Menschen, die dort wirklich leben.
            </Text>
          </Section>

          <Hr style={hr} />

          {/* WEEKLY FEATURE */}
          <Section style={box}>
            <Text style={boxTitle}>📱 Die App entsteht gerade</Text>

            <Text style={boxText}>
              Jede Woche zeigen wir dir ein neues Feature der kommenden Khao Lak App.
            </Text>

            <Text style={list}>🏝️ Interaktive Karte mit echten Spots</Text>
            <Text style={list}>🗺️ Tagesplanung für deinen Urlaub</Text>
            <Text style={list}>⭐ Geheimtipps von Marc & Melo</Text>
            <Text style={list}>📍 Live Updates aus Khao Lak</Text>
          </Section>

          {/* CTA */}
          <Section style={center}>
            <Link href="https://khaolak.app" style={cta}>
              👉 Erste echte Spots entdecken
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
};

const lead = {
  fontSize: "14px",
  color: "#334155",
  lineHeight: "1.6",
};

const card = {
  margin: "14px 18px",
  border: "1px solid #e5e7eb",
  borderRadius: "12px",
  overflow: "hidden",
};

const img = {
  width: "100%",
  display: "block",
};

const textCol = {
  padding: "12px",
  verticalAlign: "top",
};

const title = {
  fontSize: "14px",
  fontWeight: "bold",
  marginBottom: "6px",
};

const text = {
  fontSize: "13px",
  color: "#475569",
  marginBottom: "6px",
};

const highlight = {
  fontSize: "13px",
  color: "#0f766e",
  fontWeight: "bold",
};

const box = {
  backgroundColor: "#f1f5f9",
  margin: "18px",
  padding: "14px",
  borderRadius: "12px",
};

const boxTitle = {
  fontWeight: "bold",
  marginBottom: "6px",
};

const boxText = {
  fontSize: "13px",
  color: "#475569",
  lineHeight: "1.6",
};

const list = {
  fontSize: "13px",
  marginTop: "6px",
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
  margin: "18px",
  borderColor: "#e5e7eb",
};

const footer = {
  fontSize: "12px",
  color: "#94a3b8",
  textAlign: "center" as const,
  margin: "20px 0",
};