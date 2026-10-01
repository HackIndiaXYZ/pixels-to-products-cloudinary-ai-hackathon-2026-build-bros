"use server";

import { createClient } from "@/lib/supabase/server";
import { signInSchema, signUpSchema } from "@/lib/validators";
import { redirect } from "next/navigation";

export async function signInAction(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const validation = signInSchema.safeParse(data);
  if (!validation.success) {
    return { error: validation.error.flatten().fieldErrors };
  }

  const { error } = await supabase.auth.signInWithPassword(validation.data);
  if (error) {
    return { error: { _form: [error.message] } };
  }

  redirect("/dashboard");
}

export async function signUpAction(formData: FormData) {
  const supabase = await createClient();

  const data = {
    full_name: formData.get("full_name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirm_password: formData.get("confirm_password") as string,
  };

  const validation = signUpSchema.safeParse(data);
  if (!validation.success) {
    return { error: validation.error.flatten().fieldErrors };
  }

  const { error } = await supabase.auth.signUp({
    email: validation.data.email,
    password: validation.data.password,
    options: {
      data: { full_name: validation.data.full_name },
    },
  });

  if (error) {
    return { error: { _form: [error.message] } };
  }

  redirect("/dashboard");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function getAnalysesAction() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("analyses")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  return { analyses: data ?? [], error: error?.message };
}

export async function getAnalysisByIdAction(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("analyses")
    .select("*")
    .eq("id", id)
    .single();

  return { analysis: data, error: error?.message };
}

export async function archiveEvidenceAction(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('analyses').update({ is_archived: true }).eq('id', id);
  return { success: !error, error: error?.message };
}

export async function unarchiveEvidenceAction(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('analyses').update({ is_archived: false }).eq('id', id);
  return { success: !error, error: error?.message };
}

export async function deleteEvidenceAction(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('analyses').delete().eq('id', id);
  return { success: !error, error: error?.message };
}
