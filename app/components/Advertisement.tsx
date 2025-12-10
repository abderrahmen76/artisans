"use client"

import { ArrowRight, Star } from "lucide-react"
import Link from "next/link"

export default function Advertisement() {
  return (
    <section className="py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-orange-600 to-amber-600 dark:from-orange-700 dark:to-amber-700 p-8 sm:p-12 md:p-16 shadow-xl">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          </div>

          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 dark:bg-white/10 px-4 py-2 mb-6 border border-white/30 dark:border-white/20">
              <Star size={16} className="text-white" />
              <span className="text-sm font-medium text-white">Développez votre activité</span>
            </div>

            <h3 className="mb-4 text-4xl font-bold text-white sm:text-5xl">Vous êtes artisan ?</h3>
            <p className="mx-auto mb-8 text-white/90 text-lg leading-relaxed max-w-2xl">
              Rejoignez notre plateforme et accédez à un flux constant de demandes qualifiées dans votre domaine de compétence. Augmentez votre visibilité et développez votre clientèle.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register-artisan"
                className="group inline-flex items-center justify-center gap-2 rounded-lg bg-white dark:bg-slate-100 px-8 py-4 font-semibold text-orange-600 dark:text-orange-700 shadow-lg transition-all hover:shadow-xl hover:scale-105 active:scale-95 w-full sm:w-auto"
              >
                Devenir partenaire
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-white/30 px-8 py-4 font-semibold text-white transition-all hover:border-white/50 hover:bg-white/10"
              >
                En savoir plus
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4 text-center text-white/80 text-sm">
              <div>
                <div className="font-bold text-lg text-white">500+</div>
                <div>Artisans actifs</div>
              </div>
              <div>
                <div className="font-bold text-lg text-white">1000+</div>
                <div>Demandes/mois</div>
              </div>
              <div>
                <div className="font-bold text-lg text-white">€</div>
                <div>Revenus générés</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}