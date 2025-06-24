import { Card, CardHeader } from "@/components/ui/card";






import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image, { StaticImageData } from "next/image";

type Service = {
  image: string;
};

const services: Service[] = [

  {
    image: "https://f5z6vohtd8.ufs.sh/f/9xW4M4QjXVSmmvSpOzRNu39jZnI20oY4hFNizlxrQWOq6cLt",
  },
  {
    image: "https://f5z6vohtd8.ufs.sh/f/9xW4M4QjXVSmTjoQXdivJuSn8YENPqDKWv93QsjxFy7MpbeU",
  },
  {
    image: "https://f5z6vohtd8.ufs.sh/f/9xW4M4QjXVSmdX8FZR5fkCjnmpJuaEUls0M4GreOqgN39YAX",
  },
  {
    image: "https://f5z6vohtd8.ufs.sh/f/9xW4M4QjXVSmayk2YzMwyTNe7tcEHKYqP9ovkzRsMWBiXAFf",
  },
  
  {
    image: "https://f5z6vohtd8.ufs.sh/f/9xW4M4QjXVSmO6NTWvz7udh684ERzCspg9iAPB1I5rDHnaSF",
  },
  {
    image: "https://f5z6vohtd8.ufs.sh/f/9xW4M4QjXVSmGt0OF8R8koPi5jg0eQs4Mvzmb2wXpxcCRYBS",
  },
  {
    image: "https://f5z6vohtd8.ufs.sh/f/9xW4M4QjXVSms8HDdRBJ5PFZodjLCBgHw27W18fivXQxVnE9",
  },
  {
    image: "https://f5z6vohtd8.ufs.sh/f/9xW4M4QjXVSmWAWkLVK1c8VYyJo6NfrlajXTAGiwtMKh0L7u",
  },
  {
    image: "https://f5z6vohtd8.ufs.sh/f/9xW4M4QjXVSmKuKnp1CFYLaqzngeMb1BSIPDRXdJA9y2ixC7",
  },
  {
    image: "https://f5z6vohtd8.ufs.sh/f/9xW4M4QjXVSmF1XTUWIMSQgDv5lHuI70d3kWnp9E8UATftLC",
  },
  {
    image: "https://f5z6vohtd8.ufs.sh/f/9xW4M4QjXVSmbCfyokHexM89z2prNvmPQjSksEJuKZ7b13ho",
  },
  {
    image: "https://f5z6vohtd8.ufs.sh/f/9xW4M4QjXVSmmFRBV4Nu39jZnI20oY4hFNizlxrQWOq6cLtf",
  },
  {
    image: "https://f5z6vohtd8.ufs.sh/f/9xW4M4QjXVSmWzanLgK1c8VYyJo6NfrlajXTAGiwtMKh0L7u",
  },

  {
    image: "https://f5z6vohtd8.ufs.sh/f/9xW4M4QjXVSmIlleNMAPOq6ysELgDCTfXjZoS3MJ0x8tv7cu",
  },


  {
    image: "https://f5z6vohtd8.ufs.sh/f/9xW4M4QjXVSm5axp4tL6BK1kJvWmjuFb0RqArEYoIC3hy2ld",
  },
  {
    image: "https://f5z6vohtd8.ufs.sh/f/9xW4M4QjXVSmwklzE1JOuBwSVFXdP10RxsELTYrvJDgq2f8o",
  },
  {
    image: "https://f5z6vohtd8.ufs.sh/f/9xW4M4QjXVSmY0h2fdP4kZ15i6suY3KCmhTzHQte4yd2GU9B",
  },
  {
    image: "https://f5z6vohtd8.ufs.sh/f/9xW4M4QjXVSmJAVvkjt0rdDnMi3QZVNGBRcp5xX2h8fobOYU",
  },
  {
    image: "https://f5z6vohtd8.ufs.sh/f/9xW4M4QjXVSmsFIPHiDBJ5PFZodjLCBgHw27W18fivXQxVnE",
  },
  {
    image: "https://f5z6vohtd8.ufs.sh/f/9xW4M4QjXVSmy8Yi20XCTIzGgxOnp4r13vm7aWZASlPoLEcq",
  },
  {
    image: "https://f5z6vohtd8.ufs.sh/f/9xW4M4QjXVSmmsVzU5Nu39jZnI20oY4hFNizlxrQWOq6cLtf",
  },
  {
    image: "https://f5z6vohtd8.ufs.sh/f/9xW4M4QjXVSmGnev3LR8koPi5jg0eQs4Mvzmb2wXpxcCRYBS",
  },
  {
    image: "https://f5z6vohtd8.ufs.sh/f/9xW4M4QjXVSmwzkG1QJOuBwSVFXdP10RxsELTYrvJDgq2f8o",
  },

  {
    image: "https://f5z6vohtd8.ufs.sh/f/9xW4M4QjXVSmw8C9E6JOuBwSVFXdP10RxsELTYrvJDgq2f8o",
  },
];

export default function FeaturedServicesCarouselSquare() {
  return (
    <div className="relative">
      <Carousel
        opts={{
          align: "center",
        }}
        className=""
      >
        <CarouselContent className="">
          {services.map((service, index) => (
            <CarouselItem key={index} className="basis-full lg:basis-[47%] centerModeMobile">
              <Card className="aspect-square border-none bg-transparent">
                <CardHeader className="relative mb-12 aspect-square">
                  <Image
                    src={service.image}
                    alt="Rombo"
                    layout="fill"

                    className="rounded-[8px] lg:rounded-[15px] object-cover"
                  />
                </CardHeader>

              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>

        <div className="absolute top-0 flex h-full w-full items-center justify-between px-0 lg:px-8 lg:mx-auto lg:pb-12">
          <CarouselPrevious />
          <CarouselNext />
        </div>
      </Carousel>
    </div>
  );
}
