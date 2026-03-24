"use client"

import { Keyboard, Sparkles, Wand2, ArrowUp, ArrowLeft, ArrowRight, Merge } from "lucide-react"

export function BentoGrid() {
  return (
    <section id="features" className="relative py-24 px-6">
      {/* Section header */}
      <div className="max-w-5xl mx-auto text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-[#F5F5F7] mb-4">
          Your second brain, supercharged
        </h2>
        <p className="text-[#8B8B9E] text-lg max-w-2xl mx-auto">
          Four powerful features designed to eliminate digital hoarding forever
        </p>
      </div>

      {/* Bento Grid */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Box 1 - Tinder-style Triage (Large) */}
        <div className="md:row-span-2 group relative overflow-hidden rounded-2xl bg-[#16161F]/80 border border-[#2A2A3A] p-8 backdrop-blur-sm hover:border-[#7C5CFC]/50 transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-[#7C5CFC]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative z-10">
            <h3 className="text-2xl font-bold text-[#F5F5F7] mb-3">Tinder-style Triage</h3>
            <p className="text-[#8B8B9E] mb-8 leading-relaxed">
              Process your inbox with satisfying swipe gestures. Make decisions fast and never let notes pile up again.
            </p>

            {/* Interactive swipe demo */}
            <div className="relative flex flex-col items-center gap-6">
              {/* Mock card */}
              <div className="w-full max-w-xs bg-[#1E1E2A] rounded-xl p-6 border border-[#2A2A3A] shadow-xl">
                <div className="h-3 w-3/4 bg-[#2A2A3A] rounded mb-3" />
                <div className="h-3 w-1/2 bg-[#2A2A3A] rounded mb-3" />
                <div className="h-3 w-2/3 bg-[#2A2A3A] rounded" />
              </div>

              {/* Swipe indicators */}
              <div className="flex items-center justify-center gap-8">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-[#FF4D6A]/20 flex items-center justify-center border border-[#FF4D6A]/30">
                    <ArrowLeft className="w-5 h-5 text-[#FF4D6A]" />
                  </div>
                  <span className="text-xs text-[#FF4D6A]">Trash</span>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-[#4DA6FF]/20 flex items-center justify-center border border-[#4DA6FF]/30">
                    <ArrowUp className="w-5 h-5 text-[#4DA6FF]" />
                  </div>
                  <span className="text-xs text-[#4DA6FF]">AI Merge</span>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-[#00D68F]/20 flex items-center justify-center border border-[#00D68F]/30">
                    <ArrowRight className="w-5 h-5 text-[#00D68F]" />
                  </div>
                  <span className="text-xs text-[#00D68F]">Keep</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Box 2 - Frictionless Capture */}
        <div className="group relative overflow-hidden rounded-2xl bg-[#16161F]/80 border border-[#2A2A3A] p-8 backdrop-blur-sm hover:border-[#7C5CFC]/50 transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-[#7C5CFC]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-xl bg-[#7C5CFC]/20 flex items-center justify-center mb-4 border border-[#7C5CFC]/30">
              <Keyboard className="w-6 h-6 text-[#7C5CFC]" />
            </div>
            <h3 className="text-xl font-bold text-[#F5F5F7] mb-2">Frictionless Capture</h3>
            <p className="text-[#8B8B9E] leading-relaxed">
              Opens instantly to a keyboard. Zero latency. Dump your thoughts before they vanish.
            </p>
            
            {/* Mini keyboard visual */}
            <div className="mt-6 flex gap-1">
              {[...Array(10)].map((_, i) => (
                <div 
                  key={i} 
                  className="w-6 h-8 rounded bg-[#2A2A3A] border border-[#3A3A4A]"
                  style={{ animationDelay: `${i * 50}ms` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Box 3 - Semantic AI Merge */}
        <div className="group relative overflow-hidden rounded-2xl bg-[#16161F]/80 border border-[#2A2A3A] p-8 backdrop-blur-sm hover:border-[#7C5CFC]/50 transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-[#4DA6FF]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-xl bg-[#4DA6FF]/20 flex items-center justify-center mb-4 border border-[#4DA6FF]/30">
              <Merge className="w-6 h-6 text-[#4DA6FF]" />
            </div>
            <h3 className="text-xl font-bold text-[#F5F5F7] mb-2">Semantic AI Merge</h3>
            <p className="text-[#8B8B9E] leading-relaxed">
              Automatically finds and merges related thoughts using vector search. Your ideas connect themselves.
            </p>
            
            {/* Merge visual */}
            <div className="mt-6 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#2A2A3A] border border-[#4DA6FF]/30" />
              <Sparkles className="w-4 h-4 text-[#4DA6FF]" />
              <div className="w-8 h-8 rounded-lg bg-[#2A2A3A] border border-[#4DA6FF]/30" />
              <ArrowRight className="w-4 h-4 text-[#8B8B9E]" />
              <div className="w-12 h-8 rounded-lg bg-[#4DA6FF]/20 border border-[#4DA6FF]/50" />
            </div>
          </div>
        </div>

        {/* Box 4 - Magic Wand Cleanup */}
        <div className="md:col-span-2 group relative overflow-hidden rounded-2xl bg-[#16161F]/80 border border-[#2A2A3A] p-8 backdrop-blur-sm hover:border-[#7C5CFC]/50 transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-[#00D68F]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1">
              <div className="w-12 h-12 rounded-xl bg-[#00D68F]/20 flex items-center justify-center mb-4 border border-[#00D68F]/30">
                <Wand2 className="w-6 h-6 text-[#00D68F]" />
              </div>
              <h3 className="text-xl font-bold text-[#F5F5F7] mb-2">Magic Wand Cleanup</h3>
              <p className="text-[#8B8B9E] leading-relaxed">
                One click turns chaotic brain-dumps into perfectly formatted bullet points using LLMs. Your mess becomes pristine.
              </p>
            </div>
            
            {/* Before/After visual */}
            <div className="flex-1 flex gap-4">
              <div className="flex-1 p-4 rounded-xl bg-[#1E1E2A] border border-[#2A2A3A]">
                <span className="text-xs text-[#8B8B9E] mb-2 block">Before</span>
                <div className="space-y-1">
                  <div className="h-2 w-full bg-[#2A2A3A] rounded" />
                  <div className="h-2 w-4/5 bg-[#2A2A3A] rounded" />
                  <div className="h-2 w-3/4 bg-[#2A2A3A] rounded" />
                </div>
              </div>
              <div className="flex-1 p-4 rounded-xl bg-[#00D68F]/10 border border-[#00D68F]/30">
                <span className="text-xs text-[#00D68F] mb-2 block">After</span>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00D68F]" />
                    <div className="h-2 w-3/4 bg-[#00D68F]/30 rounded" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00D68F]" />
                    <div className="h-2 w-2/3 bg-[#00D68F]/30 rounded" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00D68F]" />
                    <div className="h-2 w-1/2 bg-[#00D68F]/30 rounded" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
