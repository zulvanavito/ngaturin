import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Delete relational data first to avoid Foreign Key constraint errors 
    //    if 'ON DELETE CASCADE' is not set in the database schema.
    const tables = ["transactions", "wallets", "categories", "investments", "debts", "recurring_bills"];
    for (const table of tables) {
      await supabase.from(table).delete().eq("user_id", user.id);
    }

    // 2. Call RPC to delete the auth.users record
    const { error } = await supabase.rpc("delete_user");
    if (error) {
      console.error("RPC delete_user error:", error);
      throw error;
    }

    // 3. Clear session
    await supabase.auth.signOut();
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Account Deletion Error:", error);
    return NextResponse.json({ 
      error: error.message || "Terjadi kesalahan sistem saat menghapus akun",
      details: error
    }, { status: 500 });
  }
}
