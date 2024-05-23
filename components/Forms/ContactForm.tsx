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
import { ArrowRight, Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { Checkbox } from "../ui/checkbox";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { sendContactEmail } from "@/app/_actions";

export const phoneRegex = new RegExp(
  /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/
);

const interest = ["DIGITAL BROCHURE", "A MEETING OR CALL"];

export default function ContactForm() {
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
    try {
      const { name, email, phoneNumber, interest } = data;
      const response = await sendContactEmail({
        name,
        email,
        phone: phoneNumber,
        interest,
      });

      if (response.success === true) {
        toast({
          variant: "default",
          title: "Done!",
          description: "Thanks for getting in touch, we will contact you soon",
        });
        form.reset();
      } else {
        toast({
          variant: "destructive",
          title: "Oops!",
          description: "Seems like there was an error, please try again later",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Oops!",
        description: "Seems like there was an error, please try again later",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-6 lg:gap-12">
          <div className="grid w-full items-center gap-1.5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-0 border-b border-b-[#424D5E]">
                  {/* <FormLabel>Nombre de la Marca</FormLabel>
                  <FormDescription>
                    Agregar el nombre de tu marca o organización
                  </FormDescription> */}
                  <FormControl className="bg-transparent">
                    <Input
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
                <FormItem className="space-y-0 border-b border-b-[#424D5E]">
                  {/* <FormLabel>Nombre de la Marca</FormLabel>
                  <FormDescription>
                    Agregar el nombre de tu marca o organización
                  </FormDescription> */}
                  <FormControl className="bg-transparent">
                    <Input
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
                <FormItem className="space-y-0 border-b border-b-[#424D5E]">
                  <FormControl className="bg-transparent">
                    <Input
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

          <div className="flex flex-col items-center justify-between gap-4 lg:flex-row lg:gap-0">
            <FormField
              control={form.control}
              name="interest"
              render={({ field }) => (
                <FormItem className="flex w-full flex-col items-start gap-2 space-y-0 lg:flex-row lg:gap-8 xl:gap-10 2xl:gap-12">
                  <FormLabel className="w-fit text-sm lg:w-80 lg:text-base xl:text-xl">
                    I AM INTERESTED IN:
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex w-full justify-between gap-0 space-y-0 lg:justify-start lg:gap-12"
                    >
                      {interest.map((item, index) => (
                        <FormItem
                          key={index}
                          className="flex items-center gap-1 space-y-0"
                        >
                          <FormControl>
                            <RadioGroupItem value={item} />
                          </FormControl>
                          <FormLabel className="mt-0 text-xs lg:text-base xl:text-xl">
                            {item}
                          </FormLabel>
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
                <FormItem className="flex w-full flex-row items-center gap-2 space-y-0 border-none p-0 lg:gap-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className=""
                    />
                  </FormControl>
                  <div className="space-y-0 leading-none">
                    <FormLabel className="text-xs lg:text-base xl:text-xl">
                      I ACCEPT THE TERMS & CONDITIONS
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
            <Button type="submit" className="w-fit" variant="outline" size="lg">
              <div className="flex items-center gap-2 lg:gap-6">
                <span className="text-xs lg:text-base">
                  {isLoading ? (
                    <Loader className="h-3 w-3 animate-spin lg:h-4 lg:w-4" />
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
