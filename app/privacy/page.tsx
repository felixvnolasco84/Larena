import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Larena - Políticas de Privacidad",
  description: "Conoce nuestras Políticas de Privacidad.",
  alternates: {
    canonical: "https://www.larena.mx/politicas-de-privacidad",
  },
};

const post: string =
  `<p><strong>Privacy Policy</strong></p><p>Larena Private Residences</p><p>Last updated: March 2026</p><p>Larena Private Residences (Larena", "we", "our", or "us") respects your privacy and is committed to protecting the personal information you provide through our website, advertising campaigns, and lead forms.</p><p>This Privacy Policy explains how we collect, use, and protect your information when you interact with us online.</p><br><p>1. Information We Collect</p><ul><li>When you submit a form, request information, or interact with our advertisements, we may collect the following personal information:</li><li>First and last name</li><li>Email address</li><li>Phone number (if provided)</li><li>Investment or purchase preferences</li><li>Property interest information</li><li>Any additional information you voluntarily provide</li><li>We may also collect limited technical information automatically, such as:</li><li>IP address</li><li>Browser type</li><li>Device type</li><li>Interaction with our website or advertisements</li><br></ul><p>2. How We Use Your Information</p><ul><li>We use the information collected for the following purposes:</li><li>To provide information about Larena residences and availability</li><li>To respond to inquiries or requests for brochures</li><li>To communicate with potential buyers and investors</li><li>To improve our marketing and advertising campaigns</li><li>To analyze interest in our project and optimize user experience</li><li>Your information will only be used in connection with Larena Private Residences and related communications.</li><br></ul><p>3. Sharing of Information</p><ul><li>We do not sell or rent your personal information to third parties.</li><li>Your information may be shared only with:</li><li>Authorized members of the Larena sales team</li><li>Marketing platforms used to manage advertising campaigns (such as LinkedIn, Meta, or Google)</li><li>Technology providers that support our website or lead management systems</li><li>These providers are required to protect your information.</li><br></ul><p>4. Data Security</p><p>We implement reasonable administrative, technical, and physical safeguards designed to protect your personal information from unauthorized access, disclosure, or misuse.</p><p>However, no method of transmission over the internet is completely secure.</p><br><p>5. International Visitors</p><p>Larena markets residences to potential buyers in multiple countries including the United States and Canada.</p><p>By submitting your information, you consent to the processing of your data in accordance with this Privacy Policy.</p><br><p>6. Your Rights</p><p>You may request to:</p><ul><li>Access the personal data we hold about you</li><li>Correct inaccurate information</li><li>Request deletion of your personal data</li><li>Opt out of future communications</li></ul><p>To make such requests, please contact us using the information below.</p><br><p>7. Contact Information</p><p>If you have any questions regarding this Privacy Policy or how your information is used, please contact:</p><p>Larena Private Residences<br />San Jos&eacute; del Cabo, Baja California Sur, Mexico</p><p>Email: <a href="mailto:info@larena.mx">info@larena.mx</a></p><p>Website: <a href="https://larena.mx">https://larena.mx</a></p><p>8. Updates to This Policy</p><p>Larena may update this Privacy Policy from time to time. Any updates will be posted on this page with the revised date.</p>`;
export default function Page() {
  return (
    <div className="flex flex-col gap-y-7 px-4 py-12 text-justify lg:flex lg:gap-12 mx-4 lg:mx-8">      
      {
        post && (
          <div dangerouslySetInnerHTML={{ __html: post }} />
        )
      }
    </div>
  );
}
