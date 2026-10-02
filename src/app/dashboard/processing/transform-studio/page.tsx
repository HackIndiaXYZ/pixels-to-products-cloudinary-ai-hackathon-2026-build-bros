import { redirect } from "next/navigation";

export default function TransformStudioPage() {
  redirect("/dashboard/workspace?tool=transform");
}
