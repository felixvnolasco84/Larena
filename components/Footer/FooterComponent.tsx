import CHK from "@/public/images/CHK.png";
import IDS from "@/public/images/IDS.png";
import OLAR from "@/public/images/OLAR.png";
import Ogarrio from "@/public/images/Ogarrio.png";
import Image from "next/image";
import LARENAALT from "@/public/images/LARENA LOGO ALT.png";
import FooterContactForm from "../Forms/FooterContactForm";

export default function FooterComponent() {
  return (
    <div className="flex w-full flex-col gap-12 border-t border-t-[#F5F5F5] bg-[#424D5E] pt-24">
      <div className="mx-auto flex w-11/12 flex-col gap-12 2xl:container lg:flex-row">
        <Image className="h-fit max-w-[160px]" src={LARENAALT} alt="Rombo" />
        <FooterContactForm />
      </div>

      <div className="flex flex-col items-center justify-center gap-8 py-24 text-[#F5F5F5] lg:flex-row lg:gap-12 lg:py-0">
        <Image className="max-w-[120px] lg:max-w-[140px]" src={Ogarrio} alt="Rombo" />
        <Image className="max-w-[120px] lg:max-w-[140px]" src={IDS} alt="Rombo" />
        <Image className="max-w-[120px] lg:max-w-[140px]" src={CHK} alt="Rombo" />
        <Image className="max-w-[120px] lg:max-w-[140px]" src={OLAR} alt="Rombo" />
      </div>
    </div>
  );
}
