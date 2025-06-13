import Image from "next/image";
import HeroImageSecond from "@/public/images/HeroImageSecond.png";
import Map from "@/public/images/Map.png";
import FlatDiagram from "@/public/images/FlatDiagram.png";
import Construction from "@/public/images/Construction.png";
import Logo from "@/public/images/logo-white.svg";
import { GiordanoGoldSerif } from "@/styles/fonts";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

import FeaturedServicesCarouselSquare from "@/components/FeaturedServicesCarousel/FeaturedServicesCarouselSquare";

export default function Home() {
  return (
    <div className="flex flex-col gap-12 lg:gap-y-52 py-8">

      <div className="relative flex h-[600px] min-w-max justify-center overflow-x-hidden lg:h-screen mx-4 rounded-[15px] overflow-hidden">
        <Image
          src={HeroImageSecond}
          alt="Rombo"
          fill
          objectFit="cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 100vw"
        />
        <div className="absolute top-0 left-0 z-10 w-full h-full custom-grade"></div>
        <div className="absolute left-0 bottom-0 flex flex-col items-center justify-center gap-2 w-full z-20">
          <Image src={Logo} alt="Rombo" />
        </div>
      </div>
      <div className="mx-auto flex w-full flex-col justify-center 2xl:container lg:gap-8 xl:gap-0 items-center px-4">
        <h1
          className={`${GiordanoGoldSerif.className} text-3xl xl:text-4xl 2xl:text-5xl 2xl:leading-[55px] w-full text-center`}
        >
          Exclusive Oceanview Residences in San José del Cabo
        </h1>
        <div className="flex w-full flex-col gap-8 xl:gap-16 mt-6 items-center">
          <p className="text-lg lg:text-xl xl:text-2xl 2xl:text-3xl 2xl:leading-[40px] text-center">
            Larena Is Located In The Prestigious Campestre San José Del Cabo, Surrounded By Golf Courses <br /> And Just Minutes From The Beach. Featuring 4-Bedroom Residences With Private Terraces, <br /> Premium Finishes, And Exclusive Amenities Designed For A Refined Coastal Lifestyle.
          </p>
          <Link href="#contact">
            <Button className="w-fit" variant="outline" size="lg">
              <div className="flex items-center gap-6">
                <span>EXPLORE 360 VIRTUAL TOUR</span>
                <ArrowRight size={24} />
              </div>
            </Button>
          </Link>
        </div>
      </div>
      <div className="px-4 lg:px-8">
        <FeaturedServicesCarouselSquare />
      </div>

      {/* <HomeGallery /> */}

      <div className="mx-auto flex w-full flex-col justify-center 2xl:container lg:gap-8 xl:gap-0 items-center px-4">
        <h1
          className={`${GiordanoGoldSerif.className} text-3xl xl:text-4xl 2xl:text-5xl 2xl:leading-[55px] w-full text-center`}
        >
          Spacious 3- and 4-bedroom units designed for comfort
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

        <div className="aspect-video overflow-hidden">
          <Image
            src={FlatDiagram}
            alt="Rombo"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 100vw"
            className="w-full h-full  rounded-[15px] object-cover"
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-4 ">
          <Image
            src={Construction}
            alt="Rombo"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 100vw"
            className="w-full h-full  rounded-[15px] object-cover"
          />
          <Image
            src={Construction}
            alt="Rombo"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 100vw"
            className="w-full h-full  rounded-[15px] object-cover"
          />
        </div>

        <div className="aspect-video overflow-hidden">
          <Image
            src={Map}
            alt="Rombo"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 100vw"
            className="w-full h-full  rounded-[15px] object-cover"
          />
        </div>
      </div>


    </div>
  );
}
