import CHK from "@/public/images/CHK.png";
import IDS from "@/public/images/IDS.png";
import OLAR from "@/public/images/OLAR.png";
import Ogarrio from "@/public/images/Ogarrio.png";
import Image from "next/image";
import Link from "next/link";

import LARENAALT from "@/public/images/LARENA LOGO ALT.png";
import { Button } from "../ui/button";
import ContactForm from "../Forms/ContactForm";
import FooterContactForm from "../Forms/FooterContactForm";

export default function FooterComponent() {
  return (
    <div className="flex w-full flex-col border-t border-t-[#F5F5F5] bg-[#424D5E] py-24">
      <div className="mx-auto flex w-11/12 gap-12 2xl:container">
        <Image className="h-fit max-w-[160px]" src={LARENAALT} alt="Rombo" />
        <FooterContactForm />
      </div>

      <div className="flex items-center justify-center gap-12 text-[#F5F5F5]">
        <Image className="max-w-[160px]" src={Ogarrio} alt="Rombo" />
        <Image className="max-w-[160px]" src={IDS} alt="Rombo" />
        <Image className="max-w-[160px]" src={CHK} alt="Rombo" />
        <Image className="max-w-[160px]" src={OLAR} alt="Rombo" />
      </div>
    </div>
  );
}
