"use client"

import { useAuth } from "@/app/contexts/AuthContext"
import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, MapPin, Calendar, Phone, Mail, Clock, Filter, Search, AlertTriangle, CheckCircle, Zap, X, MessageCircle, Check, User } from "lucide-react"
import { useToasts } from "@/app/hooks/useToasts"

interface Request {
  _id: string
  profession: string
  description: string
  urgency: string
  location: string
  preferredDate: string | null
  photos: string[]
  user: {
    firstName: string
    lastName: string
    email: string
    phone: string
  }
  createdAt: string
  // Acceptance system fields
  artisanId?: string
  artisanAccepted?: boolean
  clientAccepted?: boolean
  artisanCompleted?: boolean
  clientConfirmed?: boolean
  status: string
}

export default function RequestsPage() {
  const { user } = useAuth()
  const { push: addToast } = useToasts()
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [professionFilter, setProfessionFilter] = useState("")
  const [locationFilter, setLocationFilter] = useState("")
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)
  const [contactModalOpen, setContactModalOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null)

  const professions = ["Plombier", "Électricien", "Menuisier", "Maçon", "Chauffagiste", "Peintre", "Serrurier", "Couvreur"]

  useEffect(() => {
    if (user?.userType !== "artisan") {
      return
    }
    fetchRequests()
  }, [user, professionFilter, locationFilter])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (professionFilter) params.append("profession", professionFilter)
      if (locationFilter) params.append("location", locationFilter)

      const response = await fetch(`/api/requests/get?${params}`)
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des demandes")
      }
      const data = await response.json()
      setRequests(data.requests || [])
    } catch (err) {
      console.error("Erreur:", err)
      setError("Impossible de charger les demandes")
      addToast("Erreur lors du chargement des demandes", "error")
    } finally {
      setLoading(false)
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "very_urgent": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "urgent": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      case "normal": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getUrgencyText = (urgency: string) => {
    switch (urgency) {
      case "very_urgent": return "Très urgent"
      case "urgent": return "Urgent"
      case "normal": return "Normal"
      default: return urgency
    }
  }

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case "very_urgent": return <AlertTriangle size={16} />
      case "urgent": return <Clock size={16} />
      case "normal": return <CheckCircle size={16} />
      default: return <CheckCircle size={16} />
    }
  }

  const openContactModal = (request: Request) => {
    setSelectedRequest(request)
    setContactModalOpen(true)
  }

  const handleWhatsAppContact = () => {
    if (!selectedRequest) return
    const message = encodeURIComponent(`Bonjour ${selectedRequest.user.firstName}, j'ai vu votre demande pour ${selectedRequest.profession} sur Platform Artisans et je suis intéressé pour vous aider.`)
    const whatsappUrl = `https://wa.me/${selectedRequest.user.phone}?text=${message}`
    window.open(whatsappUrl, '_blank')
    setContactModalOpen(false)
    addToast("Ouverture de WhatsApp...", "success")
  }

  const handlePhoneCall = () => {
    if (!selectedRequest) return
    window.open(`tel:${selectedRequest.user.phone}`, '_self')
    setContactModalOpen(false)
    addToast("Appel téléphonique en cours...", "success")
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Connexion requise</h1>
          <p className="text-muted-foreground mb-6">Vous devez être connecté pour accéder à cette page.</p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-600 px-6 py-3 font-semibold text-white shadow-md transition-all hover:shadow-lg hover:opacity-90"
          >
            Se connecter
          </Link>
        </div>
      </div>
    )
  }

  if (user.userType !== "artisan") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Accès refusé</h1>
          <p className="text-muted-foreground mb-6">Cette page est réservée aux artisans.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-600 px-6 py-3 font-semibold text-white shadow-md transition-all hover:shadow-lg hover:opacity-90"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft size={16} />
            Retour à l&apos;accueil
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Demandes clients</h1>
          <p className="text-muted-foreground mt-2">Découvrez les demandes de clients près de chez vous</p>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-lg border border-border p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={20} className="text-muted-foreground" />
            <h2 className="text-lg font-semibold text-foreground">Filtres</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Métier</label>
              <select
                value={professionFilter}
                onChange={(e) => setProfessionFilter(e.target.value)}
                className="w-full rounded-lg border border-input dark:border-slate-600 bg-background dark:bg-slate-700 py-3 px-4 text-foreground dark:text-white transition-all focus:border-orange-500 dark:focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 dark:focus:ring-orange-400/20 focus:outline-none"
              >
                <option value="">Tous les métiers</option>
                {professions.map((prof) => (
                  <option key={prof} value={prof}>
                    {prof}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Localisation</label>
              <input
                type="text"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                placeholder="Ville ou région"
                className="w-full rounded-lg border border-input dark:border-slate-600 bg-background dark:bg-slate-700 py-3 px-4 text-foreground dark:text-white transition-all focus:border-orange-500 dark:focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 dark:focus:ring-orange-400/20 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            <span className="ml-3 text-muted-foreground">Chargement des demandes...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-8">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && requests.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">Aucune demande trouvée</h3>
            <p className="text-muted-foreground">Essayez de modifier vos filtres pour voir plus de demandes.</p>
          </div>
        )}

        {/* Requests Grid */}
        {!loading && !error && requests.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map((request) => (
              <div key={request._id} className="bg-card rounded-lg border border-border p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground text-lg mb-1">{request.profession}</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                      <MapPin size={14} />
                      {request.location}
                    </div>
                    {request.preferredDate && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar size={14} />
                        {new Date(request.preferredDate).toLocaleDateString('fr-FR')}
                      </div>
                    )}
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(request.urgency)}`}>
                    {getUrgencyIcon(request.urgency)}
                    {getUrgencyText(request.urgency)}
                  </div>
                </div>

                <p className="text-foreground/80 text-sm mb-4 line-clamp-3">{request.description}</p>

                {request.photos && request.photos.length > 0 && (
                  <div className="mb-4">
                    <div className="grid grid-cols-2 gap-2">
                      {request.photos.slice(0, 2).map((photo, index) => (
                        <img
                          key={index}
                          src={photo}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => setSelectedPhoto(photo)}
                        />
                      ))}
                    </div>
                    {request.photos.length > 2 && (
                      <p className="text-xs text-muted-foreground mt-1">+{request.photos.length - 2} autres photos</p>
                    )}
                  </div>
                )}

                <div className="border-t border-border pt-4">
                  <h4 className="font-medium text-foreground mb-2">Client</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="font-medium">{request.user.firstName} {request.user.lastName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail size={14} />
                      <a href={`mailto:${request.user.email}`} className="hover:text-orange-600 transition-colors">
                        {request.user.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone size={14} />
                      <a href={`tel:${request.user.phone}`} className="hover:text-orange-600 transition-colors">
                        {request.user.phone}
                      </a>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                  <button
                    onClick={() => openContactModal(request)}
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 hover:shadow-md"
                  >
                    Contacter le client
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Photo Modal */}
        {selectedPhoto && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="relative max-w-4xl max-h-full">
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-all"
              >
                <X size={24} />
              </button>
              <img
                src={selectedPhoto}
                alt="Photo agrandie"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>
          </div>
        )}

        {/* Contact Modal */}
        {contactModalOpen && selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-lg border border-border p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Contacter le client</h3>
                <button
                  onClick={() => setContactModalOpen(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 dark:text-orange-400 font-semibold text-lg">
                      {selectedRequest.user.firstName.charAt(0)}{selectedRequest.user.lastName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{selectedRequest.user.firstName} {selectedRequest.user.lastName}</h4>
                    <p className="text-sm text-muted-foreground">{selectedRequest.profession}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleWhatsAppContact}
                    className="w-full flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 hover:shadow-md"
                  >
                    <MessageCircle size={20} />
                    Contacter via WhatsApp
                  </button>

                  <button
                    onClick={handlePhoneCall}
                    className="w-full flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 hover:shadow-md"
                  >
                    <Phone size={20} />
                    Appeler directement
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
