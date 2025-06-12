import CHK from "@/public/images/CHK.png";
import IDS from "@/public/images/IDS.png";
import OLAR from "@/public/images/OLAR.png";
// import Ogarrio from "@/public/images/Ogarrio.png";
import Image from "next/image";
import LARENAALT from "@/public/images/LARENA LOGO ALT.png";
import FooterContactForm from "../Forms/FooterContactForm";
import { GiordanoGoldSerif } from "@/styles/fonts";

export default function FooterComponent() {
  return (
    <div id="contact" className="flex flex-col border-t border-t-[#F5F5F5] bg-[#F7F7F7] pt-24 lg:gap-20 mx-4 lg:mx-8 rounded-[15px] ">
      <div className="mx-auto flex w-11/12 flex-col gap-12">
        <div className="flex flex-col w-full lg:w-1/2">
          <h3
            className={`${GiordanoGoldSerif.className} text-3xl xl:text-4xl 2xl:text-5xl 2xl:leading-[55px] w-full text-left`}
          >
            Contact us now
          </h3>
          <p className="text-lg lg:text-xl xl:text-2xl 2xl:text-3xl 2xl:leading-[40px] text-left">
            Our Team Is Here To Help With Any Questions, Schedule A Visit, Or Share The Full Brochure With You. Fill Out The Form Or Reach Us Directly — We Look Forward To Connecting With You.
          </p>
        </div>

        <FooterContactForm />
      </div>

      <div className="flex flex-col py-24 lg:py-0">
        {/* <div className="flex w-full items-center justify-center">
          <Image
            className="max-w-[210px] lg:max-w-[210px]"
            src={Ogarrio}
            alt="Rombo"
          />
        </div> */}

        <div className="flex flex-row items-center justify-center gap-8 text-[#555555] lg:gap-12">
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
