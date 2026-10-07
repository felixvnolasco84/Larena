import Image from "next/image";
import Link from "next/link";
import logo from "@/public/images/LARENALOGO.png";
import KycProvider from "./Provider";
import type { ReactNode } from "react";

export default function KycShell({ children }: { children: ReactNode }) {
  return (
    <div className="kyc-shell">
      <header className="kyc-header">
        <Link href="/" aria-label="Larena, inicio">
          <Image src={logo} alt="LARENA" width={190} priority />
        </Link>
        <span>OGC</span>
      </header>
      <main className="kyc-main">
        <KycProvider>{children}</KycProvider>
      </main>
      <footer className="kyc-footer">
        <span>LARENA · OGC</span>
        <Link href="/kyc/aviso-privacidad" className="kyc-link">
          Aviso KYC / Privacy
        </Link>
        <Link href="/">larena.mx</Link>
      </footer>
    </div>
  );
}
