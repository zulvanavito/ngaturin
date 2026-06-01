import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { handleGamifiedAction } from "@/lib/gamification-service";
import { handleApiError } from "@/lib/utils/api-error";
import { TransferParamsSchema, TransferBodySchema } from "@/lib/validations/finance";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("Unauthorized");
    }

    // 1. Validate Route Params
    const resolvedParams = await params;
    const { id: fromWalletId } = TransferParamsSchema.parse(resolvedParams);

    // 2. Validate Request Body
    const body = await request.json();
    const { toWalletId, amount, description, date } = TransferBodySchema.parse(body);

    // 3. Additional Business Logic Validation
    if (fromWalletId === toWalletId) {
      return NextResponse.json(
        { error: "Dompet sumber dan tujuan tidak boleh sama", code: "INVALID_TRANSFER" },
        { status: 400 }
      );
    }

    // 4. Verify wallet ownership via RPC or simple check
    // Note: The RPC transfer_funds already performs ownership checks internally,
    // but a quick check here provides better immediate feedback.
    const { data: wallets, error: walletsError } = await supabase
      .from("wallets")
      .select("id")
      .eq("user_id", user.id)
      .in("id", [fromWalletId, toWalletId]);

    if (walletsError) throw walletsError;
    if (!wallets || wallets.length !== 2) {
      return NextResponse.json(
        { error: "Dompet tidak ditemukan atau bukan milik Anda", code: "WALLET_NOT_FOUND" },
        { status: 404 }
      );
    }

    // 5. Execute Atomic Transfer via RPC
    const { error: rpcError } = await supabase.rpc("transfer_funds", {
      p_from_wallet_id: fromWalletId,
      p_to_wallet_id: toWalletId,
      p_amount: amount,
      p_description: description,
      p_date: date || new Date().toISOString().split("T")[0],
    });

    if (rpcError) throw rpcError;

    // 6. Trigger Gamification
    try {
      await handleGamifiedAction(user.id, 10);
    } catch (gamiError) {
      console.error("Gamification error (non-blocking):", gamiError);
    }

    return NextResponse.json({ message: "Transfer berhasil" }, { status: 201 });

  } catch (error) {
    return handleApiError(error);
  }
}
