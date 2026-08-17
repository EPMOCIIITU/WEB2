import { NextResponse } from "next/server";
import connectDB from "@/lib/db";

export async function GET() {
  try {
    await connectDB();

    return NextResponse.json(
      {
        ok: true,
        database: "connected",
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        database: "disconnected",
        error: error instanceof Error ? error.message : "Unknown database error",
      },
      { status: 500 }
    );
  }
}