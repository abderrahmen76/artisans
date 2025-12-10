/* eslint-disable react/no-unescaped-entities */
"use client"

import Link from "next/link"
import { useState } from "react"
import { useToasts } from "@/app/hooks/useToasts"
import { MapPin, Navigation, Upload, Calendar, Clock, ArrowLeft } from "lucide-react"

export default function PublishRequestPage() {
  const { push: toasts, ToastsUI } = useToasts()
  const [formData, setFormData] = useState({
    profession: "",
    description: "",
    urgency: "normal", // normal, urgent, very_urgent
    preferredDate: "",
    location: "",
  })
  const [photo, setPhoto] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [locationMode, setLocationMode] = useState<"auto" | "manual">("auto")
  const [isDetectingLocation, setIsDetectingLocation] = useState(false)

  const professions = ["Plombier", "Électricien", "Menuisier", "Maçon", "Chauffagiste", "Peintre", "Serrurier", "Couvreur"]
  const urgencyLevels = [
    { value: "normal", label: "Normal (1-2 semaines)", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300" },
    { value: "urgent", label: "Urgent (2-3 jours)", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300" },
    { value: "very_urgent", label: "Très urgent (aujourd'hui)", color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300" }
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement
    setFormData((prev) => ({ ...prev, [target.name]: target.value }))
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setPhoto(e.target.files[0])
    }
  }

  const detectLocation = async () => {
    if (!navigator.geolocation) {
      setError("La géolocalisation n'est pas supportée par votre navigateur")
      return
    }

    setIsDetectingLocation(true)
    setError("")

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          (error) => {
            console.log('Geolocation error callback:', error)
            reject(new Error(`Geolocation error ${error.code}: ${error.message || 'Unknown error'}`))
          },
          {
            enableHighAccuracy: false,
            timeout: 15000,
            maximumAge: 300000
          }
        )
      })

      const { latitude, longitude } = position.coords

      // Reverse geocoding using OpenStreetMap Nominatim API
      let response
      try {
        response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=fr`
        )
      } catch (fetchError) {
        console.error('Fetch error:', fetchError)
        throw new Error('Erreur réseau lors de la récupération de l&apos;adresse')
      }

      // eslint-disable-next-line react/no-unescaped-entities
      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`)
      }

      let data
      try {
        data = await response.json()
      } catch (jsonError) {
        console.error('JSON parsing error:', jsonError)
        throw new Error('Erreur lors de l&apos;analyse de la réponse')
      }

      if (data && data.display_name) {
        // Extract city and country from structured address
        const address = data.address || {}
        const city = address.city || address.town || address.village || address.municipality || address.state_district || address.county
        const country = address.country

        let location = ""

        if (city && country) {
          // Include more context if available
          const region = address.state || address.region
          if (region && region !== city) {
            location = `${city}, ${region}, ${country}`
          } else {
            location = `${city}, ${country}`
          }
        } else {
          // Fallback to display_name with better parsing
          const parts = data.display_name.split(', ')
          // Try to find city-like information in the display name
          let detectedCity = ""
          let detectedCountry = ""

          // Look for common city indicators in the parts
          for (let i = 0; i < Math.min(parts.length, 4); i++) {
            const part = parts[i].trim()
            // Skip postal codes, road names, and university names
            if (!/^\d+$/.test(part) && !part.includes('Route') && !part.includes('University') && !part.includes('Private') && part.length > 2) {
              if (!detectedCity) {
                detectedCity = part
              } else if (!detectedCountry && COUNTRIES.some(c => c.name === part || c.code === part)) {
                detectedCountry = part
                break
              }
            }
          }

          if (detectedCity && detectedCountry) {
            location = `${detectedCity}, ${detectedCountry}`
          } else if (detectedCity) {
            location = detectedCity
          } else {
            // Last resort: take first meaningful part
            location = parts.find((part: string) => part.length > 2 && !part.includes('Route') && !part.includes('University')) || parts[0]
          }
        }

        setFormData(prev => ({ ...prev, location }))
        toasts("Localisation détectée avec succès", "success")
      } else {
        throw new Error('Adresse non trouvée')
      }
    } catch (err) {
      console.error('Erreur de géolocalisation:', err, 'Type:', typeof err, 'Instance of GeolocationPositionError:', err instanceof GeolocationPositionError)
      if (err instanceof GeolocationPositionError) {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError("Permission de géolocalisation refusée. Veuillez autoriser l'accès à votre position.")
            break
          case err.POSITION_UNAVAILABLE:
            setError("Position indisponible. Veuillez vérifier vos paramètres de localisation.")
            break
          case err.TIMEOUT:
            setError("Délai d'attente dépassé. Veuillez réessayer.")
            break
          default:
            setError("Erreur lors de la détection de la localisation")
        }
      } else if (err instanceof Error && err.message.startsWith('Geolocation error')) {
        const code = parseInt(err.message.match(/Geolocation error (\d+)/)?.[1] || '0')
        switch (code) {
          case 1:
            setError("Permission de géolocalisation refusée. Veuillez autoriser l'accès à votre position.")
            break
          case 2:
            setError("Position indisponible. Veuillez vérifier vos paramètres de localisation.")
            break
          case 3:
            setError("Délai d'attente dépassé. Veuillez réessayer.")
            break
          default:
            setError("Erreur lors de la détection de la localisation")
        }
      } else {
        setError("Erreur lors de la détection de la localisation")
      }
    } finally {
      setIsDetectingLocation(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Get current user from localStorage
      const userData = localStorage.getItem("user")
      if (!userData) {
        setError("Vous devez être connecté pour publier une demande")
        return
      }

      const user = JSON.parse(userData)

      let photoUrl = null

      // Upload photo to Cloudinary if selected
      if (photo) {
        const formDataUpload = new FormData()
        formDataUpload.append('file', photo)

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formDataUpload,
        })

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload photo')
        }

        const uploadData = await uploadResponse.json()
        photoUrl = uploadData.secure_url
      }

      const payload = {
        userId: user._id,
        profession: formData.profession,
        description: formData.description,
        urgency: formData.urgency,
        preferredDate: formData.preferredDate,
        location: formData.location,
        photo: photoUrl,
      }

      const response = await fetch("/api/requests/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Publication failed")
        return
      }

      toasts("Demande publiée avec succès", "success")
      setFormData({
        profession: "",
        description: "",
        urgency: "normal",
        preferredDate: "",
        location: "",
      })
      setPhoto(null)
    } catch (err) {
      setError("An error occurred")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-orange-600 dark:text-orange-400 hover:underline text-sm font-medium mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </Link>

          <div className="text-center">
            <h1 className="mb-2 text-3xl font-bold text-foreground dark:text-white">Publier une demande</h1>
            <p className="text-foreground/60 dark:text-slate-400">Décrivez votre projet et trouvez l&apos;artisan idéal</p>
          </div>
        </div>

        {error && <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-2xl border border-border dark:border-slate-700 bg-card dark:bg-slate-800 p-8 shadow-lg">
            {/* Profession */}
            <div>
              <label className="block text-sm font-medium text-foreground dark:text-slate-200 mb-2">
                Métier recherché *
              </label>
              <select
                name="profession"
                value={formData.profession}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-input dark:border-slate-600 bg-background dark:bg-slate-700 py-2.5 px-4 text-foreground dark:text-white transition-all focus:border-orange-500 dark:focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 focus:outline-none cursor-pointer"
              >
                <option value="">Sélectionnez un métier</option>
                {professions.map((prof) => (
                  <option key={prof} value={prof}>
                    {prof}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-foreground dark:text-slate-200 mb-2">
                Description du projet *
              </label>
              <textarea
                name="description"
                placeholder="Décrivez en détail votre projet, vos besoins spécifiques, vos contraintes..."
                value={formData.description}
                onChange={handleChange}
                rows={6}
                required
                className="w-full rounded-lg border border-input dark:border-slate-600 bg-background dark:bg-slate-700 py-2.5 px-4 text-foreground dark:text-white placeholder-muted-foreground dark:placeholder-slate-400 transition-all focus:border-orange-500 dark:focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
              />
            </div>

            {/* Urgency */}
            <div>
              <label className="block text-sm font-medium text-foreground dark:text-slate-200 mb-3">
                Niveau d'urgence *
              </label>
              <div className="grid grid-cols-1 gap-2">
                {urgencyLevels.map((level) => (
                  <label key={level.value} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="urgency"
                      value={level.value}
                      checked={formData.urgency === level.value}
                      onChange={handleChange}
                      className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 focus:ring-orange-500 dark:focus:ring-orange-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${level.color}`}>
                      {level.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Preferred Date */}
            <div>
              <label className="block text-sm font-medium text-foreground dark:text-slate-200 mb-2">
                Date souhaitée (optionnel)
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  name="preferredDate"
                  value={formData.preferredDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full rounded-lg border border-input dark:border-slate-600 bg-background dark:bg-slate-700 py-2.5 pl-11 pr-4 text-foreground dark:text-white transition-all focus:border-orange-500 dark:focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-foreground dark:text-slate-200 mb-2">
                Localisation *
              </label>

              {/* Location Mode Toggle */}
              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setLocationMode("auto")}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    locationMode === "auto"
                      ? "bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border border-orange-300 dark:border-orange-700"
                      : "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400 border border-gray-300 dark:border-slate-600"
                  }`}
                >
                  <Navigation className="w-4 h-4" />
                  Détection auto
                </button>
                <button
                  type="button"
                  onClick={() => setLocationMode("manual")}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    locationMode === "manual"
                      ? "bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border border-orange-300 dark:border-orange-700"
                      : "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400 border border-gray-300 dark:border-slate-600"
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                  Recherche manuelle
                </button>
              </div>

              {/* Location Input */}
              {locationMode === "auto" ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="location"
                      placeholder="Cliquez sur 'Détecter ma position'"
                      value={formData.location}
                      readOnly
                      required
                      className="flex-1 rounded-lg border border-input dark:border-slate-600 bg-background dark:bg-slate-700 py-2.5 px-4 text-foreground dark:text-white placeholder-muted-foreground dark:placeholder-slate-400 transition-all focus:border-orange-500 dark:focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={detectLocation}
                      disabled={isDetectingLocation}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Navigation className="w-4 h-4" />
                      {isDetectingLocation ? "Détection..." : "Détecter"}
                    </button>
                  </div>
                  {formData.location && (
                    <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                      <MapPin className="w-4 h-4" />
                      Localisation détectée: {formData.location}
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="location"
                    placeholder="Entrez votre ville, région (ex: Paris, France)"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-input dark:border-slate-600 bg-background dark:bg-slate-700 py-2.5 pl-10 pr-4 text-foreground dark:text-white placeholder-muted-foreground dark:placeholder-slate-400 transition-all focus:border-orange-500 dark:focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-foreground dark:text-slate-200 mb-2">
                Photo du projet (optionnel)
              </label>
              <div className="space-y-2">
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-orange-500 dark:hover:border-orange-400 transition-colors">
                    <div className="text-center">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Cliquez pour ajouter une photo
                      </p>
                    </div>
                  </div>
                </div>
                {photo && (
                  <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                    <Upload className="w-4 h-4" />
                    Photo sélectionnée: {photo.name}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-gradient-to-r from-orange-600 to-amber-600 dark:from-orange-500 dark:to-amber-500 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:opacity-90 active:scale-95 disabled:opacity-50"
          >
            {isLoading ? "Publication en cours..." : "Publier ma demande"}
          </button>
        </form>

        <div className="mt-8 rounded-lg border border-orange-200 dark:border-orange-900/50 bg-orange-50 dark:bg-orange-950/20 p-4">
          <h4 className="font-semibold text-orange-900 dark:text-orange-200 mb-2">ℹ️ Comment ça marche ?</h4>
          <ul className="text-sm text-orange-800 dark:text-orange-300 space-y-1">
            <li>• Votre demande sera visible par tous les artisans abonnés</li>
            <li>• Les artisans intéressés vous contacteront directement</li>
            <li>• Comparez les devis et choisissez le meilleur</li>
            <li>• Service gratuit pour les clients</li>
          </ul>
        </div>

        <ToastsUI />
      </div>
    </main>
  )
}

const COUNTRIES: { code: string; name: string; dial: string }[] = [
  { code: "TN", name: "Tunisia", dial: "+216" },
  { code: "FR", name: "France", dial: "+33" },
  { code: "US", name: "United States", dial: "+1" },
  { code: "GB", name: "United Kingdom", dial: "+44" },
  { code: "DE", name: "Germany", dial: "+49" },
  { code: "IT", name: "Italy", dial: "+39" },
  { code: "ES", name: "Spain", dial: "+34" },
  { code: "MA", name: "Morocco", dial: "+212" },
  { code: "DZ", name: "Algeria", dial: "+213" },
  { code: "BE", name: "Belgium", dial: "+32" },
  { code: "CH", name: "Switzerland", dial: "+41" },
  { code: "CA", name: "Canada", dial: "+1" },
  { code: "AU", name: "Australia", dial: "+61" },
  { code: "NL", name: "Netherlands", dial: "+31" },
  { code: "SE", name: "Sweden", dial: "+46" },
  { code: "NO", name: "Norway", dial: "+47" },
  { code: "BR", name: "Brazil", dial: "+55" },
  { code: "MX", name: "Mexico", dial: "+52" },
  { code: "IN", name: "India", dial: "+91" },
  { code: "CN", name: "China", dial: "+86" },
]
