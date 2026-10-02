import { redirect } from "next/navigation";

export default function SmartCropPage() {
  redirect("/dashboard/workspace?tool=smart-crop");
}
