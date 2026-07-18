import type { Metadata } from "next";
import { ViewerShell } from "@/components/viewer/viewer-shell";

export const metadata: Metadata = {
  title: "La Kombi",
  description:
    "Contempla la Volkswagen Kombi de PUDÚ en 360°: rótala, acércate y obsérvala como en una sala de exhibición.",
};

export default function KombiPage() {
  return <ViewerShell />;
}
