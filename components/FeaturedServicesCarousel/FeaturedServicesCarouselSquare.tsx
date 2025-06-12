import { Card, CardHeader } from "@/components/ui/card";
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

type Service = {
  image: StaticImageData;
};

const services: Service[] = [
  {
    image: Service01,

  },
  {
    image: Service02,
  },
  {

    image: Service03,
  },
  {


    image: Service04,
  },
  {

    image: Service05,
  },
];

export default function FeaturedServicesCarouselSquare() {
  return (
    <div className="relative">
      <Carousel
        opts={{
          align: "start",
        }}
        className=""
      >
        <CarouselContent className="mx-auto w-full ">
          {services.map((service, index) => (
            <CarouselItem key={index} className="basis-full md:basis-1/3">
              <Card className="aspect-square border-none bg-transparent">
                <CardHeader className="relative mb-12 aspect-square">
                  <Image
                    src={service.image}
                    alt="Rombo"
                    layout="fill"
                    objectFit="cover"
                    className="rounded-[15px]"
                  />
                </CardHeader>

              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>

        <div className="absolute top-0 flex h-full w-full items-center justify-between px-4 lg:px-8 lg:mx-auto lg:pb-12">
          <CarouselPrevious />
          <CarouselNext />
        </div>
      </Carousel>
    </div>
  );
}
