import { Scissors } from "lucide-react"

export function Footer() {
  return (
    <footer className="relative py-12 px-6 border-t border-[#2A2A3A]">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#7C5CFC]/20 flex items-center justify-center border border-[#7C5CFC]/30">
              <Scissors className="w-4 h-4 text-[#7C5CFC]" />
            </div>
            <span className="font-bold text-[#F5F5F7]">Clipped</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-8">
            <a href="#features" className="text-sm text-[#8B8B9E] hover:text-[#F5F5F7] transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-sm text-[#8B8B9E] hover:text-[#F5F5F7] transition-colors">
              Pricing
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-sm text-[#8B8B9E] hover:text-[#F5F5F7] transition-colors">
              Twitter
            </a>
          </div>

          {/* Copyright */}
          <p className="text-sm text-[#8B8B9E]/60">
            © 2026 Clipped. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
