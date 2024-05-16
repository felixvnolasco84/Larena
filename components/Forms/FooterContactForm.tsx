"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { ArrowRight, Loader, LucidePersonStanding } from "lucide-react";
import { useRouter } from "next/navigation";
import { Checkbox } from "../ui/checkbox";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

export const phoneRegex = new RegExp(
  /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/
);

const interest = ["DIGITAL BROCHURE", "A MEETING OR CALL"];

export default function FooterContactForm() {
  const router = useRouter();

  const FormSchema = z.object({
    name: z.string().min(1, { message: "Please provide a name" }),
    email: z.string().min(1, { message: "Please provide en email" }),
    phoneNumber: z
      .string()
      .regex(phoneRegex, "Please provide an valid phone number"),
    interest: z.string().min(1, { message: "Please select an option" }),
    acceptTerms: z.boolean().refine((value) => value === true, {
      message: "ACCEPT TERMS",
    }),
  });

  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<number | null>(null);

  const handleItemClick = (index: number) => {
    setSelectedItem(index === selectedItem ? null : index);
  };

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      interest: "",
      acceptTerms: false,
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    // console.log(data);
    try {
      const jsonData = JSON.stringify(data);
      const draftResponse = await fetch("/api/brands ", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: jsonData,
      });

      const response = await draftResponse.json();

      if (response.id) {
        toast({
          variant: "default",
          title: "¡Listo!",
          description: "Tu proyecto se ha creado correctamente",
        });
        form.reset();
        router.push(`/portal/marcas/${response.id}`);
      } else {
        toast({
          variant: "destructive",
          title: "¡Oh!",
          description: "Al parecer hubo un error, intentelo más tarde",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Oops!",
        description: "Al parecer hubo un error, intentelo más tarde",
      });
    }
  }

  return (
    <Form {...form}>
      <form className="w-full" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-12 text-[#F5F5F5]">
          <div className="grid w-full items-center gap-1.5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-0 border-b border-b-[#F5F5F5] text-[#F5F5F5]">
                  <FormControl className="bg-transparent">
                    <Input
                      className="placeholder:text-white"
                      placeholder="YOUR NAME"
                      autoCapitalize="none"
                      autoComplete="off"
                      autoCorrect="off"
                      disabled={isLoading}
                      {...field}
                    ></Input>
                  </FormControl>
                  <FormMessage className="m-0" />
                </FormItem>
              )}
            />
          </div>

          <div className="grid w-full grid-cols-2 items-center gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-0 border-b border-b-[#F5F5F5] text-[#F5F5F5]">
                  {/* <FormLabel>Nombre de la Marca</FormLabel>
                  <FormDescription>
                    Agregar el nombre de tu marca o organización
                  </FormDescription> */}
                  <FormControl className="bg-transparent">
                    <Input
                      className="placeholder:text-white"
                      placeholder="YOUR EMAIL"
                      autoCapitalize="none"
                      autoComplete="off"
                      autoCorrect="off"
                      disabled={isLoading}
                      {...field}
                    ></Input>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem className="space-y-0 border-b border-b-[#F5F5F5] text-[#F5F5F5]">
                  <FormControl className="bg-transparent">
                    <Input
                      className="placeholder:text-white"
                      placeholder="PHONE"
                      autoCapitalize="none"
                      autoComplete="off"
                      autoCorrect="off"
                      disabled={isLoading}
                      {...field}
                    ></Input>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex">
            <FormField
              control={form.control}
              name="interest"
              render={({ field }) => (
                <FormItem className="flex items-center gap-6 space-y-0">
                  <FormLabel className="text-xl">I AM INTERESTED IN</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex gap-12 space-y-0"
                    >
                      {interest.map((item, index) => (
                        <FormItem
                          key={index}
                          className="flex items-center gap-1 space-y-0"
                        >
                          <FormControl className="border-[#F5F5F5]">
                            <RadioGroupItem value={item} />
                          </FormControl>
                          <FormLabel className="mt-0 text-xl">{item}</FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex">
            <FormField
              control={form.control}
              name="acceptTerms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-4 space-y-0 border-none p-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="text-[#F5F5F5]"
                    />
                  </FormControl>
                  <div className="space-y-0 leading-none">
                    <FormLabel className="text-xl">
                      I ACCEPT THE TERMS & CONDITIONS
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              className="w-fit border-[#F5F5F5] bg-transparent text-[#F5F5F5]"
              variant="outline"
              size="lg"
            >
              <div className="flex items-center gap-6">
                <span>
                  {isLoading ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    "SEND"
                  )}
                </span>
                <ArrowRight size={24} />
              </div>
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
