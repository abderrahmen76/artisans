import { NextRequest, NextResponse } from 'next/server'
import { MongoClient, ObjectId } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI

export async function POST(request: NextRequest) {
  let requestId: string = '', userId: string = '', action: string = '', artisanId: string = ''

  try {
    console.log('MONGODB_URI exists:', !!MONGODB_URI)
    console.log('MONGODB_URI value:', MONGODB_URI ? 'Set' : 'Not set')

    if (!MONGODB_URI) {
      console.log('Database URI not configured - returning error')
      return NextResponse.json({ error: "Database URI not configured" }, { status: 500 })
    }

    const body = await request.json()
    ;({ requestId, userId, action, artisanId } = body)

    if (!requestId || !userId || !action) {
      return NextResponse.json({ error: "Request ID, user ID, and action are required" }, { status: 400 })
    }

    console.log('Connecting to MongoDB...')
    const client = new MongoClient(MONGODB_URI)
    await client.connect()
    console.log('Connected to MongoDB successfully')
    const db = client.db("handimatch")

    // Get the request to check current state
    const requestDoc = await db.collection("requests").findOne({ _id: new ObjectId(requestId) })
    if (!requestDoc) {
      await client.close()
      return NextResponse.json({ error: "Request not found" }, { status: 404 })
    }

    let updateOperation: any = {}

    switch (action) {
      case 'artisan-apply':
        // Artisan applies to work on the request
        // Check if artisan already applied
        const alreadyApplied = requestDoc.applications?.some(
          (app: { artisanId: any }) => app.artisanId.toString() === userId
        )
        if (alreadyApplied) {
          await client.close()
          return NextResponse.json({ error: "You have already applied for this request" }, { status: 400 })
        }

        // Add application
        updateOperation = {
          $push: {
            applications: {
              artisanId: new ObjectId(userId),
              appliedAt: new Date(),
              status: 'pending'
            }
          },
          $set: {
            updatedAt: new Date()
          }
        }

        // Create notification for client
        await db.collection("notifications").insertOne({
          userId: requestDoc.userId, // Client's userId
          type: "application_received",
          title: "Nouvelle candidature",
          message: "Un artisan a postulé à votre demande.",
          requestId: new ObjectId(requestId),
          relatedUserId: new ObjectId(userId), // Artisan's userId
          isRead: false,
          createdAt: new Date()
        })
        break

      case 'client-accept-artisan':
        // Client accepts a specific artisan's application
        if (requestDoc.userId.toString() !== userId) {
          await client.close()
          return NextResponse.json({ error: "You can only accept artisans for your own requests" }, { status: 403 })
        }

        if (requestDoc.artisanId) {
          await client.close()
          return NextResponse.json({ error: "An artisan has already been accepted for this request" }, { status: 400 })
        }

        // Find the application and accept it
        const applicationIndex = requestDoc.applications?.findIndex(
          (app: any) => app.artisanId.toString() === artisanId
        )

        if (applicationIndex === -1) {
          await client.close()
          return NextResponse.json({ error: "Application not found" }, { status: 404 })
        }

        // Update the application status and set the artisan
        updateOperation = {
          $set: {
            artisanId: new ObjectId(artisanId),
            artisanAccepted: true,
            artisanAcceptedAt: new Date(),
            clientAccepted: true,
            clientAcceptedAt: new Date(),
            status: 'in-progress',
            [`applications.${applicationIndex}.status`]: 'accepted',
            updatedAt: new Date()
          }
        }

        // Create notification for artisan
        await db.collection("notifications").insertOne({
          userId: new ObjectId(artisanId), // Artisan's userId
          type: "application_accepted",
          title: "Candidature acceptée",
          message: "Votre candidature a été acceptée par le client.",
          requestId: new ObjectId(requestId),
          relatedUserId: requestDoc.userId, // Client's userId
          isRead: false,
          createdAt: new Date()
        })
        break

      case 'artisan-accept':
        // Legacy: Artisan accepts the request (for backward compatibility)
        if (requestDoc.artisanId && requestDoc.artisanId.toString() !== userId) {
          await client.close()
          return NextResponse.json({ error: "Request already assigned to another artisan" }, { status: 400 })
        }
        updateOperation = {
          $set: {
            artisanId: new ObjectId(userId),
            artisanAccepted: true,
            artisanAcceptedAt: new Date(),
            status: 'in-progress',
            updatedAt: new Date()
          }
        }
        break

      case 'client-accept':
        // Legacy: Client accepts the artisan (for backward compatibility)
        if (requestDoc.userId.toString() !== userId) {
          await client.close()
          return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }
        if (!requestDoc.artisanAccepted) {
          await client.close()
          return NextResponse.json({ error: "Artisan hasn't accepted yet" }, { status: 400 })
        }
        updateOperation = {
          $set: {
            clientAccepted: true,
            clientAcceptedAt: new Date(),
            updatedAt: new Date()
          }
        }
        break

      case 'artisan-complete':
        // Artisan marks work as completed
        if (requestDoc.artisanId?.toString() !== userId) {
          await client.close()
          return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }
        updateOperation = {
          $set: {
            artisanCompleted: true,
            artisanCompletedAt: new Date(),
            updatedAt: new Date()
          }
        }

        // Create notification for artisan (confirmation of completion)
        await db.collection("notifications").insertOne({
          userId: new ObjectId(userId), // Artisan's userId
          type: "request_completed",
          title: "Demande terminée",
          message: "Vous avez marqué la demande comme terminée. En attente de confirmation du client.",
          requestId: new ObjectId(requestId),
          relatedUserId: requestDoc.userId, // Client's userId
          isRead: false,
          createdAt: new Date()
        })
        break

      case 'client-confirm':
        // Client confirms completion
        if (requestDoc.userId.toString() !== userId) {
          await client.close()
          return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }
        if (!requestDoc.artisanCompleted) {
          await client.close()
          return NextResponse.json({ error: "Artisan hasn't marked as completed yet" }, { status: 400 })
        }
        updateOperation = {
          $set: {
            clientConfirmed: true,
            clientConfirmedAt: new Date(),
            status: 'completed',
            updatedAt: new Date()
          }
        }
        break

      case 'client-repost':
        // Client reposts request after accepting artisan but having disagreement
        if (requestDoc.userId.toString() !== userId) {
          await client.close()
          return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }
        if (requestDoc.status !== 'in-progress' || requestDoc.clientConfirmed) {
          await client.close()
          return NextResponse.json({ error: "Can only repost requests that are in progress and not yet confirmed by client" }, { status: 400 })
        }
        // Reset the request to allow new artisans to apply
        updateOperation = {
          $set: {
            artisanId: null,
            artisanAccepted: false,
            clientAccepted: false,
            artisanCompleted: false,
            clientConfirmed: false,
            status: 'pending',
            applications: [], // Clear all applications so new artisans can apply
            updatedAt: new Date()
          }
        }
        break

      default:
        await client.close()
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    // Update the request
    console.log('Updating request:', requestId, 'with operation:', updateOperation)
    const result = await db.collection("requests").updateOne(
      { _id: new ObjectId(requestId) },
      updateOperation
    )

    console.log('Update result:', result)

    if (result.matchedCount === 0) {
      await client.close()
      return NextResponse.json({ error: "Request not found" }, { status: 404 })
    }

    await client.close()

    return NextResponse.json({ success: true, message: "Request updated successfully" })
  } catch (error) {
    console.error('Error updating request:', error)
    console.error('Error stack:', error.stack)
    console.error('Request data:', { requestId, userId, action, artisanId })
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la demande', details: error.message },
      { status: 500 }
    )
  }
}
