import { NextRequest, NextResponse } from "next/server"
import { MongoClient, ObjectId } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI

export async function POST(req: NextRequest) {
  try {
    if (!MONGODB_URI) {
      return NextResponse.json({ error: "Database URI not configured" }, { status: 500 })
    }

    const body = await req.json()
    const { userId, profession, description, urgency, preferredDate, location, photo } = body

    // Validate required fields
    if (!userId || !profession || !description || !location) {
      return NextResponse.json(
        { error: "Missing required fields: userId, profession, description, location" },
        { status: 400 }
      )
    }

    const client = new MongoClient(MONGODB_URI)
    await client.connect()
    const db = client.db("handimatch")

    // Create the request document
    const requestDoc = {
      userId: new ObjectId(userId),
      profession,
      description,
      urgency: urgency || "normal",
      preferredDate: preferredDate ? new Date(preferredDate) : null,
      location,
      photo: photo || null,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Insert into database
    const result = await db.collection("requests").insertOne(requestDoc)

    await client.close()

    return NextResponse.json({
      success: true,
      requestId: result.insertedId,
      message: "Request published successfully"
    })

  } catch (error) {
    console.error("Error publishing request:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
