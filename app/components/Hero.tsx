"use client"

import { Search, MapPin, Briefcase, ArrowRight, Sparkles, Locate, FileText } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function Hero() {
  const [search, setSearch] = useState("")
  const [location, setLocation] = useState("")
  const [profession, setProfession] = useState("")
  const [isDetectingLocation, setIsDetectingLocation] = useState(false)
  const router = useRouter()

  const professions = ["Plombier", "Électricien", "Menuisier", "Maçon", "Chauffagiste", "Peintre", "Serrurier", "Couvreur"]

  const detectLocation = async () => {
    if (!navigator.geolocation) {
      alert("La géolocalisation n'est pas supportée par votre navigateur")
      return
    }

    setIsDetectingLocation(true)

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        })
      })

      const { latitude, longitude } = position.coords

      // Use OpenCage Geocoding API (free tier available)
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${process.env.NEXT_PUBLIC_OPENCAGE_API_KEY || 'demo'}&language=fr&limit=1`
      )

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération de la ville')
      }

      const data = await response.json()

      if (data.results && data.results.length > 0) {
        const components = data.results[0].components
        const city = components.city || components.town || components.village || components.hamlet

        if (city) {
          setLocation(city)
        } else {
          alert("Ville non trouvée pour votre position actuelle")
        }
      } else {
        alert("Impossible de déterminer votre ville")
      }
    } catch (error) {
      console.error("Erreur de géolocalisation:", error)

      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            alert("Permission de géolocalisation refusée. Veuillez autoriser l'accès à votre position.")
            break
          case error.POSITION_UNAVAILABLE:
            alert("Position indisponible. Veuillez vérifier vos paramètres de localisation.")
            break
          case error.TIMEOUT:
            alert("Délai d'attente dépassé. Veuillez réessayer.")
            break
          default:
            alert("Erreur de géolocalisation inconnue.")
        }
      } else {
        alert("Erreur lors de la détection de votre position.")
      }
    } finally {
      setIsDetectingLocation(false)
    }
  }

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (search.trim()) params.set('q', search.trim())
    if (location.trim()) params.set('location', location.trim())
    if (profession) params.set('profession', profession)

    router.push(`/search?${params.toString()}`)
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-orange-50 via-amber-50 to-background dark:from-slate-950 dark:via-slate-900 dark:to-background py-20 sm:py-32">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-500/10 dark:bg-orange-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 dark:border-orange-900/50 bg-orange-50 dark:bg-orange-950/20 px-4 py-2 mb-6">
            <Sparkles size={16} className="text-orange-600 dark:text-orange-400" />
            <span className="text-sm font-medium text-orange-900 dark:text-orange-200">Bienvenue sur Platform Artisans</span>
          </div>

          <h1 className="mb-6 text-5xl font-bold tracking-tight text-foreground dark:text-white sm:text-6xl md:text-7xl">
            <span className="text-pretty">Trouvez l&apos;artisan</span>
            <br />
            <span className="bg-gradient-to-r from-orange-600 to-amber-600 dark:from-orange-400 dark:to-amber-400 bg-clip-text text-transparent">parfait en quelques clics</span>
          </h1>

          <p className="mx-auto mb-8 max-w-2xl text-lg text-foreground/70 dark:text-slate-300 leading-relaxed">
            Publiez votre demande → Les artisans qualifiés vous contactent → Choisissez le meilleur devis
          </p>
        </div>

        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl bg-card dark:bg-slate-800 p-6 shadow-2xl border border-border dark:border-slate-700 sm:p-8">
            <div className="space-y-4">
              <div className="flex flex-col gap-4 sm:gap-3">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground dark:text-slate-400" />
                  <input
                    type="text"
                    placeholder="Décrivez votre projet (ex: Réparer une fuite d'eau)"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-lg border border-input dark:border-slate-600 bg-background dark:bg-slate-700 py-3.5 pl-11 pr-4 text-foreground dark:text-white placeholder-muted-foreground dark:placeholder-slate-400 transition-all focus:border-orange-500 dark:focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 dark:focus:ring-orange-400/20 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground dark:text-slate-400" />
                    <input
                      type="text"
                      placeholder="Votre localisation"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full rounded-lg border border-input dark:border-slate-600 bg-background dark:bg-slate-700 py-3.5 pl-11 pr-12 text-foreground dark:text-white placeholder-muted-foreground dark:placeholder-slate-400 transition-all focus:border-orange-500 dark:focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 dark:focus:ring-orange-400/20 focus:outline-none"
                    />
                    <button
                      onClick={detectLocation}
                      disabled={isDetectingLocation}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md hover:bg-secondary dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Détecter ma position"
                    >
                      <Locate size={16} className={`text-muted-foreground dark:text-slate-400 ${isDetectingLocation ? 'animate-spin' : ''}`} />
                    </button>
                  </div>

                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground dark:text-slate-400" />
                    <select
                      value={profession}
                      onChange={(e) => setProfession(e.target.value)}
                      className="w-full rounded-lg border border-input dark:border-slate-600 bg-background dark:bg-slate-700 py-3.5 pl-11 pr-4 text-foreground dark:text-white transition-all focus:border-orange-500 dark:focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 dark:focus:ring-orange-400/20 focus:outline-none cursor-pointer"
                    >
                      <option value="">Sélectionnez un métier</option>
                      {professions.map((prof) => (
                        <option key={prof} value={prof}>
                          {prof}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleSearch}
                    className="flex-1 sm:flex-none group inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-orange-600 to-amber-600 dark:from-orange-500 dark:to-amber-500 py-3.5 px-8 font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:opacity-90 active:scale-95"
                  >
                    Rechercher
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                  <Link
                    href="/publish-request"
                    className="flex-1 sm:flex-none group inline-flex items-center justify-center gap-2 rounded-lg border-2 border-orange-600 dark:border-orange-400 bg-transparent py-3.5 px-8 font-semibold text-orange-600 dark:text-orange-400 shadow-lg transition-all hover:bg-orange-600 hover:text-white dark:hover:bg-orange-400 dark:hover:text-white active:scale-95"
                  >
                    Publier une demande
                    <FileText size={18} className="group-hover:scale-110 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 dark:text-orange-400 sm:text-5xl mb-2">1,200+</div>
              <div className="text-sm text-foreground/70 dark:text-slate-400">Artisans qualifiés</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 dark:text-orange-400 sm:text-5xl mb-2">850+</div>
              <div className="text-sm text-foreground/70 dark:text-slate-400">Demandes complétées</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 dark:text-orange-400 sm:text-5xl mb-2">4.8★</div>
              <div className="text-sm text-foreground/70 dark:text-slate-400">Note moyenne</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
