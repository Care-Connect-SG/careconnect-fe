// app/api/groups/remove-user/route.ts
import { NextResponse } from "next/server";

const BE_API_URL = process.env.BE_API_URL || "http://localhost:8000/api/v1";
const BE_API_SECRET = process.env.BE_API_SECRET || "";

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const group_id = searchParams.get("group_id");
  const user_email = searchParams.get("user_email");

  if (!group_id || !user_email) {
    return NextResponse.json(
      { error: "Both group_id and user_email are required" },
      { status: 400 }
    );
  }

  const url = `${BE_API_URL}/groups/remove-user?group_id=${encodeURIComponent(
    group_id
  )}&user_email=${encodeURIComponent(user_email)}`;

  try {
    const res = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${BE_API_SECRET}`,
      },
    });
    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: data }, { status: res.status });
    }
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Error in remove-user API:", error);
    return NextResponse.error();
  }
}
