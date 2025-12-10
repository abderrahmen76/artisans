"use client"

import { useAuth } from "@/app/contexts/AuthContext"
import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, MapPin, Phone, Mail, Calendar, Bell, Plus, Star, Award, TrendingUp, BookOpen, Check, Eye, Edit, ChevronDown } from "lucide-react"

interface Request {
  _id: string
  title: string
  description: string
  status: "pending" | "in-progress" | "completed" | "cancelled"
  createdAt: string
  artisanName?: string
  artisanId?: string
}

interface Notification {
  _id: string
  title: string
  message: string
  createdAt: string
  isRead: boolean
}

interface UserProfile {
  _id: string
  email: string
  userType: "client" | "artisan"
  firstName?: string
  lastName?: string
  name?: string
  phone?: string
  location?: string
  profession?: string
  description?: string
  photo?: string
  subscription?: {
    type: string
    active: boolean
    method: string
  }
  training?: {
    name: string
    progress: number
  }[]
  stats?: {
    completedRequests: number
    averageRating: number
    satisfactionRate: number
  }
}

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const [requests, setRequests] = useState<Request[]>([])
  const [profileData, setProfileData] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    name: "",
    phone: "",
    location: "",
    profession: "",
    description: ""
  })
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null)
  const [selectedArtisanId, setSelectedArtisanId] = useState<string | null>(null)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmittingRating, setIsSubmittingRating] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [notificationCount, setNotificationCount] = useState(0)

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return

      try {
        setLoading(true)

        // Fetch user profile
        const profileResponse = await fetch(`/api/profile?userId=${user._id}`)
        if (profileResponse.ok) {
          const profileResult = await profileResponse.json()
          setProfileData(profileResult.user)
          setEditForm({
            firstName: profileResult.user.firstName || "",
            lastName: profileResult.user.lastName || "",
            name: profileResult.user.name || "",
            phone: profileResult.user.phone || "",
            location: profileResult.user.location || "",
            profession: profileResult.user.profession || "",
            description: profileResult.user.description || ""
          })
        }

        // Fetch user requests
        const requestsResponse = await fetch(`/api/requests/get?userId=${user._id}`)
        if (requestsResponse.ok) {
          const requestsResult = await requestsResponse.json()
          setRequests(requestsResult.requests || [])
        }

        // Fetch user notifications
        const notificationsResponse = await fetch(`/api/notifications/get?userId=${user._id}`)
        if (notificationsResponse.ok) {
          const notificationsResult = await notificationsResponse.json()
          setNotifications(notificationsResult.notifications || [])
          setNotificationCount(notificationsResult.unreadCount || 0)
        }
      } catch (error) {
        console.error("Error fetching profile data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfileData()
  }, [user])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "in-progress": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "completed": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "cancelled": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending": return "En attente"
      case "in-progress": return "En cours"
      case "completed": return "Terminé"
      case "cancelled": return "Annulé"
      default: return status
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setUploadError(null)

      // Create preview URL
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !user) return

    setIsUploading(true)
    setUploadError(null)

    try {
      // Upload to Cloudinary
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('upload_preset', 'handimatch_profiles') // You'll need to create this preset in Cloudinary

      const cloudinaryResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!cloudinaryResponse.ok) {
        throw new Error('Upload to Cloudinary failed')
      }

      const cloudinaryData = await cloudinaryResponse.json()

      // Update user photo in database
      const updateResponse = await fetch('/api/profile/update-photo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user._id,
          photoUrl: cloudinaryData.secure_url,
        }),
      })

      if (!updateResponse.ok) {
        throw new Error('Failed to update profile photo')
      }

      // Update local user state
      const updatedUser = { ...user, photo: cloudinaryData.secure_url }
      localStorage.setItem('user', JSON.stringify(updatedUser))

      // Reset form
      setSelectedFile(null)
      setPreviewUrl(null)

      // Show success message (you might want to add a toast notification here)
      alert('Photo de profil mise à jour avec succès!')

    } catch (error) {
      console.error('Upload error:', error)
      setUploadError(error instanceof Error ? error.message : 'Erreur lors du téléchargement')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRatingSubmit = async () => {
    if (!user || !selectedRequestId || !selectedArtisanId || rating === 0) return

    setIsSubmittingRating(true)

    try {
      const response = await fetch('/api/rating/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: selectedRequestId,
          artisanId: selectedArtisanId,
          clientId: user._id,
          rating,
          comment,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit rating')
      }

      // Refresh profile data to update stats
      const profileResponse = await fetch(`/api/profile?userId=${user._id}`)
      if (profileResponse.ok) {
        const profileResult = await profileResponse.json()
        setProfileData(profileResult.user)
      }

      // Reset modal
      setShowRatingModal(false)
      setSelectedRequestId(null)
      setSelectedArtisanId(null)
      setRating(0)
      setComment("")

      alert('Merci pour votre évaluation!')
    } catch (error) {
      console.error('Rating submission error:', error)
      alert('Erreur lors de la soumission de l\'évaluation')
    } finally {
      setIsSubmittingRating(false)
    }
  }

  const handleStatusUpdate = async (requestId: string, newStatus: string) => {
    if (!user) return

    setUpdatingStatus(requestId)

    try {
      const response = await fetch('/api/requests/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId,
          status: newStatus,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update request status')
      }

      // Refresh requests data
      const requestsResponse = await fetch(`/api/requests/get?userId=${user._id}`)
      if (requestsResponse.ok) {
        const requestsResult = await requestsResponse.json()
        setRequests(requestsResult.requests || [])
      }

      alert('Statut mis à jour avec succès!')
    } catch (error) {
      console.error('Status update error:', error)
      alert('Erreur lors de la mise à jour du statut')
    } finally {
      setUpdatingStatus(null)
    }
  }

  const markAsRead = async (notificationId: string) => {
    if (!user) return

    try {
      const response = await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationId,
          userId: user._id,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to mark notification as read')
      }

      // Update local state
      setNotifications(prev => prev.map(n =>
        n._id === notificationId ? { ...n, isRead: true } : n
      ))
      setNotificationCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Mark as read error:', error)
      alert('Erreur lors de la mise à jour de la notification')
    }
  }

  const markAllAsRead = async () => {
    if (!user) return

    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user._id,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read')
      }

      // Update local state - mark all notifications as read
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setNotificationCount(0)
    } catch (error) {
      console.error('Mark all as read error:', error)
      alert('Erreur lors de la mise à jour des notifications')
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Accès non autorisé</h1>
          <p className="text-muted-foreground mb-6">Vous devez être connecté pour accéder à cette page.</p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-orange-500 to-amber-600 px-6 py-3 text-sm font-medium text-white shadow-md transition-all hover:shadow-lg hover:opacity-90"
          >
            Se connecter
          </Link>
        </div>
      </div>
    )
  }

  // At this point, user is guaranteed to be non-null
  const userType = user.userType;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft size={20} />
              Retour à l&apos;accueil
            </Link>
            <h1 className="text-xl font-semibold text-foreground">Mon Profil</h1>
            <div className="w-20"></div> {/* Spacer */}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex gap-1 mb-8 border-b border-border">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "overview"
                ? "text-orange-600 border-b-2 border-orange-600 dark:text-orange-400 dark:border-orange-400"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Aperçu
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "notifications"
                ? "text-orange-600 border-b-2 border-orange-600 dark:text-orange-400 dark:border-orange-400"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Notifications
          </button>
        </div>

        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Personal Information */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Informations personnelles</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium text-foreground">{user.email}</p>
                  </div>
                </div>

                {user.userType === "client" && (
                  <>
                    <div className="flex items-center gap-3">
                      <span className="text-lg">👤</span>
                      <div>
                        <p className="text-sm text-muted-foreground">Nom</p>
                        <p className="font-medium text-foreground">
                          {profileData?.firstName && profileData?.lastName ? `${profileData.firstName} ${profileData.lastName}` : "Non spécifié"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone size={18} className="text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Téléphone</p>
                        <p className="font-medium text-foreground">{profileData?.phone || "Non spécifié"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin size={18} className="text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Localisation</p>
                        <p className="font-medium text-foreground">{profileData?.location || "Non spécifié"}</p>
                      </div>
                    </div>
                  </>
                )}

                {user.userType === "artisan" && (
                  <>
                    <div className="flex items-center gap-3">
                      <span className="text-lg">👷</span>
                      <div>
                        <p className="text-sm text-muted-foreground">Nom</p>
                        <p className="font-medium text-foreground">{profileData?.name || "Non spécifié"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg">🔧</span>
                      <div>
                        <p className="text-sm text-muted-foreground">Métier</p>
                        <p className="font-medium text-foreground">{profileData?.profession || "Non spécifié"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin size={18} className="text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Localisation</p>
                        <p className="font-medium text-foreground">{profileData?.location || "Non spécifié"}</p>
                      </div>
                    </div>
                    {profileData?.description && (
                      <div className="flex items-start gap-3 md:col-span-2">
                        <span className="text-lg">📝</span>
                        <div>
                          <p className="text-sm text-muted-foreground">Description</p>
                          <p className="font-medium text-foreground">{profileData.description}</p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Profile Photo Upload */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Photo de profil</h2>
              <div className="flex items-center gap-6">
                {/* Current/Preview Photo */}
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-border bg-secondary">
                    {(previewUrl || user.photo) ? (
                      <img
                        src={previewUrl || user.photo}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">
                        {user.userType === "artisan" ? "👷" : "👤"}
                      </div>
                    )}
                  </div>
                </div>

                {/* Upload Controls */}
                <div className="flex-1 space-y-4">
                  <div>
                    <label htmlFor="photo-upload" className="block text-sm font-medium text-foreground mb-2">
                      Choisir une nouvelle photo
                    </label>
                    <input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 dark:file:bg-orange-950 dark:file:text-orange-300"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Formats acceptés: JPG, PNG, GIF. Taille maximale: 5MB
                    </p>
                  </div>

                  {uploadError && (
                    <p className="text-sm text-red-600 dark:text-red-400">{uploadError}</p>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={handleUpload}
                      disabled={!selectedFile || isUploading}
                      className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-600 px-4 py-2 text-sm font-medium text-white shadow-md transition-all hover:shadow-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUploading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Téléchargement...
                        </>
                      ) : (
                        <>
                          <Plus size={16} />
                          Mettre à jour
                        </>
                      )}
                    </button>

                    {selectedFile && (
                      <button
                        onClick={() => {
                          setSelectedFile(null)
                          setPreviewUrl(null)
                          setUploadError(null)
                        }}
                        className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
                      >
                        Annuler
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Actions rapides</h2>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/publish-request"
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-600 px-4 py-2 text-sm font-medium text-white shadow-md transition-all hover:shadow-lg hover:opacity-90"
                >
                  <Plus size={16} />
                  Nouvelle demande
                </Link>
                <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors">
                  <Bell size={16} />
                  Notifications
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Activité récente</h2>
              <div className="space-y-3">
                {requests.slice(0, 3).map((request) => (
                  <div key={request._id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 dark:bg-secondary">
                    <div>
                      <p className="font-medium text-foreground">{request.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(request.createdAt).toLocaleDateString('fr-FR')}
                        {request.artisanName && ` • ${request.artisanName}`}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {getStatusText(request.status)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Artisan Statistics */}
            {user.userType === "artisan" && profileData?.stats && (
              <div className="bg-card rounded-lg border border-border p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Statistiques</h2>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-950">
                    <TrendingUp size={24} className="text-green-600 dark:text-green-400" />
                    <div>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">{profileData.stats.completedRequests}</p>
                      <p className="text-sm text-green-700 dark:text-green-300">Demandes terminées</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950">
                    <Star size={24} className="text-yellow-600 dark:text-yellow-400" />
                    <div>
                      <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{profileData.stats.averageRating.toFixed(1)}</p>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">Note moyenne</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-950">
                    <Award size={24} className="text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{profileData.stats.satisfactionRate}%</p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">Satisfaction client</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Artisan Subscription & Training */}
            {user.userType === "artisan" && (
              <div className="bg-card rounded-lg border border-border p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Abonnement & Formation</h2>
                <div className="space-y-4">
                  {profileData?.subscription && (
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-950">
                      <Star size={20} className="text-green-600 dark:text-green-400" />
                      <div className="flex-1">
                        <p className="font-medium text-green-800 dark:text-green-200">Abonnement {profileData.subscription.type} {profileData.subscription.active ? 'Actif' : 'Inactif'}</p>
                        <p className="text-sm text-green-700 dark:text-green-300">Méthode {profileData.subscription.method} - Accès complet</p>
                      </div>
                      {profileData.subscription.active && <Check size={20} className="text-green-600 dark:text-green-400" />}
                    </div>
                  )}
                  {profileData?.training && profileData.training.map((course, index) => (
                    <div key={index} className="flex items-center gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-950">
                      <BookOpen size={20} className="text-blue-600 dark:text-blue-400" />
                      <div className="flex-1">
                        <p className="font-medium text-blue-800 dark:text-blue-200">{course.name}</p>
                        <p className="text-sm text-blue-700 dark:text-blue-300">{course.progress}% terminé</p>
                        <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2 mt-2">
                          <div className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full" style={{ width: `${course.progress}%` }}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Requests */}
            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Toutes mes demandes</h2>
                <Link
                  href="/requests"
                  className="text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
                >
                  Voir toutes les demandes →
                </Link>
              </div>
              <div className="space-y-3">
                {requests.slice(-5).reverse().map((request) => (
                  <div key={request._id} className="flex items-center justify-between p-4 rounded-lg border border-border">
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{request.title}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(request.createdAt).toLocaleDateString('fr-FR')}
                        {request.artisanName && (
                          <>
                            <span className="mx-2">•</span>
                            <span className="text-lg">👷</span>
                            {request.artisanName}
                          </>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <select
                          value={request.status}
                          onChange={(e) => handleStatusUpdate(request._id, e.target.value)}
                          disabled={updatingStatus === request._id}
                          className={`px-3 py-1 rounded-full text-xs font-medium appearance-none pr-8 ${getStatusColor(request.status)} disabled:opacity-50`}
                        >
                          <option value="pending">En attente</option>
                          <option value="in-progress">En cours</option>
                          <option value="completed">Terminé</option>
                          <option value="cancelled">Annulé</option>
                        </select>
                        <ChevronDown size={12} className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-current" />
                      </div>
                      <Link
                        href={`/requests?requestId=${request._id}`}
                        className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Eye size={16} />
                      </Link>
                      {request.status === "pending" && userType === "client" && (
                        <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                          <Edit size={16} />
                        </button>
                      )}
                      {request.status === "completed" && userType === "client" && (
                        <button
                          onClick={() => {
                            setSelectedRequestId(request._id)
                            setSelectedArtisanId(request.artisanId || null)
                            setShowRatingModal(true)
                          }}
                          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Star size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
              {notifications.length > 0 && notificationCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-3 py-1 text-sm bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
                >
                  Tout marquer comme lu
                </button>
              )}
            </div>
            {notifications.length === 0 ? (
              <p className="text-muted-foreground">Aucune notification pour le moment.</p>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-4 rounded-lg border border-border ${
                      !notification.isRead ? 'bg-blue-50 dark:bg-blue-950' : 'bg-secondary/50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground">{notification.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(notification.createdAt).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification._id)}
                          className="ml-2 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          Marquer comme lu
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg border border-border p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-foreground mb-4">Évaluer l&apos;artisan</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Note</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition-colors`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Commentaire (optionnel)</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500"
                  rows={3}
                  placeholder="Partagez votre expérience..."
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setShowRatingModal(false)
                    setSelectedRequestId(null)
                    setRating(0)
                    setComment("")
                  }}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleRatingSubmit}
                  disabled={rating === 0 || isSubmittingRating}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-600 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingRating ? 'Envoi...' : 'Envoyer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
