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
import { LucidePersonStanding } from "lucide-react";
import { useRouter } from "next/navigation";
import { Checkbox } from "../ui/checkbox";

export const phoneRegex = new RegExp(
  /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/
);

const interest = ["DIGITAL BROCHURE", "A MEETING OR CALL"];

const firstInterest = interest[0];

export default function ContactForm() {
  const router = useRouter();

  const FormSchema = z.object({
    name: z.string().min(1, { message: "YOUR NAME" }),
    email: z.string().min(1, { message: "YOUR EMAIL" }),
    phoneNumber: z.string().regex(phoneRegex, "Número de Teléfono Inválido"),
    interest: z.string().default(firstInterest),
    acceptTerms: z.boolean().refine((value) => value === true, {
      message: "ACCEPT TERMS",
    }),
  });

  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // const [cover, setCover] = useState<string>("");

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      interest: firstInterest,
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
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-4">
          <div className="grid w-full items-center gap-1.5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="border-b">
                  {/* <FormLabel>Nombre de la Marca</FormLabel>
                  <FormDescription>
                    Agregar el nombre de tu marca o organización
                  </FormDescription> */}
                  <FormControl className="bg-transparent">
                    <Input
                    className="border-none bg-transparent p-4 text-2xl text-black"
                      placeholder="YOUR NAME"
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

          <div className="grid w-full items-center gap-1.5">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
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
          </div>

          <div className="grid w-full items-center gap-1.5">
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  {/* <FormLabel>Nombre de la Marca</FormLabel>
                  <FormDescription>
                    Agregar el nombre de tu marca o organización
                  </FormDescription> */}
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

          <div className="grid w-full items-center gap-1.5">
            <FormField
              control={form.control}
              name="interest"
              render={({ field }) => (
                <FormItem>
                  {/* <FormLabel>Nombre de la Marca</FormLabel>
                    <FormDescription>
                        Agregar el nombre de tu marca o organización
                    </FormDescription> */}
                  <FormControl className="bg-transparent">
                    <select
                      {...field}
                      disabled={isLoading}
                      className="w-full rounded-md border border-gray-300 bg-white p-2"
                    >
                      {interest.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid w-full items-center gap-1.5">
            <FormField
              control={form.control}
              name="acceptTerms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-4 border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className=""
                    />
                  </FormControl>
                  <div className="leading-none">
                    <FormLabel className="">
                      I ACCEPT THE TERMS & CONDITIONS
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </div>

          <Button
            disabled={isLoading}
            variant={"outline"}
            className="border border-gray-300 bg-transparent p-4 text-white"
          >
            {isLoading && (
              <LucidePersonStanding className="mr-2 h-4 w-4 animate-spin" />
            )}
            Crear Marca
          </Button>
        </div>
      </form>
    </Form>
  );
}
