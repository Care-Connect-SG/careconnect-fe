import { NextResponse } from "next/server";

const BE_API_URL = process.env.BE_API_URL || "http://localhost:8000/api/v1";
const BE_API_SECRET = process.env.BE_API_SECRET || "";

export async function GET(request: Request) {
  const endpoint = `${BE_API_URL}/users`;
  console.log("Fetching users from:", endpoint);
  try {
    const res = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${BE_API_SECRET}`,
      },
    });

    console.log("Response status:", res.status);
    const data = await res.json();
    console.log("Users fetched:", data);
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.error();
  }
}
