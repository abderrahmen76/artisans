import Link from "next/link"
import { Heart, Facebook, Twitter, Linkedin, Mail } from "lucide-react"

export default function Footer() {
  const footerLinks = [
    {
      title: "Produit",
      links: [
        { label: "Pour les clients", href: "#" },
        { label: "Pour les artisans", href: "#" },
        { label: "Tarification", href: "#" },
      ],
    },
    {
      title: "Ressources",
      links: [
        { label: "Blog", href: "#" },
        { label: "Guides", href: "#" },
        { label: "Tutoriels", href: "#" },
      ],
    },
    {
      title: "Légal",
      links: [
        { label: "CGU", href: "#" },
        { label: "Mentions légales", href: "#" },
        { label: "Politique de confidentialité", href: "#" },
      ],
    },
    {
      title: "Support",
      links: [
        { label: "Contact", href: "#" },
        { label: "À propos", href: "#" },
        { label: "FAQ", href: "#" },
      ],
    },
  ]

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook", color: "hover:text-blue-600 dark:hover:text-blue-400" },
    { icon: Twitter, href: "#", label: "Twitter", color: "hover:text-sky-500 dark:hover:text-sky-400" },
    { icon: Linkedin, href: "#", label: "LinkedIn", color: "hover:text-blue-700 dark:hover:text-blue-400" },
    { icon: Mail, href: "#", label: "Email", color: "hover:text-orange-600 dark:hover:text-orange-400" },
  ]

  return (
    <footer className="border-t border-border/50 dark:border-slate-800/50 bg-gradient-to-b from-background to-secondary/20 dark:from-background dark:to-slate-900/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Main footer content */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5 mb-12">
          {/* Brand section */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 dark:from-orange-600 dark:to-amber-700 text-white font-bold shadow-md group-hover:shadow-lg transition-shadow">
                PA
              </div>
              <span className="font-bold text-foreground dark:text-slate-100 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                Platform Artisans
              </span>
            </Link>
            <p className="text-sm text-foreground/60 dark:text-slate-400 mb-4 leading-relaxed">
              Connectez-vous avec les meilleurs artisans locaux en quelques clics.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <Link
                    key={social.label}
                    href={social.href}
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border/50 dark:border-slate-700/50 text-foreground/50 dark:text-slate-400 transition-all ${social.color} hover:shadow-md`}
                    aria-label={social.label}
                  >
                    <Icon size={18} />
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Links sections */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className="mb-4 font-semibold text-foreground/90 dark:text-slate-100 text-sm uppercase tracking-wide">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link 
                      href={link.href} 
                      className="text-sm text-foreground/60 dark:text-slate-400 transition-colors hover:text-orange-600 dark:hover:text-orange-400 hover:translate-x-1 inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom section */}
        <div className="border-t border-border/30 dark:border-slate-800/30 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <div className="flex items-center justify-center gap-1 text-sm text-foreground/60 dark:text-slate-400">
              <span>© 2025 Platform Artisans. Fait avec</span>
              <Heart size={16} className="text-orange-500 dark:text-orange-400 animate-pulse inline" />
              <span>pour connecter artisans et clients.</span>
            </div>
            <div className="text-xs text-foreground/40 dark:text-slate-500">
              Designed with passion • Built with Next.js + Tailwind CSS
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}