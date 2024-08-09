import Image from "next/image";
import HeroImage from "@/public/images/HeroImage.png";
import Logo from "@/public/svg/Logo.svg";
import Campestre from "@/public/svg/Campestre San José del Cabo.svg";
import { GiordanoGoldSerif, MantonicoExtraLight } from "@/styles/fonts";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import FeaturedServicesCarousel from "@/components/FeaturedServicesCarousel/FeaturedServicesCarousel";
import ContactForm from "@/components/Forms/ContactForm";
import HomeGallery from "@/components/Gallery/HomeGallery";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <div className="flex flex-col gap-24 lg:gap-52 xl:gap-y-72">
      {/* Hero section */}
      <div className="relative flex h-[600px] min-w-max justify-center overflow-x-hidden lg:h-screen">
        <Image
          src={HeroImage}
          alt="Rombo"
          fill
          objectFit="cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 100vw"
        />
        <div className="absolute top-12 flex flex-col items-center justify-center gap-2">
          <Image src={Logo} alt="Rombo" />
          <h2 className={cn("pr-2", MantonicoExtraLight.className)}>
            Campestre San José del Cabo
          </h2>
        </div>
      </div>
      <div className="mx-auto flex w-11/12 flex-col justify-between 2xl:container lg:flex-row lg:gap-8 xl:gap-0">
        <h1
          className={`${GiordanoGoldSerif.className} text-3xl xl:text-4xl 2xl:text-5xl text-left 2xl:leading-[55px] w-full lg:w-6/12 max-w-[742px]`}
        >
          Larena, where the golden sands meet the endless skies of San José del
          Cabo.
        </h1>
        <div className="flex w-full flex-col gap-8 lg:w-6/12 xl:gap-16">
          <p className="max-w-[835px] text-lg lg:text-xl xl:text-2xl 2xl:text-3xl 2xl:leading-[40px]">
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
        <h3
          className={`${GiordanoGoldSerif.className} text-3xl lg:text-5xl xl:text-6xl 2xl:text-7xl`}
        >
          GET IN TOUCH
        </h3>
        <ContactForm />
      </div>
      <HomeGallery />
    </div>
  );
}
