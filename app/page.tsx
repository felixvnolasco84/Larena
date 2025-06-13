import Image from "next/image";
import HeroImageSecond from "@/public/images/HeroImageSecond.png";
import FlatDiagramMobile from "@/public/images/Planta-Cuadrado (mobile).png";
import FlatDiagramDesktop from "@/public/images/Planta-Horizontal (desktop).png";
import Construction from "@/public/images/Construction.png";
import Logo from "@/public/images/logo-white.svg";
import { GiordanoGoldSerif } from "@/styles/fonts";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

import FeaturedServicesCarouselSquare from "@/components/FeaturedServicesCarousel/FeaturedServicesCarouselSquare";
import MapComponent from "@/components/MapComponent";

export default function Home() {
  return (
    <div className="flex flex-col gap-12 lg:gap-y-52 py-8">

      <div className="relative flex h-[600px] min-w-max justify-center overflow-x-hidden lg:h-screen mx-4 rounded-[15px] overflow-hidden">
        <Image
          src="https://f5z6vohtd8.ufs.sh/f/9xW4M4QjXVSmNyx50YT0bMtvxjAzWSL2R3oJF7mhwBaIUQsn"
          alt="Rombo"
          fill
          objectFit="cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 100vw"
        />
        <div className="absolute top-0 left-0 z-10 w-full h-full custom-grade"></div>
        <div className="absolute left-0  -bottom-[2px] lg:-bottom-2 flex flex-col items-center justify-center gap-2 w-full z-20 px-3 lg:px-16">
          <Image className="w-full" src={Logo} alt="Rombo" />
        </div>
      </div>
      <div className="mx-auto flex w-full flex-col justify-center 2xl:container items-center px-4">
        <h1
          className={`${GiordanoGoldSerif.className} text-3xl lg:text-2xl xl:text-4xl 2xl:text-5xl 2xl:leading-[55px] w-full text-center`}
        >
          Exclusive Oceanview Residences in San José del Cabo
        </h1>
        <div className="flex w-full flex-col gap-8 xl:gap-16 mt-6 items-center">
          <p className={GiordanoGoldSerif.className + "text-lg lg:text-base xl:text-2xl 2xl:text-3xl text-center text-[#555555] lg:leading-10 xl:leading-10 2xl:leading-10"}>
            Larena Is Located In The Prestigious Campestre San José Del Cabo, Surrounded By Golf Courses <br /> And Just Minutes From The Beach. Featuring 4-Bedroom Residences With Private Terraces, <br /> Premium Finishes, And Exclusive Amenities Designed For A Refined Coastal Lifestyle.
          </p>
          <Link href="https://recorrido-virtual-larena.vercel.app/" target="_blank" rel="noopener noreferrer">
            <Button className="w-fit bg-[#4A4A4A] text-white rounded-[8px] lg:text-[20px]" variant="outline" size="lg">
              EXPLORE 360 VIRTUAL TOUR
            </Button>
          </Link>
        </div>
      </div>
      <div className="px-4 lg:px-8">
        <FeaturedServicesCarouselSquare />
      </div>

      {/* <HomeGallery /> */}

      <div className="mx-auto flex w-full flex-col justify-center 2xl:container items-center px-4">
        <h1
          className={`${GiordanoGoldSerif.className} text-3xl xl:text-4xl 2xl:text-5xl 2xl:leading-[55px] w-full text-center`}
        >
          Spacious 3- and 4-bedroom units <br /> designed for comfort
        </h1>
        <div className="flex w-full flex-col gap-8 xl:gap-16 mt-6 items-center">
          <p className="text-lg lg:text-xl xl:text-2xl 2xl:text-3xl 2xl:leading-[40px] text-center">
            GARDEN AND PENTHOUSE OPTIONS <br />

            MARBLE FLOORS, CUSTOM KITCHENS BY PIACERE, WOLF & <br />

            SUB-ZERO APPLIANCES <br />

            HURRICANE-RESISTANT WINDOWS <br />

            2 PARKING SPOTS PLUS STORAGE
          </p>
        </div>
      </div>

      <div className="grid gap-4 px-4 lg:px-8">

        <div className="aspect-square lg:hidden overflow-hidden">
          <Image
            src={FlatDiagramMobile}
            alt="Rombo"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 100vw"
            className="w-full h-full  rounded-[15px] object-cover"
          />
        </div>
        <div className="aspect-video hidden lg:block overflow-hidden">
          <Image
            src={FlatDiagramDesktop}
            alt="Rombo"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 100vw"
            className="w-full h-full  rounded-[15px] object-cover"
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-4 ">
          <video src="https://f5z6vohtd8.ufs.sh/f/9xW4M4QjXVSmByDyTAhXkQnr7l1z6qGBxO4htjIUFPevN2uM" autoPlay loop muted className="w-full h-full object-cover rounded-[15px]" />
          <video src="https://f5z6vohtd8.ufs.sh/f/9xW4M4QjXVSm9wBLWQjXVSmdgLybrsq16Aa7hlYMnpKPteif" autoPlay loop muted className="w-full h-full object-cover rounded-[15px]" />
        </div>
        <MapComponent />

      </div>


    </div>
  );
}
