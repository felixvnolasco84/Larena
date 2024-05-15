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
    <div className="relative bg-[#424D5E] py-72">
      <div className="absolute left-0 top-0 w-full bg-white lg:h-2/6 xl:h-2/6 2xl:h-1/2"></div>
      <Carousel
        opts={{
          align: "start",
        }}
        className="w-full"
      >
        <CarouselContent className="mx-auto w-11/12">
          {services.map((service, index) => (
            <CarouselItem key={index} className="basis-full md:basis-1/2">
              <Card className="aspect-square border-none bg-transparent">
                <CardHeader className="relative h-4/6">
                  <Image
                    src={service.image}
                    alt="Rombo"
                    layout="fill"
                    objectFit="cover"
                  />
                </CardHeader>

                <CardContent className="flex h-max items-start justify-between p-6 text-[#EFEEED]">
                  <div className="flex h-full flex-col items-start justify-between">
                    <h3
                      className={`${GiordanoGoldSerif.className} w-1/2 text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl`}
                    >
                      {service.title}
                    </h3>
                    {service.aditionalFeatures && (
                      <ul className="list-inside text-2xl">
                        {service.aditionalFeatures.map((feature, index) => (
                          <li key={index}>{feature}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <p className="w-1/2 text-lg lg:text-xl xl:text-2xl 2xl:text-3xl">
                    {service.description}
                  </p>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="flex flex-col">
          {/* <CarouselPrevious />
          <CarouselNext /> */}
        </div>
      </Carousel>
    </div>
  );
}
