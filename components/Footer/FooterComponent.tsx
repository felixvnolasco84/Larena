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

      <div className="flex flex-col py-24 lg:py-0">
        <div className="flex w-full items-center justify-center">
          <Image
            className="max-w-[210px] lg:max-w-[210px]"
            src={Ogarrio}
            alt="Rombo"
          />
        </div>

        <div className="flex flex-row items-center justify-center gap-8 text-[#F5F5F5] lg:gap-12">
          <Image
            className="max-w-[80px] lg:max-w-[110px]"
            src={IDS}
            alt="Rombo"
          />
          <Image
            className="max-w-[80px] lg:max-w-[110px]"
            src={CHK}
            alt="Rombo"
          />
          <Image
            className="max-w-[80px] lg:max-w-[110px]"
            src={OLAR}
            alt="Rombo"
          />
        </div>
      </div>
    </div>
  );
}
