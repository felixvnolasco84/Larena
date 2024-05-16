import Image from "next/image";
import HeroImage from "@/public/images/HeroImage.png";
import Logo from "@/public/svg/Logo.svg";
import Campestre from "@/public/svg/Campestre San José del Cabo.svg";
import { GiordanoGoldSerif } from "@/styles/fonts";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import FeaturedServicesCarousel from "@/components/FeaturedServicesCarousel/FeaturedServicesCarousel";
import ContactForm from "@/components/Forms/ContactForm";
import HomeGallery from "@/components/Gallery/HomeGallery";

export default function Home() {
  return (
    <div className="flex flex-col gap-y-72">
      {/* Hero section */}
      <div className="relative flex h-screen min-w-max justify-center overflow-x-hidden">
        <Image src={HeroImage} alt="Rombo" layout="fill" objectFit="cover" />
        <div className="absolute top-12 flex flex-col items-center gap-2">
          <div className="relative h-[36px] w-[250px]">
            <Image src={Logo} alt="Rombo" layout="fill" objectFit="cover" />
          </div>
          <div className="relative h-[27px] w-[250px]">
            <Image
              src={Campestre}
              alt="Rombo"
              layout="fill"
              objectFit="cover"
            />
          </div>
        </div>
      </div>
      <div className="mx-auto flex w-11/12 justify-between 2xl:container">
        <h1
          className={`${GiordanoGoldSerif.className} lg:text-3xl xl:text-4xl 2xl:text-5xl text-left 2xl:leading-[55px] w-6/12 max-w-[742px]`}
        >
          Larena, where the golden sands meet the endless skies of San José del
          Cabo.
        </h1>
        <div className="flex w-6/12 flex-col gap-16">
          <p className="max-w-[835px] lg:text-xl xl:text-2xl 2xl:text-3xl 2xl:leading-[40px]">
            Located within the exclusive Campestre community in San José del
            Cabo, at the southern tip of the Baja California Peninsula, Larena
            offers a privileged lifestyle blending desert beauty with seaside
            allure. Experience the best of both worlds as you indulge in
            luxurious living amidst stunning natural landscapes.
          </p>
          <Button className="w-fit" variant="outline" size="lg">
            <div className="flex items-center gap-6">
              <span>GET IN TOUCH</span>
              <ArrowRight size={24} />
            </div>
          </Button>
        </div>
      </div>
      <FeaturedServicesCarousel />
      <div className="mx-auto flex w-11/12 flex-col gap-4 text-[#424D5E] 2xl:container">
        <h3 className={`${GiordanoGoldSerif.className} text-7xl`}>
          GET IN TOUCH
        </h3>
        <ContactForm />
      </div>
      <HomeGallery />
    </div>
  );
}
