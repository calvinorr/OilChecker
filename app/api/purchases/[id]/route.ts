import { NextRequest, NextResponse } from "next/server";
import { updatePurchase, deletePurchase } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { purchaseDate, litres, totalPrice, supplier, notes } = body;

    const purchase = await updatePurchase(id, {
      ...(purchaseDate && { purchaseDate: new Date(purchaseDate) }),
      ...(litres && { litres: litres.toString() }),
      ...(totalPrice && { totalPrice: totalPrice.toString() }),
      ...(supplier !== undefined && { supplier }),
      ...(notes !== undefined && { notes }),
    });

    if (!purchase) {
      return NextResponse.json(
        { error: "Purchase not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ purchase });
  } catch (error) {
    console.error("Failed to update purchase:", error);
    return NextResponse.json(
      { error: "Failed to update purchase" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await deletePurchase(id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Purchase not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete purchase:", error);
    return NextResponse.json(
      { error: "Failed to delete purchase" },
      { status: 500 }
    );
  }
}
