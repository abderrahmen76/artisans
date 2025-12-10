import { NextRequest, NextResponse } from 'next/server'
import { MongoClient, ObjectId } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI

export async function POST(request: NextRequest) {
  try {
    if (!MONGODB_URI) {
      return NextResponse.json({ error: "Database URI not configured" }, { status: 500 })
    }

    const { requestId, status } = await request.json()

    if (!requestId || !status) {
      return NextResponse.json({ error: "Request ID and status are required" }, { status: 400 })
    }

    const validStatuses = ['pending', 'in-progress', 'completed', 'cancelled']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const client = new MongoClient(MONGODB_URI)
    await client.connect()
    const db = client.db("handimatch")

    // Get current request to check if artisan needs to be removed
    const currentRequest = await db.collection("requests").findOne({ _id: new ObjectId(requestId) })

    if (!currentRequest) {
      await client.close()
      return NextResponse.json({ error: "Request not found" }, { status: 404 })
    }

    // Prepare update object
    const updateObj: Record<string, unknown> = {
      status: status,
      updatedAt: new Date()
    }

    // If changing to pending from completed or in-progress, reset the request to initial state
    if (status === 'pending' && (currentRequest.status === 'completed' || currentRequest.status === 'in-progress')) {
      updateObj.artisanId = null
      updateObj.artisanAccepted = false
      updateObj.clientAccepted = false
      updateObj.artisanCompleted = false
      updateObj.clientConfirmed = false
      // Clear applications array so artisans can apply again
      updateObj.applications = []
    }

    // If changing from in-progress to another status (not pending), remove the artisan (fire them)
    if (currentRequest.status === 'in-progress' && status !== 'in-progress' && status !== 'pending' && currentRequest.artisanId) {
      updateObj.artisanId = null
      updateObj.artisanAccepted = false
      updateObj.clientAccepted = false
      updateObj.artisanCompleted = false
      updateObj.clientConfirmed = false
      // Clear applications array as well
      updateObj.applications = []
    }

    // Update request status
    const result = await db.collection("requests").updateOne(
      { _id: new ObjectId(requestId) },
      { $set: updateObj }
    )

    if (result.matchedCount === 0) {
      await client.close()
      return NextResponse.json({ error: "Request not found" }, { status: 404 })
    }

    // Create notification if request is completed
    if (status === 'completed' && currentRequest.artisanId) {
      const notification = {
        userId: new ObjectId(currentRequest.userId), // Notify the client
        type: 'request_completed',
        title: 'Demande terminée',
        message: 'Votre demande a été terminée par l\'artisan. Vous pouvez maintenant évaluer le travail.',
        requestId: new ObjectId(requestId),
        relatedUserId: new ObjectId(currentRequest.artisanId), // The artisan who completed it
        isRead: false,
        createdAt: new Date()
      }

      await db.collection("notifications").insertOne(notification)
    }

    await client.close()

    return NextResponse.json({ success: true, message: "Request status updated successfully" })
  } catch (error) {
    console.error('Error updating request status:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du statut' },
      { status: 500 }
    )
  }
}
