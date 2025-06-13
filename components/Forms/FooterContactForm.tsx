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
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { sendContactEmail } from "@/app/_actions";

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
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsLoading(true);
    try {
      const { name, email, phoneNumber } = data;
      const response = await sendContactEmail({
        name,
        email,
        phone: phoneNumber,
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
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <Form {...form}>
      <form className="w-full" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-6 text-[#555555] lg:gap-12 w-full lg:w-1/2"> 
          <div className="grid w-full items-center gap-1.5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-0 bg-[#DEDEDE] rounded-[8px] p-2 text-[#555555]">
                  <FormControl className="bg-transparent">
                    <Input
                      className="placeholder:text-[#555555]"
                      placeholder="NAME"
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

          <div className="grid w-full items-center gap-6 lg:gap-12">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-0 bg-[#DEDEDE] rounded-[8px] p-2 text-[#555555]">

                  <FormControl className="bg-transparent">
                    <Input
                      className="placeholder:text-[#555555]"
                      placeholder="EMAIL"
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
                <FormItem className="space-y-0 bg-[#DEDEDE] rounded-[8px] p-2 text-[#555555]">
                  <FormControl className="bg-transparent">
                    <Input
                      className="placeholder:text-[#555555]"
                      placeholder="PHONE NUMBER"
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


            <Button
              type="submit"
              disabled={isLoading}
              className="w-fit rounded-[8px] bg-[#292929] text-white lg:px-12 lg:py-7"
              variant="outline"
              size="lg"
            >
              <div className="flex items-center gap-6">

                {isLoading ? (
                  <Loader className="h-3 w-3 animate-spin lg:h-4 lg:w-4" />
                ) : (
                  <span className="text-xs lg:text-base h-fit leading-tight">
                    SEND
                  </span>
                )}

              </div>
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
