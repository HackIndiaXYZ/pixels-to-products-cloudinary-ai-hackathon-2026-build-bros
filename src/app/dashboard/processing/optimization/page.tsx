import { redirect } from "next/navigation";

export default function OptimizationPage() {
  redirect("/dashboard/workspace?tool=optimize");
}
