import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Service01 from "@/public/images/Service01.png";
import Service02 from "@/public/images/Service02.png";
import Service03 from "@/public/images/Service03.png";
import Service04 from "@/public/images/Service04.png";
import Service05 from "@/public/images/Service05.png";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image, { StaticImageData } from "next/image";
import { GiordanoGoldSerif } from "@/styles/fonts";

type Service = {
  title: string;
  description: string;
  image: StaticImageData;
  aditionalFeatures?: string[];
};

const services: Service[] = [
  {
    title: "01. LARENA",
    description:
      "Every element of Larena was meticulously selected. Starting with its location surrounded on all four sides by a golf course to its architecture and thoughtful amenities and services, crafted to enhance the overall living experience and provide residents with a truly exceptional lifestyle",
    image: Service01,
    aditionalFeatures: [
      "Security Gate",
      "Parking",
      "Ocean Views Amenities",
      "Fitness Center",
      "Sunset Views Amenities",
    ],
  },
  {
    title: "02. LOCATION",
    description:
      "Located within the exclusive Campestre community in San José del Cabo, we are just 20 minutes away from the airport.",
    image: Service02,
  },
  {
    title: "03. 4 BED. 4.5 BATH",
    description:
      "Fully equipped kitchen, outdoor grill, terrace, private plunge pool, private garden, laundry room, 2 parking spaces and storage room.",
    image: Service03,
  },
  {
    title: "04. EXPERIENCE",
    description:
      "Common amenities that will enhance the overall living experience with sunset and ocean view pool areas, fitness center, and shareholder access to the Campestre Golf Club and Beach Club.",
    image: Service04,
  },
  {
    title: "05. LARENA STAFF",
    description:
      "The Larena staff is a key element in the Larena lifestyle, available for all your needs.",
    image: Service05,
  },
];

export default function FeaturedServicesCarousel() {
  return (
    <div className="relative bg-[#424D5E] lg:pb-24">
      <div className="absolute left-0 top-0 h-1/6 w-full bg-[#f5f5f5] lg:h-1/6 xl:h-2/6 2xl:h-1/2"></div>
      <Carousel
        opts={{
          align: "start",
        }}
      >
        <CarouselContent className="mx-auto w-11/12">
          {services.map((service, index) => (
            <CarouselItem key={index} className="basis-full md:basis-1/2">
              <Card className="aspect-square border-none bg-transparent">
                <CardHeader className="relative mb-12 h-4/6">
                  <Image
                    src={service.image}
                    alt="Rombo"
                    layout="fill"
                    objectFit="cover"
                  />
                </CardHeader>

                <CardContent className="flex h-max flex-col items-start justify-between gap-4 p-0 pl-4 text-[#EFEEED] lg:flex-row">
                  <div className="flex h-full w-full flex-col justify-between lg:w-1/2 lg:items-start">
                    <h3
                      className={`${GiordanoGoldSerif.className} w-full  text-3xl lg:text-2xl xl:text-3xl 2xl:text-4xl`}
                    >
                      {service.title}
                    </h3>
                    {service.aditionalFeatures && (
                      <ul className="hidden list-inside text-sm font-extralight lg:block xl:text-xl 2xl:text-2xl">
                        {service.aditionalFeatures.map((feature, index) => (
                          <li  key={index}>{feature}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <p className="w-full text-lg lg:w-1/2 lg:text-base xl:text-xl 2xl:text-3xl">
                    {service.description}
                  </p>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="flex w-full justify-center gap-6 py-12 lg:mx-auto lg:w-11/12 lg:justify-end lg:gap-12">
          <CarouselPrevious />
          <CarouselNext />
        </div>
      </Carousel>
    </div>
  );
}
