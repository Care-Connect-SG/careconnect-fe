// app/api/groups/route.ts
import { NextResponse } from "next/server";

const BE_API_URL = process.env.BE_API_URL || "http://localhost:8000/api/v1";
const BE_API_SECRET = process.env.BE_API_SECRET || "";

export async function GET(request: Request) {
  const endpoint = `${BE_API_URL}/groups`;
  console.log("Fetching groups from:", endpoint);
  try {
    const res = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Use Authorization header as Bearer token, if that’s what your backend requires.
        Authorization: `Bearer ${BE_API_SECRET}`,
      },
    });

    console.log("Response status:", res.status);
    const data = await res.json();
    console.log("Data fetched:", data);
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Error fetching groups:", error);
    return NextResponse.error();
  }
}


// POST handler: Create a new group
export async function POST(request: Request) {
    try {
      const body = await request.json();
      console.log("Request body received:", body);
      
      // Construct the payload as expected by your backend.
      const payload = {
        group_id: "", // Leave empty to let the backend generate an ID
        name: body.name,
        description: body.description,
      };
  
      const url = `${BE_API_URL}/groups/create`;
      console.log("Creating group at:", url);
      console.log("Payload being sent:", payload);
  
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${BE_API_SECRET}`,
        },
        body: JSON.stringify(payload),
      });
  
      console.log("Response status:", res.status);
      const data = await res.json();
      console.log("Response data:", data);
  
      if (!res.ok) {
        return NextResponse.json({ error: data }, { status: res.status });
      }
  
      return NextResponse.json(data, { status: res.status });
    } catch (error) {
      console.error("Error creating group:", error);
      return NextResponse.error();
    }
  }

  export async function PUT(request: Request) {
    try {
      // Expect the request body to contain:
      // group_name (the original name), new_name, and new_description.
      const body = await request.json();
      const { group_id, new_name, new_description } = body;
      
      // Construct the backend URL with query parameters.
      const url = `${BE_API_URL}/groups/edit?group_id=${encodeURIComponent(
        group_id
      )}&new_name=${encodeURIComponent(new_name)}&new_description=${encodeURIComponent(
        new_description
      )}`;

      console.log("Updating group at:", url);
      
      const res = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${BE_API_SECRET}`,
        },
      });
      
      console.log("Response status:", res.status);
      const data = await res.json();
      console.log("Update response data:", data);
      
      if (!res.ok) {
        return NextResponse.json({ error: data }, { status: res.status });
      }
      
      return NextResponse.json(data, { status: res.status });
    } catch (error) {
      console.error("Error updating group:", error);
      return NextResponse.error();
    }
  }