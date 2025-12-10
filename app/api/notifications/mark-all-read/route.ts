import { NextRequest, NextResponse } from 'next/server'
import { MongoClient, ObjectId } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI

export async function POST(req: NextRequest) {
  let client: MongoClient | null = null

  try {
    if (!MONGODB_URI) {
      return NextResponse.json({ error: "Database URI not configured" }, { status: 500 })
    }

    const { userId } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    client = new MongoClient(MONGODB_URI)
    await client.connect()
    const db = client.db("handimatch")

    // Mark all notifications as read for the user
    const result = await db.collection("notifications").updateMany(
      { userId: new ObjectId(userId), isRead: false },
      { $set: { isRead: true } }
    )

    return NextResponse.json({
      success: true,
      modifiedCount: result.modifiedCount
    })
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  } finally {
    if (client) {
      await client.close()
    }
  }
}
