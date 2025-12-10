import { NextRequest, NextResponse } from 'next/server'
import { MongoClient, ObjectId } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI

export async function POST(req: NextRequest) {
  let client: MongoClient | null = null

  try {
    if (!MONGODB_URI) {
      return NextResponse.json({ error: "Database URI not configured" }, { status: 500 })
    }

    const { requestId, artisanId, clientId, rating, comment } = await req.json()

    if (!requestId || !artisanId || !clientId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }

    client = new MongoClient(MONGODB_URI)
    await client.connect()
    const db = client.db("handimatch")

    // Find the request to verify it exists and is completed
    const request = await db.collection("requests").findOne({
      _id: new ObjectId(requestId),
      status: 'completed'
    })

    if (!request) {
      return NextResponse.json({ error: 'Request not found or not completed' }, { status: 404 })
    }

    // Check if rating already exists
    const existingRating = await db.collection("ratings").findOne({
      requestId: new ObjectId(requestId),
      clientId: new ObjectId(clientId)
    })

    if (existingRating) {
      return NextResponse.json({ error: 'Rating already submitted' }, { status: 400 })
    }

    // Create rating
    const newRating = {
      requestId: new ObjectId(requestId),
      artisanId: new ObjectId(artisanId),
      clientId: new ObjectId(clientId),
      rating,
      comment: comment || '',
      satisfaction: rating >= 4 ? 100 : 0, // Simple satisfaction based on rating
      createdAt: new Date(),
      updatedAt: new Date()
    }

    await db.collection("ratings").insertOne(newRating)

    // Create notification for artisan
    await db.collection("notifications").insertOne({
      userId: new ObjectId(artisanId),
      type: "rating_received",
      title: "Nouvelle évaluation",
      message: "Vous avez reçu une nouvelle évaluation de la part d'un client.",
      requestId: new ObjectId(requestId),
      relatedUserId: new ObjectId(clientId),
      isRead: false,
      createdAt: new Date()
    })

    // Update artisan stats
    const allRatings = await db.collection("ratings").find({
      artisanId: new ObjectId(artisanId)
    }).toArray()

    const totalRatings = allRatings.length
    const sumRatings = allRatings.reduce((sum, r) => sum + r.rating, 0)
    const averageRating = totalRatings > 0 ? sumRatings / totalRatings : 0

    const satisfiedRatings = allRatings.filter(r => r.rating >= 4).length
    const satisfactionRate = totalRatings > 0 ? (satisfiedRatings / totalRatings) * 100 : 0

    // Update artisan stats
    await db.collection("users").updateOne(
      { _id: new ObjectId(artisanId) },
      {
        $set: {
          'stats.completedRequests': totalRatings,
          'stats.averageRating': averageRating,
          'stats.satisfactionRate': satisfactionRate,
          updatedAt: new Date()
        }
      }
    )

    return NextResponse.json({ message: 'Rating submitted successfully' })
  } catch (error) {
    console.error('Rating submission error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  } finally {
    if (client) {
      await client.close()
    }
  }
}
