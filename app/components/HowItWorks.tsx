"use client"

import { FileText, Users, CheckCircle, Clock } from "lucide-react"

export default function HowItWorks() {
  const steps = [
    {
      icon: FileText,
      title: "Publiez votre demande",
      description: "Décrivez votre projet, ajoutez des photos et précisez votre localisation en quelques minutes.",
      number: "01",
    },
    {
      icon: Users,
      title: "Les artisans vous contactent",
      description: "Les artisans qualifiés voient votre demande et vous proposent leurs services directement.",
      number: "02",
    },
    {
      icon: Clock,
      title: "Recevez les devis",
      description: "Comparez les tarifs et délais proposés par différents artisans près de chez vous.",
      number: "03",
    },
    {
      icon: CheckCircle,
      title: "Choisissez le meilleur",
      description: "Sélectionnez l'artisan qui vous convient et commencez votre projet en toute confiance.",
      number: "04",
    },
  ]

  return (
    <section className="py-20 sm:py-32 bg-secondary/30 dark:bg-slate-900/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold tracking-tight text-foreground dark:text-white sm:text-5xl">
            Comment ça marche
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-foreground/70 dark:text-slate-300">
            Un processus simple et transparent en 4 étapes pour trouver l'artisan idéal
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={index} className="group relative">
                <div className="rounded-xl border border-border dark:border-slate-700 bg-card dark:bg-slate-800 p-6 h-full shadow-sm hover:shadow-md transition-all duration-300 hover:border-orange-500/50 dark:hover:border-orange-400/50">
                  <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-gradient-to-br from-orange-600 to-amber-600 dark:from-orange-500 dark:to-amber-500 text-white font-bold flex items-center justify-center text-sm shadow-md">
                    {step.number}
                  </div>

                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-950/30 group-hover:bg-orange-200 dark:group-hover:bg-orange-900/50 transition-colors">
                    <Icon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>

                  <h3 className="mb-3 text-xl font-semibold text-foreground dark:text-white">{step.title}</h3>
                  <p className="text-foreground/70 dark:text-slate-400 text-sm leading-relaxed">{step.description}</p>
                </div>

                {index < steps.length - 1 && (
                  <div className="absolute -right-4 top-1/2 hidden h-1 w-8 bg-orange-600/30 dark:bg-orange-400/20 lg:block" />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}