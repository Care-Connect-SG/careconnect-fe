import { NextResponse } from "next/server";

const BE_API_URL = process.env.BE_API_URL || "http://localhost:8000/api/v1";
const BE_API_SECRET = process.env.BE_API_SECRET || "";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Expect the JSON payload to contain: group_id and user_id
    const { group_id, user_id } = body;
    
    // Construct the backend URL with query parameters
    const url = `${BE_API_URL}/groups/add-user?group_id=${encodeURIComponent(
      group_id
    )}&user_id=${encodeURIComponent(user_id)}`;
    
    console.log("Adding user at:", url);
    
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${BE_API_SECRET}`,
      },
    });
    
    console.log("Response status:", res.status);
    const data = await res.json();
    console.log("Add user response data:", data);
    
    if (!res.ok) {
      return NextResponse.json({ error: data }, { status: res.status });
    }
    
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Error adding user:", error);
    return NextResponse.error();
  }
}
