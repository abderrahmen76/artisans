"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Mail, Lock, ArrowRight } from "lucide-react"
import { useToasts } from "@/app/hooks/useToasts"
import { useAuth } from "@/app/contexts/AuthContext"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()
  const { login } = useAuth()
  const { push, ToastsUI } = useToasts()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const success = await login(email, password)

    if (success) {
      push("Connexion réussie", "success")
      router.push("/")
    } else {
      push("Erreur lors de la connexion", "error")
    }

    setIsLoading(false)
  }

  return (
    <>
      <ToastsUI />
      <main className="min-h-screen bg-background dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-border dark:border-slate-700 bg-card dark:bg-slate-800 p-8 shadow-lg">
            <div className="mb-8 text-center">
              <h1 className="mb-2 text-3xl font-bold text-foreground dark:text-white">Connexion</h1>
              <p className="text-foreground/60 dark:text-slate-400">Connectez-vous à votre compte</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground dark:text-slate-200 mb-2">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground dark:text-slate-400" />
                  <input
                    type="email"
                    placeholder="vous@exemple.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-lg border border-input dark:border-slate-600 bg-background dark:bg-slate-700 py-2.5 pl-11 pr-4 text-foreground dark:text-white placeholder-muted-foreground dark:placeholder-slate-400 transition-all focus:border-orange-500 dark:focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground dark:text-slate-200 mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground dark:text-slate-400" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-lg border border-input dark:border-slate-600 bg-background dark:bg-slate-700 py-2.5 pl-11 pr-4 text-foreground dark:text-white placeholder-muted-foreground dark:placeholder-slate-400 transition-all focus:border-orange-500 dark:focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full group inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-orange-600 to-amber-600 dark:from-orange-500 dark:to-amber-500 py-2.5 font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:opacity-90 active:scale-95 disabled:opacity-50"
              >
                {isLoading ? "Connexion..." : "Se connecter"}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            <div className="mt-6 border-t border-border dark:border-slate-700 pt-6">
              <p className="text-center text-sm text-foreground/60 dark:text-slate-400">
                Pas encore inscrit ?{" "}
                <Link href="/register" className="font-medium text-orange-600 dark:text-orange-400 hover:underline">
                  S'inscrire
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
/* If you duplicated useToasts in this file instead of importing, add the same useToasts implementation here. */