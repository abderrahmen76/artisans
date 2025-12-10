import { NextRequest, NextResponse } from "next/server"
import { MongoClient } from "mongodb"
import bcrypt from "bcryptjs"

const MONGODB_URI = process.env.MONGODB_URI

export async function POST(req: NextRequest) {
  try {
    if (!MONGODB_URI) {
      return NextResponse.json({ error: "Database URI not configured" }, { status: 500 })
    }

    const body = await req.json()
    const { email, password, userType } = body

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 })
    }

    const client = new MongoClient(MONGODB_URI)
    await client.connect()
    const db = client.db("handimatch")

    const existingUser = await db.collection("users").findOne({ email })
    if (existingUser) {
      await client.close()
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    let userData: any = {
      email,
      password: hashedPassword,
      userType,
      createdAt: new Date(),
    }

    if (userType === "client") {
      userData.firstName = body.firstName
      userData.lastName = body.lastName
      userData.phone = body.phone
    } else if (userType === "artisan") {
      userData.name = body.name
      userData.profession = body.profession
      userData.location = body.location
      userData.phone = body.phone
      userData.description = body.description
      userData.photo = body.photo
    }

    const result = await db.collection("users").insertOne(userData)
    await client.close()

    return NextResponse.json(
      { message: "User created", userId: result.insertedId },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}