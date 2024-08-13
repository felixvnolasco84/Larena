"use client";

import { app } from "@/utils/FirebaseConnection";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";

import { toast } from "@/components/ui/use-toast";

export const uploadFile = async (file: any, userId?: string) => {
  const storage = getStorage(app);

  //TODO: Add userId to the file name AND FIX 404 IN DELETE FILE FUNCTION

  const name = (userId || "") + file.name;
  const storageRef = ref(storage, name);

  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise<string>((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");

        if (progress === 100) {
          toast({
            title: "¡Listo!",
            description: "Tu archivo se ha subido correctamente",
            variant: "default",
            duration: 3000,
          });
        }

        switch (snapshot.state) {
          case "paused":
            console.log("Upload is paused");
            break;
          case "running":
            console.log("Upload is running");
            break;
        }
      },
      (error) => {
        toast({
          variant: "destructive",
          title: "¡Oh!",
          description: "Al parecer hubo un error, intentelo más tarde",
        });
        reject(error);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadURL);
      }
    );
  });
};
