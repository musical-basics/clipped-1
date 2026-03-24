"use client"

import { Inbox, Smartphone, Lock } from "lucide-react"

const steps = [
  {
    number: "01",
    title: "Capture",
    description: "Instantly dump thoughts the moment they strike. No friction, no formatting required.",
    icon: Inbox,
    color: "#7C5CFC"
  },
  {
    number: "02", 
    title: "Triage",
    description: "Swipe through your inbox daily. Trash, keep, or merge. Make decisions in seconds.",
    icon: Smartphone,
    color: "#4DA6FF"
  },
  {
    number: "03",
    title: "Vault",
    description: "Store perfectly organized, AI-cleaned notes. Ready when you need them.",
    icon: Lock,
    color: "#00D68F"
  }
]

export function HowItWorks() {
  return (
    <section className="relative py-24 px-6">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#7C5CFC]/5 to-transparent" />
      
      <div className="relative max-w-5xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[#F5F5F7] mb-4">
            How it works
          </h2>
          <p className="text-[#8B8B9E] text-lg max-w-2xl mx-auto">
            Three simple steps to note-taking zen
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={step.number} className="relative group">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-[calc(50%+60px)] w-[calc(100%-60px)] h-px bg-gradient-to-r from-[#2A2A3A] to-transparent" />
              )}
              
              <div className="relative flex flex-col items-center text-center">
                {/* Step number */}
                <span 
                  className="text-6xl font-bold opacity-10 absolute -top-4"
                  style={{ color: step.color }}
                >
                  {step.number}
                </span>
                
                {/* Icon */}
                <div 
                  className="relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border transition-all duration-300 group-hover:scale-110"
                  style={{ 
                    backgroundColor: `${step.color}20`,
                    borderColor: `${step.color}40`
                  }}
                >
                  <step.icon className="w-7 h-7" style={{ color: step.color }} />
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-bold text-[#F5F5F7] mb-3">{step.title}</h3>
                <p className="text-[#8B8B9E] leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
