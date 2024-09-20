"use server";

import { Resend } from "resend";
import ContactEmailTemplate from "./emails/contactEmailTemplate";

const resend = new Resend(process.env.RESEND_API_KEY);

type ContactEmailTemplateProps = {
  name: string;
  email: string;
  phone: string;
  interest: string;
};

export async function sendContactEmail({
  email,
  name,
  phone,
  interest,
}: ContactEmailTemplateProps) {
  try {
    const data = await resend.emails.send({
      from: "info@larena.mx",
      to: [email],
      cc: ["info@larena.mx"],
      subject: `${name} wants to get in touch | LARENA`,
      react: ContactEmailTemplate({
        email,
        name,
        phone,
        interest,
      }),
    });
    console.log(data);
    return { success: true, data };
  } catch (error) {
    console.log(error);
    return { success: false, error };
  }

  // if (result.error) {
  //   return { success: false, error: result.error.format() };
  // }
}
