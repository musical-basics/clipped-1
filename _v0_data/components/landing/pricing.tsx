"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check, Sparkles, Loader2 } from "lucide-react"

const features = [
  "Unlimited captures",
  "500 AI Merges / month",
  "100 Magic Cleanups / month",
  "Early access to new features",
  "Priority support"
]

export function Pricing() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    
    setIsSubmitting(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  return (
    <section id="pricing" className="relative py-24 px-6">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#7C5CFC]/10 rounded-full blur-[200px]" />
      </div>

      <div className="relative max-w-lg mx-auto">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#F5F5F7] mb-4">
            Get early access
          </h2>
          <p className="text-[#8B8B9E] text-lg">
            Be among the first to experience note-taking freedom
          </p>
        </div>

        {/* Pricing card */}
        <div className="relative group">
          {/* Glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-[#7C5CFC] via-[#4DA6FF] to-[#7C5CFC] rounded-3xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
          
          <div className="relative bg-[#16161F] border border-[#2A2A3A] rounded-2xl p-8 backdrop-blur-sm">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#7C5CFC]/20 border border-[#7C5CFC]/30 mb-6">
              <Sparkles className="w-4 h-4 text-[#7C5CFC]" />
              <span className="text-sm font-medium text-[#7C5CFC]">Early Adopter</span>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-[#F5F5F7]">$0</span>
                <span className="text-[#8B8B9E]">/ forever</span>
              </div>
              <p className="text-sm text-[#8B8B9E] mt-2">Lock in free access as an early supporter</p>
            </div>

            {/* Features */}
            <ul className="space-y-3 mb-8">
              {features.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#00D68F]/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-[#00D68F]" />
                  </div>
                  <span className="text-[#F5F5F7]">{feature}</span>
                </li>
              ))}
            </ul>

            {/* Email form */}
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-14 px-5 bg-[#1E1E2A] border-[#2A2A3A] rounded-xl text-[#F5F5F7] placeholder:text-[#8B8B9E] focus:border-[#7C5CFC] focus:ring-[#7C5CFC]/20 transition-all"
                    required
                  />
                </div>
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-14 bg-[#7C5CFC] hover:bg-[#6B4FE0] text-white font-semibold rounded-xl shadow-[0_0_40px_rgba(124,92,252,0.4)] hover:shadow-[0_0_60px_rgba(124,92,252,0.6)] transition-all duration-300 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    "Join the Waitlist"
                  )}
                </Button>
              </form>
            ) : (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-[#00D68F]/20 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-[#00D68F]" />
                </div>
                <h3 className="text-xl font-bold text-[#F5F5F7] mb-2">{"You're in!"}</h3>
                <p className="text-[#8B8B9E]">{"We'll notify you when Clipped is ready."}</p>
              </div>
            )}

            {/* Trust indicators */}
            {!isSubmitted && (
              <p className="text-center text-xs text-[#8B8B9E]/60 mt-4">
                No spam. Unsubscribe anytime. 2,400+ already joined.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
