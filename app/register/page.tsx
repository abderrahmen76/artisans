"use client"

import Link from "next/link"
import { useState } from "react"
import { useToasts } from "@/app/hooks/useToasts"
import { MapPin, Navigation, Search } from "lucide-react"

export default function RegisterPage() {
  const [userType, setUserType] = useState<"client" | "artisan" | null>(null)

  return (
    <main className="min-h-screen bg-background dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        {!userType ? (
          <div className="rounded-2xl border border-border dark:border-slate-700 bg-card dark:bg-slate-800 p-8 shadow-lg">
            <div className="mb-8 text-center">
              <h1 className="mb-2 text-3xl font-bold text-foreground dark:text-white">Créer un compte</h1>
              <p className="text-foreground/60 dark:text-slate-400">Choisissez votre type de compte</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => setUserType("client")}
                className="rounded-xl border-2 border-border dark:border-slate-700 bg-card dark:bg-slate-800 p-6 text-center transition-all hover:border-orange-500 dark:hover:border-orange-400 hover:shadow-lg"
              >
                <div className="mb-3 text-4xl">👤</div>
                <h3 className="mb-2 text-xl font-semibold text-foreground dark:text-white">Je suis client</h3>
                <p className="text-sm text-foreground/60 dark:text-slate-400">Je cherche un artisan pour mon projet</p>
              </button>

              <button
                onClick={() => setUserType("artisan")}
                className="rounded-xl border-2 border-border dark:border-slate-700 bg-card dark:bg-slate-800 p-6 text-center transition-all hover:border-orange-500 dark:hover:border-orange-400 hover:shadow-lg"
              >
                <div className="mb-3 text-4xl">🔨</div>
                <h3 className="mb-2 text-xl font-semibold text-foreground dark:text-white">Je suis artisan</h3>
                <p className="text-sm text-foreground/60 dark:text-slate-400">Je propose mes services professionnels</p>
              </button>
            </div>
          </div>
        ) : userType === "client" ? (
          <RegisterClientForm onBack={() => setUserType(null)} />
        ) : (
          <RegisterArtisanForm onBack={() => setUserType(null)} />
        )}
      </div>
    </main>
  )
}

const COUNTRIES: { code: string; name: string; dial: string }[] = [
  { code: "TN", name: "Tunisia", dial: "+216" }, // default
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
  // add more countries as needed...
]

function RegisterClientForm({ onBack }: { onBack: () => void }) {
  const { push: toasts, ToastsUI } = useToasts()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneCountry: "+216", // default Tunisia
    phoneNumber: "",
    email: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // combine dial code + number for backend
      const phone = `${formData.phoneCountry}${formData.phoneNumber.replace(/\D/g, "")}`

      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone,
        email: formData.email,
        password: formData.password,
        userType: "client",
      }

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Registration failed")
        return
      }

      toasts("Inscription réussie", "success")
      setFormData({ firstName: "", lastName: "", phoneCountry: "+216", phoneNumber: "", email: "", password: "" })
    } catch (err) {
      setError("An error occurred")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-border dark:border-slate-700 bg-card dark:bg-slate-800 p-8 shadow-lg">
      <button
        onClick={onBack}
        className="mb-6 text-orange-600 dark:text-orange-400 hover:underline text-sm font-medium"
      >
        ← Retour
      </button>

      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold text-foreground dark:text-white">Inscription Client</h1>
        <p className="text-foreground/60 dark:text-slate-400">Complétez votre profil</p>
      </div>

      {error && <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground dark:text-slate-200 mb-2">
              Prénom
            </label>
            <input
              type="text"
              name="firstName"
              placeholder="Jean"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-input dark:border-slate-600 bg-background dark:bg-slate-700 py-2.5 px-4 text-foreground dark:text-white placeholder-muted-foreground dark:placeholder-slate-400 transition-all focus:border-orange-500 dark:focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground dark:text-slate-200 mb-2">
              Nom
            </label>
            <input
              type="text"
              name="lastName"
              placeholder="Dupont"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-input dark:border-slate-600 bg-background dark:bg-slate-700 py-2.5 px-4 text-foreground dark:text-white placeholder-muted-foreground dark:placeholder-slate-400 transition-all focus:border-orange-500 dark:focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground dark:text-slate-200 mb-2">
            Téléphone
          </label>

          <div className="flex gap-2">
            <select
              name="phoneCountry"
              value={formData.phoneCountry}
              onChange={handleChange}
              className="rounded-lg border border-input dark:border-slate-600 bg-background dark:bg-slate-700 py-2.5 px-3 text-foreground dark:text-white transition-all focus:border-orange-500 dark:focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.dial}>
                  {c.name} ({c.dial})
                </option>
              ))}
            </select>

            <input
              type="tel"
              name="phoneNumber"
              placeholder="612345678"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
              className="flex-1 rounded-lg border border-input dark:border-slate-600 bg-background dark:bg-slate-700 py-2.5 px-4 text-foreground dark:text-white placeholder-muted-foreground dark:placeholder-slate-400 transition-all focus:border-orange-500 dark:focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground dark:text-slate-200 mb-2">
            E-mail
          </label>
          <input
            type="email"
            name="email"
            placeholder="jean@exemple.com"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-input dark:border-slate-600 bg-background dark:bg-slate-700 py-2.5 px-4 text-foreground dark:text-white placeholder-muted-foreground dark:placeholder-slate-400 transition-all focus:border-orange-500 dark:focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground dark:text-slate-200 mb-2">
            Mot de passe
          </label>
          <input
            type="password"
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-input dark:border-slate-600 bg-background dark:bg-slate-700 py-2.5 px-4 text-foreground dark:text-white placeholder-muted-foreground dark:placeholder-slate-400 transition-all focus:border-orange-500 dark:focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-gradient-to-r from-orange-600 to-amber-600 dark:from-orange-500 dark:to-amber-500 py-2.5 font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:opacity-90 active:scale-95 disabled:opacity-50"
        >
          {isLoading ? "Création en cours..." : "S'inscrire"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-foreground/60 dark:text-slate-400">
        Déjà inscrit ?{" "}
        <Link href="/login" className="font-medium text-orange-600 dark:text-orange-400 hover:underline">
          Se connecter
        </Link>
      </p>
      <ToastsUI />
    </div>
  )
}

