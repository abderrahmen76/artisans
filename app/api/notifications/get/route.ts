import { NextRequest, NextResponse } from 'next/server'
import { MongoClient, ObjectId } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI

export async function GET(req: NextRequest) {
  let client: MongoClient | null = null

  try {
    if (!MONGODB_URI) {
      return NextResponse.json({ error: "Database URI not configured" }, { status: 500 })
    }

    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    client = new MongoClient(MONGODB_URI)
    await client.connect()
    const db = client.db("handimatch")

    // Fetch notifications for the user, sorted by creation date (newest first)
    const notifications = await db.collection("notifications")
      .find({ userId: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .toArray()

    // Get unread count
    const unreadCount = await db.collection("notifications")
      .countDocuments({ userId: new ObjectId(userId), isRead: false })

    return NextResponse.json({
      notifications,
      unreadCount
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  } finally {
    if (client) {
      await client.close()
    }
  }
}
