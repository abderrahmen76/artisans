import { NextRequest, NextResponse } from 'next/server'
import { MongoClient, ObjectId } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI

export async function POST(request: NextRequest) {
  let client: MongoClient | null = null

  try {
    if (!MONGODB_URI) {
      return NextResponse.json({ error: "Database URI not configured" }, { status: 500 })
    }

    const { notificationId, userId } = await request.json()

    if (!notificationId || !userId) {
      return NextResponse.json(
        { error: 'Notification ID and User ID are required' },
        { status: 400 }
      )
    }

    client = new MongoClient(MONGODB_URI)
    await client.connect()
    const db = client.db("handimatch")

    // Find and update the notification
    const result = await db.collection("notifications").updateOne(
      { _id: new ObjectId(notificationId), userId: new ObjectId(userId) },
      { $set: { isRead: true } }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Notification not found or access denied' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Notification marked as read'
    })

  } catch (error) {
    console.error('Error marking notification as read:', error)
    return NextResponse.json(
      { error: 'Failed to mark notification as read' },
      { status: 500 }
    )
  } finally {
    if (client) {
      await client.close()
    }
  }
}
