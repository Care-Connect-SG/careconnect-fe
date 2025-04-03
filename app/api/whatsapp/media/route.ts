import { NextRequest, NextResponse } from "next/server";

export interface WhatsAppResponse {
  success: boolean;
  message?: string;
  error?: string;
  details?: string;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const apiUrl = `${process.env.WHATSAPP_API_URL}/media`;
    const apiSecret = process.env.WHATSAPP_API_SECRET;

    if (!apiSecret) {
      return NextResponse.json(
        { success: false, error: "WHATSAPP_API_SECRET is not configured" },
        { status: 500 },
      );
    }

    const formData = await req.formData();

    if (!formData.get("media")) {
      return NextResponse.json(
        { success: false, error: "media file is required" },
        { status: 400 },
      );
    }

    if (!formData.get("jid")) {
      return NextResponse.json(
        { success: false, error: "jid is required" },
        { status: 400 },
      );
    }

    if (!formData.get("caption")) {
      return NextResponse.json(
        { success: false, error: "caption is required" },
        { status: 400 },
      );
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiSecret}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, ...data },
        { status: response.status },
      );
    }

    return NextResponse.json({ success: true, ...data }, { status: 200 });
  } catch (error) {
    console.error("WhatsApp Media API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to send WhatsApp media message",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
