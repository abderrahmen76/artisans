"use client"

import Link from "next/link"
import { Menu, X, User, LogOut } from "lucide-react"
import { useState } from "react"
import ThemeToggle from "./ThemeToggle"
import { useAuth } from "@/app/contexts/AuthContext"

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuth()

  const getDisplayName = () => {
    if (!user) return ""
    if (user.userType === "client" && user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`
    }
    if (user.userType === "artisan" && user.name) {
      return user.name
    }
    return user.email
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:bg-slate-950/95">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 dark:from-orange-600 dark:to-amber-700 text-white font-bold text-lg shadow-md group-hover:shadow-lg transition-shadow">
              PA
            </div>
            <span className="hidden font-bold text-lg text-foreground dark:text-slate-100 sm:inline group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
              Platform Artisans
            </span>
          </Link>

          <nav className="hidden gap-8 md:flex">
            <Link href="/" className="text-sm font-medium text-foreground dark:text-slate-300 transition-colors hover:text-orange-600 dark:hover:text-orange-400">
              Accueil
            </Link>
            {user?.userType === "artisan" && (
              <Link href="/requests" className="text-sm font-medium text-foreground dark:text-slate-300 transition-colors hover:text-orange-600 dark:hover:text-orange-400">
                Demandes
              </Link>
            )}
            <Link href="/#how-it-works" className="text-sm font-medium text-foreground dark:text-slate-300 transition-colors hover:text-orange-600 dark:hover:text-orange-400">
              Comment ça marche
            </Link>
            <Link href="/#contact" className="text-sm font-medium text-foreground dark:text-slate-300 transition-colors hover:text-orange-600 dark:hover:text-orange-400">
              Contact
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <ThemeToggle />

            {user ? (
              <div className="hidden gap-3 sm:flex items-center">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary dark:bg-slate-800 hover:bg-accent dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  <img
                    src={user.photo || "https://via.placeholder.com/32x32?text=?"}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="text-sm font-medium text-foreground dark:text-slate-200">
                    {getDisplayName()}
                  </span>
                </Link>
                <button
                  onClick={logout}
                  className="inline-flex h-10 items-center justify-center rounded-lg px-3 text-sm font-medium text-foreground dark:text-slate-300 transition-colors hover:bg-secondary dark:hover:bg-slate-800"
                  title="Déconnexion"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div className="hidden gap-3 sm:flex">
                <Link
                  href="/login"
                  className="inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-medium text-foreground dark:text-slate-300 transition-colors hover:bg-secondary dark:hover:bg-slate-800"
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="inline-flex h-10 items-center justify-center rounded-lg bg-gradient-to-r from-orange-500 to-amber-600 dark:from-orange-600 dark:to-amber-700 px-6 text-sm font-medium text-white shadow-md transition-all hover:shadow-lg hover:opacity-90"
                >
                  S&apos;inscrire
                </Link>
              </div>
            )}

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex md:hidden p-2 text-foreground dark:text-slate-300 hover:bg-secondary dark:hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {isOpen && (
          <nav className="flex flex-col gap-3 border-t border-border dark:border-slate-800 py-4 md:hidden animate-in fade-in slide-in-from-top-2">
            <Link href="/" className="text-foreground dark:text-slate-300 transition-colors hover:text-orange-600 dark:hover:text-orange-400 px-2 py-2">
              Accueil
            </Link>
            {user?.userType === "artisan" && (
              <Link href="/requests" className="text-foreground dark:text-slate-300 transition-colors hover:text-orange-600 dark:hover:text-orange-400 px-2 py-2">
                Demandes
              </Link>
            )}
            <Link href="/#how-it-works" className="text-foreground dark:text-slate-300 transition-colors hover:text-orange-600 dark:hover:text-orange-400 px-2 py-2">
              Comment ça marche
            </Link>
            <Link href="/#contact" className="text-foreground dark:text-slate-300 transition-colors hover:text-orange-600 dark:hover:text-orange-400 px-2 py-2">
              Contact
            </Link>
            {user ? (
              <div className="flex flex-col gap-2 pt-2">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary dark:bg-slate-800 hover:bg-accent dark:hover:bg-slate-700 transition-colors"
                >
                  <img
                    src={user.photo || "/unknown-user.svg"}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="text-sm font-medium text-foreground dark:text-slate-200">
                    {getDisplayName()}
                  </span>
                </Link>
                <button
                  onClick={logout}
                  className="flex-1 inline-flex h-10 items-center justify-center rounded-lg text-foreground dark:text-slate-300 text-center transition-colors hover:bg-secondary dark:hover:bg-slate-800 text-sm font-medium"
                >
                  <LogOut size={16} className="mr-2" />
                  Déconnexion
                </button>
              </div>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link
                  href="/login"
                  className="flex-1 inline-flex h-10 items-center justify-center rounded-lg text-foreground dark:text-slate-300 text-center transition-colors hover:bg-secondary dark:hover:bg-slate-800 text-sm font-medium"
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="flex-1 inline-flex h-10 items-center justify-center rounded-lg bg-gradient-to-r from-orange-500 to-amber-600 dark:from-orange-600 dark:to-amber-700 text-white text-center font-medium transition-all hover:shadow-lg hover:opacity-90 text-sm"
                >
                  S&apos;inscrire
                </Link>
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}
