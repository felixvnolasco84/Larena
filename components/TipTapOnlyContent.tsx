"use client";

import "../styles/editor.scss";

import { BubbleMenu, FloatingMenu, useCurrentEditor } from "@tiptap/react";

import React, { useCallback } from "react";
import {
  BoldIcon,
  CheckIcon,
  Code2Icon,
  CodeIcon,
  ImageIcon,
  ItalicIcon,
  Link2Icon,
  Link2OffIcon,
  List,
  ListOrderedIcon,
  QuoteIcon,
  Redo2,
  SeparatorHorizontalIcon,
  SortAscIcon,
  StrikethroughIcon,
  Undo2,
} from "lucide-react";

import { Color } from "@tiptap/extension-color";
import Dropcursor from "@tiptap/extension-dropcursor";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import ListItem from "@tiptap/extension-list-item";
import TextStyle from "@tiptap/extension-text-style";

import { EditorProvider } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Button } from "./ui/button";
import { uploadFile } from "@/utils/uploadImage";

type Props = {
  onStateChange?: (state: any) => void;
  content: string;
};

const TipTap = () => {
  const { editor } = useCurrentEditor();

  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");

  const setLink = useCallback(() => {
    if (!editor) {
      return;
    }
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();

      return;
    }

    // update link
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const addImage = async (e: any) => {
    const urlFile = await uploadFile(e.target.files[0]);

    if (urlFile) {
      editor?.chain().focus().setImage({ src: urlFile }).run();
    }
  };

  if (!editor) {
    return (
      <>
        <div className="flex h-96 items-center justify-center">
          <div className="h-32 w-32 animate-spin rounded-full border-y-2 border-gray-900"></div>
        </div>
      </>
    );
  }

  const frameworks = [
    {
      value: "h1",
      label: "h1",
    },
    {
      value: "h2",
      label: "h2",
    },
    {
      value: "h3",
      label: "h3",
    },
    {
      value: "h4",
      label: "h4",
    },
    {
      value: "h5",
      label: "h5",
    },
  ];

  return (
    <div className="rounded-md border border-gray-200">
      {editor && (
        <BubbleMenu
          className="rounded-md border border-gray-400"
          tippyOptions={{ duration: 100 }}
          editor={editor}
        >
          <Button
            type="button"
            variant={"ghost"}
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={` ${
              editor.isActive("bold") ? "font-semibold" : ""
            } p-1 bg-white dark:bg-black dark:text-white rounded-md`}
          >
            Negrita
          </Button>
          <Button
            type="button"
            variant={"ghost"}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={` ${
              editor.isActive("italic") ? "font-semibold" : ""
            } p-1 bg-white dark:bg-black dark:text-white rounded-md`}
          >
            Italica
          </Button>
          <Button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={` ${
              editor.isActive("strike") ? "font-semibold" : ""
            } p-1 bg-white dark:bg-black dark:text-white rounded-md`}
          >
            Tachado
          </Button>
        </BubbleMenu>
      )}

      {editor && (
        <FloatingMenu
          className="flex gap-x-2 rounded-md border-2 border-gray-200 bg-white p-1 dark:border-gray-800 dark:bg-black dark:text-white"
          tippyOptions={{ duration: 100 }}
          editor={editor}
        >
          <button
            type="button"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            className={
              editor.isActive("heading", { level: 1 }) ? "is-active" : ""
            }
          >
            H1
          </button>

          <button
            type="button"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            className={
              editor.isActive("heading", { level: 2 }) ? "is-active" : ""
            }
          >
            H2
          </button>
        </FloatingMenu>
      )}

      <div className="flex flex-wrap items-center justify-center">
        <Button
          variant={"ghost"}
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "is-active" : ""}
        >
          <BoldIcon className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant={"ghost"}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "is-active" : ""}
        >
          <ItalicIcon className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant={"ghost"}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          className={editor.isActive("strike") ? "is-active" : ""}
        >
          <StrikethroughIcon className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "is-active" : ""}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive("orderedList") ? "is-active" : ""}
        >
          <ListOrderedIcon className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive("blockquote") ? "is-active" : ""}
        >
          <QuoteIcon className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant={"ghost"}
          onClick={setLink}
          className={editor.isActive("link") ? "is-active" : ""}
        >
          <Link2Icon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={"ghost"}
          onClick={() => editor.chain().focus().unsetLink().run()}
          disabled={!editor.isActive("link")}
        >
          <Link2OffIcon className="h-4 w-4" />
        </Button>

        <input
          type="file"
          style={{ display: "none" }}
          id="image"
          onChange={addImage}
        />

        <label
          htmlFor="image"
          className="inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        >
          <ImageIcon className="h-4 w-4" />
        </label>

        <Button
          type="button"
          variant={"ghost"}
          onClick={() => editor.chain().focus().toggleCode().run()}
          disabled={!editor.can().chain().focus().toggleCode().run()}
          className={editor.isActive("code") ? "is-active" : ""}
        >
          <CodeIcon className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={editor.isActive("codeBlock") ? "is-active" : ""}
        >
          <Code2Icon className="h-4 w-4" />
        </Button>
        {/* <Button
            type="button"
            variant={"ghost"}
            onClick={() => editor.chain().focus().unsetAllMarks().run()}
          >
            
            clear marks
          </Button> */}
        {/* <Button
            type="button"
            variant={"ghost"}
            onClick={() => editor.chain().focus().clearNodes().run()}
          >
            clear nodes
          </Button> */}

        <Button
          type="button"
          variant="ghost"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <SeparatorHorizontalIcon className="h-4 w-4" />
          {/* horizontal rule */}
        </Button>
        {/* <Button
            type="button"
            variant={"ghost"}
            onClick={() => editor.chain().focus().setParagraph().run()}
            className={editor.isActive("paragraph") ? "is-active" : ""}
          >
            Parrafo
          </Button> */}
        {/* <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" role="combobox" aria-expanded={open}>
                {value
                  ? frameworks.find((framework) => framework.value === value)
                      ?.label
                  : "Titulos"}
                <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandGroup>
                  {frameworks.map((framework) => (
                    <CommandItem
                      key={framework.value}
                      value={framework.value}
                      onSelect={(currentValue) => {
                        switch (currentValue) {
                          case "h1":
                            editor
                              .chain()
                              .focus()
                              .toggleHeading({ level: 1 })
                              .run();
                            break;
                          case "h2":
                            editor
                              .chain()
                              .focus()
                              .toggleHeading({ level: 2 })
                              .run();
                            break;
                          case "h3":
                            editor
                              .chain()
                              .focus()
                              .toggleHeading({ level: 3 })
                              .run();
                            break;
                          case "h4":
                            editor
                              .chain()
                              .focus()
                              .toggleHeading({ level: 4 })
                              .run();
                            break;
                          case "h5":
                            editor
                              .chain()
                              .focus()
                              .toggleHeading({ level: 5 })
                              .run();
                            break;
                          default:
                            break;
                        }
                        setOpen(false);
                      }}
                    >
                      {framework.label}
                      <CheckIcon
                      className={`w-4 h-4 ${
                        value === framework.value ? "opacity-100" : "opacity-0"
                      }`}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover> */}

        <Button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={
            editor.isActive("heading", { level: 1 }) ? "is-active" : ""
          }
        >
          h1
        </Button>
        <Button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={
            editor.isActive("heading", { level: 2 }) ? "is-active" : ""
          }
        >
          h2
        </Button>
        <Button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={
            editor.isActive("heading", { level: 3 }) ? "is-active" : ""
          }
        >
          h3
        </Button>
        <Button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 4 }).run()
          }
          className={
            editor.isActive("heading", { level: 4 }) ? "is-active" : ""
          }
        >
          h4
        </Button>
        <Button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 5 }).run()
          }
          className={
            editor.isActive("heading", { level: 5 }) ? "is-active" : ""
          }
        >
          h5
        </Button>
        <Button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 6 }).run()
          }
          className={
            editor.isActive("heading", { level: 6 }) ? "is-active" : ""
          }
        >
          h6
        </Button>

        {/* <Button
            type="button"
            vari
            onClick={() => editor.chain().focus().setHardBreak().run()}
          >
            
            
            hard break
          </Button> */}
        <Button
          type="button"
          variant={"ghost"}
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
        >
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={"ghost"}
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
        >
          <Redo2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

const RichTextEditor = ({ onStateChange, content }: Props) => {
  const extensions = [
    Color.configure({ types: [TextStyle.name, ListItem.name] }),
    TextStyle.extend({
      types: [ListItem.name],
    }),
    StarterKit.configure({
      bulletList: {
        keepMarks: true,
        keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
      },
      orderedList: {
        keepMarks: true,
        keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
      },
    }),
    Dropcursor,
    Image,
    Link.configure({
      openOnClick: false,
      autolink: true,
    }),
  ];

  return (
    <div className="flex flex-col gap-2">
      <EditorProvider
        slotBefore={<></>}
        // slotBefore={<TipTap />}
        extensions={extensions}
        content={content}
        // editable={true}
        editable={false}
        onUpdate={({ editor }) => {
          if (editor) {
            onStateChange && onStateChange(editor.getHTML());
          }
        }}
        editorProps={{
          attributes: {
            class:
              "prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl  focus:outline-none  rounded-md shadow-sm  p-4 lg:p-8  overflow-y-auto  dark:text-white bg-[#F6F6F6]",
          },
        }}
      >
        <></>
      </EditorProvider>
    </div>
  );
};

export default RichTextEditor;
