import { NextRequest, NextResponse } from "next/server"
import { MongoClient } from "mongodb"
import bcrypt from "bcryptjs"

const MONGODB_URI = process.env.MONGODB_URI!

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 })
    }

    const client = new MongoClient(MONGODB_URI)
    await client.connect()
    const db = client.db("handimatch")

    // Find user
    const user = await db.collection("users").findOne({ email })
    if (!user) {
      await client.close()
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Check password
    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      await client.close()
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    await client.close()

    // Return user data based on userType
    const userData: any = {
      _id: user._id,
      email: user.email,
      userType: user.userType,
      photo: user.photo
    }

    if (user.userType === "client") {
      userData.firstName = user.firstName
      userData.lastName = user.lastName
      userData.phone = user.phone
    } else if (user.userType === "artisan") {
      userData.name = user.name
      userData.profession = user.profession
      userData.location = user.location
      userData.phone = user.phone
      userData.description = user.description
      userData.photo = user.photo
    }

    return NextResponse.json(
      { message: "Login successful", user: userData },
      { status: 200 }
    )
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}