import { NextRequest, NextResponse } from "next/server"
import { MongoClient, ObjectId } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI

export async function POST(req: NextRequest) {
  try {
    if (!MONGODB_URI) {
      return NextResponse.json({ error: "Database URI not configured" }, { status: 500 })
    }

    const body = await req.json()
    const { userId, photoUrl } = body

    if (!userId || !photoUrl) {
      return NextResponse.json({ error: "User ID and photo URL required" }, { status: 400 })
    }

    const client = new MongoClient(MONGODB_URI)
    await client.connect()
    const db = client.db("handimatch")

    // Update user photo
    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { $set: { photo: photoUrl } }
    )

    await client.close()

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Profile photo updated successfully" })
  } catch (error) {
    console.error("Update photo error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
