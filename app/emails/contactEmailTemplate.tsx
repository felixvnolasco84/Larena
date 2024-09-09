import * as React from "react";
import Background from "@/public/images/topography.svg";
import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

type ContactEmailTemplateProps = {
  name: string;
  email: string;
  phone: string;
  interest: string;
};

export const ContactEmailTemplate = ({
  email,
  name,
  phone,
  interest,
}: ContactEmailTemplateProps) => (
  <Html>
    <Head />
    <Preview>{`${name} wants to get in touch | LARENA`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img
          src={
            "https://firebasestorage.googleapis.com/v0/b/larena-aa388.appspot.com/o/LARENALOGO.png?alt=media&token=fce2a0b2-dd84-495b-a98a-bed5b6fe419b"
          }
          alt="LARENA Logo"
          width={150}
        />
        <Section style={section}>
          <Text style={text}>
            Hi: <strong>{name}!</strong> <br />
            We have received your contact information and we will get in touch
            with you as soon as possible. <br />
          </Text>
          <Text style={text}>
            <strong>Here is the information you provided:</strong>
          </Text>
          <Text style={text}>
            Email: <strong>{email}</strong>
          </Text>
          <Text style={text}>
            Phone Number: <strong>{phone}</strong>
          </Text>
          <Text style={text}>
            I am Interested in: <strong>{interest}</strong>
          </Text>
        </Section>
        <Text style={links}>
          <Link href={"mailto:info@larena.mx"} style={link}>
            Contact Us
          </Link>{" "}
          {/* ・{" "}
          <Link href={"#"} style={link}>
            Privacy Policy
          </Link> */}
          ・{" "}
          <Link href={"https://www.larena.mx/"} style={link}>
            Website
          </Link>
        </Text>
        <Text style={footer}>larena.mx</Text>
      </Container>
    </Body>
  </Html>
);

export default ContactEmailTemplate;

const main: React.CSSProperties = {
  backgroundColor: "#ffffff",
  color: "#24292e",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji"',
  padding: "12px",
  // backgroundImage: `url(${Background})`,
};

const container = {
  maxWidth: "480px",
  margin: "0 auto",
  padding: "20px 0 48px",
};

const title = {
  fontSize: "21px",
  lineHeight: 1.25,
};

const section = {
  padding: "24px",
  marginTop: "24px",
  border: "solid 1px #dedede",
  borderRadius: "5px",
  textAlign: "center" as const,
};

const text = {
  margin: "0 0 10px 0",
  textAlign: "left" as const,
};

const button = {
  fontSize: "14px",
  backgroundColor: "#111827",
  color: "#ffffff",
  lineHeight: 1.5,
  borderRadius: "0.5em",
  padding: "12px 24px",
};

const links = {
  textAlign: "center" as const,
};

const link = {
  color: "#0366d6",
  fontSize: "12px",
};

const footer = {
  color: "#6a737d",
  fontSize: "12px",
  textAlign: "center" as const,
  marginTop: "60px",
};
