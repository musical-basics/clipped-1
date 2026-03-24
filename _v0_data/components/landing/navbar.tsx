"use client"

import { Scissors } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Navbar() {
  const scrollToWaitlist = () => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-5xl px-6 py-4">
        <nav className="flex items-center justify-between rounded-2xl bg-[#16161F]/80 border border-[#2A2A3A] backdrop-blur-md px-6 py-3">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#7C5CFC]/20 flex items-center justify-center border border-[#7C5CFC]/30">
              <Scissors className="w-4 h-4 text-[#7C5CFC]" />
            </div>
            <span className="font-bold text-[#F5F5F7]">Clipped</span>
          </div>

          {/* Nav links - hidden on mobile */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-[#8B8B9E] hover:text-[#F5F5F7] transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-sm text-[#8B8B9E] hover:text-[#F5F5F7] transition-colors">
              Pricing
            </a>
          </div>

          {/* CTA */}
          <Button 
            onClick={scrollToWaitlist}
            size="sm"
            className="bg-[#7C5CFC] hover:bg-[#6B4FE0] text-white font-medium rounded-xl shadow-[0_0_20px_rgba(124,92,252,0.3)] hover:shadow-[0_0_30px_rgba(124,92,252,0.5)] transition-all duration-300"
          >
            Get Access
          </Button>
        </nav>
      </div>
    </header>
  )
}