function RegisterArtisanForm({ onBack }: { onBack: () => void }) {
  const { push: toasts, ToastsUI } = useToasts()
  const [formData, setFormData] = useState({
    name: "",
    profession: "",
    location: "",
    phoneCountry: "+216", // default Tunisia
    phoneNumber: "",
    description: "",
    email: "",
    password: "",
  })
  const [photo, setPhoto] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [locationMode, setLocationMode] = useState<"auto" | "manual">("auto")
  const [isDetectingLocation, setIsDetectingLocation] = useState(false)

  const professions = ["Plombier", "Électricien", "Menuisier", "Maçon", "Chauffagiste", "Peintre", "Serrurier", "Couvreur"]

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
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        })
      })

      const { latitude, longitude } = position.coords

      // Reverse geocoding using OpenStreetMap Nominatim API
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=fr`
      )

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération de l\'adresse')
      }

      const data = await response.json()

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
              } else if (!detectedCountry && (part.length === 2 || COUNTRIES.some(c => c.name === part || c.code === part))) {
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
      console.error('Erreur de géolocalisation:', err)
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
      } else {
        setError("Erreur lors de la détection de la localisation")
      }
    } finally {
      setIsDetectingLocation(false)
    }
  }

  const toggleLocationMode = () => {
    setLocationMode(prev => prev === "auto" ? "manual" : "auto")
    if (locationMode === "auto") {
      setFormData(prev => ({ ...prev, location: "" }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const phone = `${formData.phoneCountry}${formData.phoneNumber.replace(/\D/g, "")}`

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
        name: formData.name,
        profession: formData.profession,
        location: formData.location,
        phone,
        description: formData.description,
        email: formData.email,
        password: formData.password,
        photo: photoUrl,
        userType: "artisan",
      }

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Registration failed")
        return
      }

      toasts("Inscription réussie", "success")
      setFormData({ name: "", profession: "", location: "", phoneCountry: "+216", phoneNumber: "", description: "", email: "", password: "" })
      setPhoto(null)
    } catch (err) {
      setError("An error occurred")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-border dark:border-slate-700 bg-card dark:bg-slate-800 p-8 shadow-lg">
      <button
        onClick={onBack}
        className="mb-6 text-orange-600 dark:text-orange-400 hover:underline text-sm font-medium"
      >
        ← Retour
      </button>

      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold text-foreground dark:text-white">Inscription Artisan</h1>
        <p className="text-foreground/60 dark:text-slate-400">Complétez votre profil professionnel</p>
      </div>

      {error && <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground dark:text-slate-200 mb-2">
            Nom complet
          </label>
          <input
            type="text"
            name="name"
            placeholder="Jean Dupont"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-input dark:border-slate-600 bg-background dark:bg-slate-700 py-2.5 px-4 text-foreground dark:text-white placeholder-muted-foreground dark:placeholder-slate-400 transition-all focus:border-orange-500 dark:focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground dark:text-slate-200 mb-2">
              Métier
            </label>
            <select
              name="profession"
              value={formData.profession}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-input dark:border-slate-600 bg-background dark:bg-slate-700 py-2.5 px-4 text-foreground dark:text-white transition-all focus:border-orange-500 dark:focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 focus:outline-none cursor-pointer"
            >
              <option value="">Sélectionnez votre métier</option>
              {professions.map((prof) => (
                <option key={prof} value={prof}>
                  {prof}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground dark:text-slate-200 mb-2">
              Localisation
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
                <Search className="w-4 h-4" />
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
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
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
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground dark:text-slate-200 mb-2">
            Téléphone
          </label>

          <div className="flex gap-2">
            <select
              name="phoneCountry"
              value={formData.phoneCountry}
              onChange={handleChange}
              className="rounded-lg border border-input dark:border-slate-600 bg-background dark:bg-slate-700 py-2.5 px-3 text-foreground dark:text-white transition-all focus:border-orange-500 dark:focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.dial}>
                  {c.name} ({c.dial})
                </option>
              ))}
            </select>

            <input
              type="tel"
              name="phoneNumber"
              placeholder="612345678"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
              className="flex-1 rounded-lg border border-input dark:border-slate-600 bg-background dark:bg-slate-700 py-2.5 px-4 text-foreground dark:text-white placeholder-muted-foreground dark:placeholder-slate-400 transition-all focus:border-orange-500 dark:focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground dark:text-slate-200 mb-2">
            E-mail
          </label>
          <input
            type="email"
            name="email"
            placeholder="jean@exemple.com"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-input dark:border-slate-600 bg-background dark:bg-slate-700 py-2.5 px-4 text-foreground dark:text-white placeholder-muted-foreground dark:placeholder-slate-400 transition-all focus:border-orange-500 dark:focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground dark:text-slate-200 mb-2">
            Mot de passe
          </label>
          <input
            type="password"
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-input dark:border-slate-600 bg-background dark:bg-slate-700 py-2.5 px-4 text-foreground dark:text-white placeholder-muted-foreground dark:placeholder-slate-400 transition-all focus:border-orange-500 dark:focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground dark:text-slate-200 mb-2">
            Photo de profil
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="w-full rounded-lg border border-input dark:border-slate-600 bg-background dark:bg-slate-700 py-2.5 px-4 text-foreground dark:text-white transition-all focus:border-orange-500 dark:focus:border-orange-400 focus:outline-none"
          />
          {photo && <p className="mt-2 text-sm text-orange-600 dark:text-orange-400">✓ {photo.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground dark:text-slate-200 mb-2">
            Description de vos compétences
          </label>
          <textarea
            name="description"
            placeholder="Décrivez votre expérience, vos spécialités, vos tarifs..."
            value={formData.description}
            onChange={handleChange}
            rows={4}
            required
            className="w-full rounded-lg border border-input dark:border-slate-600 bg-background dark:bg-slate-700 py-2.5 px-4 text-foreground dark:text-white placeholder-muted-foreground dark:placeholder-slate-400 transition-all focus:border-orange-500 dark:focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
          />
        </div>

        <div className="rounded-lg border border-orange-200 dark:border-orange-900/50 bg-orange-50 dark:bg-orange-950/20 p-4">
          <h4 className="font-semibold text-orange-900 dark:text-orange-200 mb-2">🚀 Accès Premium</h4>
          <p className="text-sm text-orange-800 dark:text-orange-300 mb-4">
            Débloquez des formations et outils exclusifs pour développer votre activité
          </p>
          <button
            type="button"
            className="w-full rounded-lg bg-gradient-to-r from-orange-600 to-amber-600 dark:from-orange-500 dark:to-amber-500 py-2 text-sm font-semibold text-white transition-all hover:opacity-90"
          >
            Découvrir l&apos;abonnement Premium
          </button>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-gradient-to-r from-orange-600 to-amber-600 dark:from-orange-500 dark:to-amber-500 py-2.5 font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:opacity-90 active:scale-95 disabled:opacity-50"
        >
          {isLoading ? "Création en cours..." : "S'inscrire"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-foreground/60 dark:text-slate-400">
        Déjà inscrit ?{" "}
        <Link href="/login" className="font-medium text-orange-600 dark:text-orange-400 hover:underline">
          Se connecter
        </Link>
      </p>
      <ToastsUI />
    </div>
  )
}


