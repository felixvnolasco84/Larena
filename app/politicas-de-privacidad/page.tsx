import RichTextEditor from "@/components/TipTapOnlyContent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Larena - Políticas de Privacidad",
  description: "Conoce nuestras Políticas de Privacidad.",
  alternates: {
    canonical: "https://www.larena.mx/politicas-de-privacidad",
  },
};

let post: string =
  "<p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Aut, a.</p>";
export default function Page() {
  return (
    <div className="container flex flex-col gap-y-7 px-4 py-12 text-justify lg:flex lg:gap-12">
      <RichTextEditor content={post} />
    </div>
  );
}
