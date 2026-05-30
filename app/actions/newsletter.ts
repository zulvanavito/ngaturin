"use server";

import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import WelcomeNewsletter from "@/emails/WelcomeNewsletter";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function subscribeNewsletter(prevState: any, formData: FormData) {
  const email = formData.get("email")?.toString();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return {
      status: "error",
      message: "Mohon masukkan alamat email yang valid.",
    };
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert([{ email, status: "subscribed" }]);

    if (error) {
      if (error.code === "23505") { // Unique constraint violation
        return {
          status: "info",
          message: "Email ini sudah terdaftar. Terima kasih!",
        };
      }
      console.error("Newsletter Subscription Error:", error);
      return {
        status: "error",
        message: "Terjadi kesalahan sistem. Silakan coba lagi nanti.",
      };
    }

    // Send Welcome Email via Resend
    if (process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: "Ngaturin <hello@ngaturin.web.id>",
          to: email,
          subject: "Selamat Datang di Newsletter Ngaturin!",
          react: WelcomeNewsletter({ email }),
        });
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
        // We don't fail the subscription if email fails, just log it
      }
    }

    return {
      status: "success",
      message: "Berhasil berlangganan! Periksa kotak masuk Anda segera.",
    };
  } catch (error) {
    console.error("Newsletter Action Exception:", error);
    return {
      status: "error",
      message: "Terjadi kesalahan internal. Silakan coba lagi.",
    };
  }
}
