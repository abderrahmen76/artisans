import { NextRequest, NextResponse } from "next/server"
import { MongoClient, ObjectId } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI

export async function GET(req: NextRequest) {
  try {
    if (!MONGODB_URI) {
      return NextResponse.json({ error: "Database URI not configured" }, { status: 500 })
    }

    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const client = new MongoClient(MONGODB_URI)
    await client.connect()
    const db = client.db("handimatch")

    // Get user profile data
    const user = await db.collection("users").findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0 } } // Exclude password from response
    )

    if (!user) {
      await client.close()
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    let stats = null
    let subscription = null
    let training = []
    let recentActivity = []

    // For artisans, get additional data
    if (user.userType === "artisan") {
      // Get artisan statistics
      const completedRequests = await db.collection("requests").countDocuments({
        artisanId: new ObjectId(userId),
        status: "completed"
      })

      const totalRatings = await db.collection("ratings").aggregate([
        { $match: { artisanId: new ObjectId(userId) } },
        {
          $group: {
            _id: null,
            averageRating: { $avg: "$rating" },
            count: { $sum: 1 }
          }
        }
      ]).toArray()

      const averageRating = totalRatings.length > 0 ? totalRatings[0].averageRating : 0
      const satisfactionRate = completedRequests > 0 ? Math.round((averageRating / 5) * 100) : 0

      stats = {
        completedRequests,
        averageRating: Math.round(averageRating * 10) / 10,
        satisfactionRate
      }

      // Get artisan subscription
      subscription = await db.collection("subscriptions").findOne({
        userId: new ObjectId(userId),
        active: true
      })

      // Get artisan training/courses
      training = await db.collection("training").find({
        userId: new ObjectId(userId)
      }).toArray()

      // Get recent activity (last 5 requests involving this artisan)
      recentActivity = await db.collection("requests").aggregate([
        {
          $match: {
            $or: [
              { artisanId: new ObjectId(userId) },
              { userId: new ObjectId(userId) }
            ]
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "client"
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "artisanId",
            foreignField: "_id",
            as: "artisan"
          }
        },
        {
          $project: {
            _id: 1,
            title: 1,
            description: 1,
            status: 1,
            createdAt: 1,
            updatedAt: 1,
            clientName: { $arrayElemAt: ["$client.firstName", 0] },
            clientLastName: { $arrayElemAt: ["$client.lastName", 0] },
            artisanName: { $arrayElemAt: ["$artisan.name", 0] }
          }
        },
        { $sort: { updatedAt: -1 } },
        { $limit: 5 }
      ]).toArray()
    }

    await client.close()

    return NextResponse.json({
      user,
      stats,
      subscription,
      training,
      recentActivity
    })
  } catch (error) {
    console.error("Get profile error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    if (!MONGODB_URI) {
      return NextResponse.json({ error: "Database URI not configured" }, { status: 500 })
    }

    const body = await req.json()
    const { userId, ...updateData } = body

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const client = new MongoClient(MONGODB_URI)
    await client.connect()
    const db = client.db("handimatch")

    // Update user profile
    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateData }
    )

    await client.close()

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Profile updated successfully" })
  } catch (error) {
    console.error("Update profile error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
