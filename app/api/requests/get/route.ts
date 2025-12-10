import { NextRequest, NextResponse } from 'next/server'
import { MongoClient, ObjectId } from 'mongodb'

interface RequestQuery {
  userId?: ObjectId
  status?: string
  profession?: string
  location?: { $regex: string, $options: string }
}

const MONGODB_URI = process.env.MONGODB_URI

export async function GET(request: NextRequest) {
  try {
    if (!MONGODB_URI) {
      return NextResponse.json({ error: "Database URI not configured" }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const profession = searchParams.get('profession')
    const location = searchParams.get('location')
    const userId = searchParams.get('userId')

    const client = new MongoClient(MONGODB_URI)
    await client.connect()
    const db = client.db("handimatch")

    // Build query
    const query: RequestQuery = {}
    if (userId) {
      query.userId = new ObjectId(userId)
    } else {
      // For artisans: show pending requests OR requests where they are accepted
      query.$or = [
        { status: 'pending' },
        { status: 'in-progress' },
        { status: 'completed' }
      ]
      if (profession) query.profession = profession
      if (location) query.location = { $regex: location, $options: 'i' }
    }

    // Fetch requests with user details
    const requests = await db.collection("requests").aggregate([
      { $match: query },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      ...(userId ? [{
        $lookup: {
          from: "users",
          localField: "artisanId",
          foreignField: "_id",
          as: "artisan"
        }
      }, {
        $unwind: { path: "$artisan", preserveNullAndEmptyArrays: true }
      }] : []),
      {
        $project: userId ? {
          _id: { $toString: "$_id" },
          title: "$description",
          description: "$profession",
          status: 1,
          createdAt: { $dateToString: { format: "%Y-%m-%dT%H:%M:%SZ", date: "$createdAt" } },
          artisanName: { $ifNull: ["$artisan.name", null] },
          artisanId: { $ifNull: [{ $toString: "$artisan._id" }, null] }
        } : {
          _id: { $toString: "$_id" },
          profession: 1,
          description: 1,
          urgency: 1,
          location: 1,
          preferredDate: {
            $cond: {
              if: { $ne: ["$preferredDate", null] },
              then: { $dateToString: { format: "%Y-%m-%d", date: "$preferredDate" } },
              else: null
            }
          },
          photos: {
            $cond: {
              if: { $and: [{ $ne: ["$photo", null] }, { $ne: ["$photo", ""] }] },
              then: ["$photo"],
              else: []
            }
          },
          user: {
            firstName: "$user.firstName",
            lastName: "$user.lastName",
            email: "$user.email",
            phone: "$user.phone"
          },
          createdAt: { $dateToString: { format: "%Y-%m-%dT%H:%M:%SZ", date: "$createdAt" } },
          status: 1,
          artisanId: { $ifNull: [{ $toString: "$artisanId" }, null] },
          artisanAccepted: 1,
          clientAccepted: 1,
          artisanCompleted: 1,
          clientConfirmed: 1,
          applications: 1
        }
      },
      { $sort: { createdAt: -1 } }
    ]).toArray()

    await client.close()

    return NextResponse.json({ requests })
  } catch (error) {
    console.error('Error fetching requests:', error)
    return NextResponse.json(
      { error: 'Erreur lors du chargement des demandes' },
      { status: 500 }
    )
  }
}
