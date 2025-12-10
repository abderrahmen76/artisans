"use client"

export const dynamic = 'force-dynamic'

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { MapPin, Phone, Briefcase, Star, ArrowLeft, Search, X, MessageCircle } from "lucide-react"
import { useToasts } from "@/app/hooks/useToasts"

interface Artisan {
  _id: string
  name: string
  profession: string
  location: string
  description: string
  photo?: string
  phone: string
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const { push: addToast } = useToasts()
  const [artisans, setArtisans] = useState<Artisan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [contactModalOpen, setContactModalOpen] = useState(false)
  const [selectedArtisan, setSelectedArtisan] = useState<Artisan | null>(null)

  const query = searchParams.get('q') || ''
  const location = searchParams.get('location') || ''
  const profession = searchParams.get('profession') || ''

  useEffect(() => {
    const fetchArtisans = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (query) params.set('q', query)
        if (location) params.set('location', location)
        if (profession) params.set('profession', profession)

        const response = await fetch(`/api/search?${params.toString()}`)
        if (!response.ok) {
          throw new Error('Erreur lors de la recherche')
        }

        const data = await response.json()
        setArtisans(data.artisans || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue')
      } finally {
        setLoading(false)
      }
    }

    fetchArtisans()
  }, [query, location, profession])

  const getSearchSummary = () => {
    const parts = []
    if (query) parts.push(`"${query}"`)
    if (profession) parts.push(profession)
    if (location) parts.push(`à ${location}`)
    return parts.join(' ')
  }

  const openContactModal = (artisan: Artisan) => {
    setSelectedArtisan(artisan)
    setContactModalOpen(true)
  }

  const handleWhatsAppContact = () => {
    if (!selectedArtisan) return
    const message = encodeURIComponent(`Bonjour ${selectedArtisan.name}, j'ai trouvé votre profil sur Platform Artisans et je suis intéressé par vos services de ${selectedArtisan.profession}.`)
    const whatsappUrl = `https://wa.me/${selectedArtisan.phone}?text=${message}`
    window.open(whatsappUrl, '_blank')
    setContactModalOpen(false)
    addToast("Ouverture de WhatsApp...", "success")
  }

  const handlePhoneCall = () => {
    if (!selectedArtisan) return
    window.open(`tel:${selectedArtisan.phone}`, '_self')
    setContactModalOpen(false)
    addToast("Appel téléphonique en cours...", "success")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 dark:border-orange-900/50 bg-orange-50 dark:bg-orange-950/20 px-4 py-2 mb-6">
              <Search size={16} className="text-orange-600 dark:text-orange-400 animate-pulse" />
              <span className="text-sm font-medium text-orange-900 dark:text-orange-200">Recherche en cours...</span>
            </div>
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-1/2 mx-auto"></div>
              <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/3 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 px-4 py-2 mb-6">
              <span className="text-sm font-medium text-red-900 dark:text-red-200">Erreur de recherche</span>
            </div>
            <p className="text-red-600 dark:text-red-400 mb-6">{error}</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 text-white px-6 py-3 font-medium transition-colors"
            >
              <ArrowLeft size={18} />
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-orange-600 dark:text-orange-400 hover:underline mb-4"
          >
            <ArrowLeft size={18} />
            Retour à l&apos;accueil
          </Link>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground dark:text-white mb-2">
              Résultats de recherche
            </h1>
            <p className="text-foreground/70 dark:text-slate-400">
              {artisans.length === 0
                ? `Aucun résultat pour ${getSearchSummary()}`
                : `${artisans.length} artisan${artisans.length > 1 ? 's' : ''} trouvé${artisans.length > 1 ? 's' : ''} pour ${getSearchSummary()}`
              }
            </p>
          </div>
        </div>

        {/* Results */}
        {artisans.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 px-4 py-2 mb-6">
              <Search size={16} className="text-gray-600 dark:text-slate-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-slate-200">Aucun résultat</span>
            </div>
            <p className="text-foreground/70 dark:text-slate-400 mb-6">
              Aucun artisan ne correspond à vos critères de recherche.
            </p>
            <p className="text-sm text-foreground/50 dark:text-slate-500">
              Essayez de modifier vos critères ou contactez-nous pour plus d&apos;aide.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {artisans.map((artisan) => (
              <div
                key={artisan._id}
                className="rounded-xl border border-border dark:border-slate-700 bg-card dark:bg-slate-800 p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start gap-4 mb-4">
                  {artisan.photo ? (
                    <img
                      src={artisan.photo}
                      alt={artisan.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                      <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        {artisan.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}

                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-foreground dark:text-white mb-1">
                      {artisan.name}
                    </h3>
                    <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400 mb-2">
                      <Briefcase size={16} />
                      <span className="font-medium">{artisan.profession}</span>
                    </div>
                    <div className="flex items-center gap-1 text-foreground/70 dark:text-slate-400 text-sm">
                      <MapPin size={14} />
                      <span>{artisan.location}</span>
                    </div>
                  </div>
                </div>

                <p className="text-foreground/80 dark:text-slate-300 text-sm mb-4 line-clamp-3">
                  {artisan.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star size={16} className="text-yellow-500 fill-current" />
                    <span className="text-sm font-medium text-foreground/70 dark:text-slate-400">
                      4.8
                    </span>
                  </div>

                  <button
                    onClick={() => openContactModal(artisan)}
                    className="inline-flex items-center gap-2 rounded-lg bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 text-white px-4 py-2 text-sm font-medium transition-colors"
                  >
                    <Phone size={16} />
                    Contacter
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Contact Modal */}
        {contactModalOpen && selectedArtisan && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-lg border border-border p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Contacter l&apos;artisan</h3>
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
                      {selectedArtisan.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{selectedArtisan.name}</h4>
                    <p className="text-sm text-muted-foreground">{selectedArtisan.profession}</p>
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
