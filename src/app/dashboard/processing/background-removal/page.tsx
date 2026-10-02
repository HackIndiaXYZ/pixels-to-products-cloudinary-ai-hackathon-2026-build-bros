import { redirect } from "next/navigation";

export default function BackgroundRemovalPage() {
  redirect("/dashboard/workspace?tool=bg-removal");
}
