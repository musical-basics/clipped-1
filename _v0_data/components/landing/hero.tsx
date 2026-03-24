"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Play } from "lucide-react"

export function Hero() {
  const scrollToDemo = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollToWaitlist = () => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-[#0A0A0F]">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#7C5CFC]/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#7C5CFC]/10 rounded-full blur-[128px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#7C5CFC]/5 rounded-full blur-[200px]" />
      </div>

      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(#F5F5F7 1px, transparent 1px), linear-gradient(90deg, #F5F5F7 1px, transparent 1px)`,
          backgroundSize: '64px 64px'
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#16161F]/80 border border-[#2A2A3A] backdrop-blur-sm mb-8">
          <span className="w-2 h-2 rounded-full bg-[#00D68F] animate-pulse" />
          <span className="text-sm text-[#8B8B9E]">Now accepting early access signups</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-[#F5F5F7] mb-6 text-balance">
          Stop hoarding notes.{" "}
          <span className="bg-gradient-to-r from-[#7C5CFC] to-[#9D7FFF] bg-clip-text text-transparent">
            Start processing them.
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl text-[#8B8B9E] max-w-2xl mx-auto mb-10 leading-relaxed text-pretty">
          Frictionless capture meets Tinder-style triage. Use AI to automatically merge, clean, and organize your scattered thoughts.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button 
            onClick={scrollToWaitlist}
            size="lg"
            className="relative group bg-[#7C5CFC] hover:bg-[#6B4FE0] text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-[0_0_40px_rgba(124,92,252,0.4)] hover:shadow-[0_0_60px_rgba(124,92,252,0.6)] transition-all duration-300"
          >
            Get Early Access (Free)
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          <Button 
            onClick={scrollToDemo}
            variant="ghost" 
            size="lg"
            className="text-[#8B8B9E] hover:text-[#F5F5F7] hover:bg-[#16161F] px-8 py-6 text-lg rounded-xl transition-all duration-300"
          >
            <Play className="mr-2 w-5 h-5" />
            See how it works
          </Button>
        </div>

        {/* Social proof hint */}
        <p className="mt-12 text-sm text-[#8B8B9E]/60">
          Join 2,400+ early adopters already on the waitlist
        </p>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0A0A0F] to-transparent" />
    </section>
  )
}
