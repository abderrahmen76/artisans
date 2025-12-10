import { NextRequest, NextResponse } from "next/server"
import { MongoClient } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI

export async function GET(req: NextRequest) {
  try {
    if (!MONGODB_URI) {
      return NextResponse.json({ error: "Database URI not configured" }, { status: 500 })
    }

    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q') || ''
    const location = searchParams.get('location') || ''
    const profession = searchParams.get('profession') || ''

    const client = new MongoClient(MONGODB_URI)
    await client.connect()
    const db = client.db("handimatch")

    // Build search query
    const searchQuery: any = {
      userType: "artisan"
    }

    // Text search on description, profession, and name
    if (query) {
      searchQuery.$or = [
        { description: { $regex: query, $options: 'i' } },
        { profession: { $regex: query, $options: 'i' } },
        { name: { $regex: query, $options: 'i' } }
      ]
    }

    // Filter by profession if specified
    if (profession) {
      searchQuery.profession = profession
    }

    // Filter by location if specified
    if (location) {
      searchQuery.location = { $regex: location, $options: 'i' }
    }

    const artisans = await db.collection("users")
      .find(searchQuery)
      .project({
        _id: 1,
        name: 1,
        profession: 1,
        location: 1,
        description: 1,
        photo: 1,
        phone: 1
      })
      .limit(20)
      .toArray()

    await client.close()

    return NextResponse.json({ artisans })
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
