'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { AuthProvider } from '@/contexts/AuthContext'
import { 
  CheckSquare, 
  Zap, 
  Shield, 
  BarChart3, 
  ArrowRight,
  Sparkles,
  Clock,
  Users
} from 'lucide-react'

function LandingContent() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 transition-colors duration-300">
        {/* Hero Section */}
        <section className="relative overflow-hidden min-h-[90vh] flex items-center">
          {/* Animated background elements */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {/* Animated gradient orbs */}
            <div className="absolute -top-40 left-1/4 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-primary/20 to-accent/10 blur-3xl animate-pulse-glow" />
            <div className="absolute top-1/3 -right-20 h-[500px] w-[500px] rounded-full bg-gradient-to-bl from-accent/20 to-chart-3/10 blur-3xl animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
            <div className="absolute -bottom-20 left-0 h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-chart-3/15 to-primary/10 blur-3xl animate-pulse-glow" style={{ animationDelay: '3s' }} />
            
            {/* Floating particles */}
            <div className="absolute top-20 right-1/4 h-4 w-4 rounded-full bg-primary animate-bounce-subtle shadow-lg shadow-primary/50" />
            <div className="absolute top-40 left-1/3 h-3 w-3 rounded-full bg-accent animate-bounce-subtle shadow-lg shadow-accent/50" style={{ animationDelay: '0.5s' }} />
            <div className="absolute bottom-40 right-1/3 h-5 w-5 rounded-full bg-chart-3 animate-bounce-subtle shadow-lg shadow-chart-3/50" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-20 h-2 w-2 rounded-full bg-chart-4 animate-bounce-subtle shadow-lg shadow-chart-4/50" style={{ animationDelay: '1.5s' }} />
            <div className="absolute bottom-1/4 right-20 h-3 w-3 rounded-full bg-chart-5 animate-bounce-subtle shadow-lg shadow-chart-5/50" style={{ animationDelay: '2s' }} />
            
            {/* Animated rings */}
            <div className="absolute top-1/4 right-1/4 h-32 w-32 rounded-full border border-primary/20 animate-spin-slow" />
            <div className="absolute bottom-1/4 left-1/4 h-48 w-48 rounded-full border border-accent/10 animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '30s' }} />
          </div>
          
          <div className="container relative mx-auto px-4 py-16 md:py-24 lg:py-32">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
              {/* Left Content */}
              <div className="text-center lg:text-left">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-5 py-2.5 text-sm backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-700 shadow-lg shadow-primary/10">
                  <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                  <span className="font-semibold text-primary">Introducing Todo 2.0</span>
                </div>
                
                <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                  The complete platform to{' '}
                  <span className="gradient-text bg-[length:200%_200%] animate-gradient">organize your work</span>
                </h1>
                
                <p className="mx-auto mb-10 max-w-2xl text-pretty text-lg text-muted-foreground md:text-xl lg:mx-0 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                  Your personal productivity toolkit. Stop configuring and start achieving. 
                  Securely manage, track, and complete tasks with Todo.
                </p>
                
                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                  <Link href="/signup">
                    <Button size="lg" className="group relative h-14 gap-2 overflow-hidden gradient-bg px-10 text-base font-semibold text-white shadow-xl shadow-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/40 hover:scale-105">
                      <span className="relative z-10 flex items-center gap-2">
                        Get Started Free
                        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    </Button>
                  </Link>
                  <Link href="/signin">
                    <Button size="lg" variant="outline" className="h-14 px-10 text-base font-semibold border-2 border-primary/40 bg-transparent backdrop-blur-sm transition-all duration-300 hover:bg-primary/10 hover:border-primary hover:scale-105 hover:shadow-lg hover:shadow-primary/20">
                      Sign In
                    </Button>
                  </Link>
                </div>
              </div>
              
              {/* Right Content - Hero Image */}
              <div className="relative flex items-center justify-center animate-in fade-in zoom-in-95 duration-1000 delay-300">
                <div className="relative">
                  {/* Multiple glow layers */}
                  <div className="absolute -inset-8 rounded-[2rem] bg-gradient-to-br from-primary/30 via-accent/20 to-chart-3/20 blur-3xl animate-pulse-glow" />
                  <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-chart-3/20 via-primary/15 to-accent/15 blur-2xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
                  
                  {/* Floating animation wrapper */}
                  <div className="relative animate-float">
                    <div className="relative overflow-hidden rounded-3xl border-2 border-primary/30 bg-card/40 p-1 shadow-2xl shadow-primary/20 backdrop-blur-md">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
                      <Image
                        src="/images/Hero section.png"
                        alt="Todo App - Task Management Robot Assistant"
                        width={550}
                        height={550}
                        className="relative z-10 rounded-2xl"
                        priority
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="relative border-y border-border/40 bg-gradient-to-r from-card/50 via-card/30 to-card/50 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
          {/* Animated background line */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/2 left-0 h-px w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-shimmer" />
          </div>
          <div className="container relative mx-auto px-4 py-20">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {[
                { value: '99.9%', label: 'Uptime SLA', icon: Shield, color: 'text-chart-5', shadow: 'shadow-chart-5/30' },
                { value: '50K+', label: 'Active Users', icon: Users, color: 'text-accent', shadow: 'shadow-accent/30' },
                { value: '2M+', label: 'Tasks Completed', icon: CheckSquare, color: 'text-primary', shadow: 'shadow-primary/30' },
                { value: '<100ms', label: 'Response Time', icon: Clock, color: 'text-chart-3', shadow: 'shadow-chart-3/30' },
              ].map((stat, i) => (
                <div 
                  key={stat.label} 
                  className="group text-center animate-in fade-in slide-in-from-bottom-4 duration-700"
                  style={{ animationDelay: `${i * 100 + 400}ms` }}
                >
                  <div className="mb-4 flex items-center justify-center gap-4">
                    <div className={`rounded-xl bg-card/80 p-3 shadow-xl ${stat.shadow} backdrop-blur-sm transition-all duration-500 group-hover:scale-125 group-hover:rotate-6`}>
                      <stat.icon className={`h-6 w-6 ${stat.color} transition-transform duration-300 group-hover:scale-110`} />
                    </div>
                    <span className="gradient-text text-4xl font-bold md:text-5xl">{stat.value}</span>
                  </div>
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative py-32 overflow-hidden">
          {/* Animated background decorations */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute top-1/4 right-0 h-[400px] w-[400px] rounded-full bg-primary/10 blur-3xl animate-pulse-glow" />
            <div className="absolute bottom-1/4 left-0 h-[400px] w-[400px] rounded-full bg-accent/10 blur-3xl animate-pulse-glow" style={{ animationDelay: '2s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[300px] rounded-full bg-chart-3/5 blur-3xl animate-pulse-glow" style={{ animationDelay: '4s' }} />
          </div>
          
          <div className="container relative mx-auto px-4">
            <div className="mx-auto mb-20 max-w-3xl text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-sm backdrop-blur-sm">
                <Zap className="h-4 w-4 text-accent" />
                <span className="font-medium text-accent">Powerful Features</span>
              </div>
              <h2 className="mb-6 text-4xl font-bold tracking-tight md:text-5xl">
                Everything you need to <span className="gradient-text">stay productive</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Powerful features designed to help you manage tasks efficiently and collaborate seamlessly.
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: CheckSquare,
                  title: 'Task Management',
                  description: 'Create, organize, and track tasks with an intuitive interface. Never miss a deadline again.',
                  gradient: 'from-primary/20 to-primary/5',
                  iconColor: 'text-primary',
                  shadowColor: 'group-hover:shadow-primary/20'
                },
                {
                  icon: Zap,
                  title: 'Lightning Fast',
                  description: 'Built for speed with real-time updates. Your tasks sync instantly across all devices.',
                  gradient: 'from-chart-4/20 to-chart-4/5',
                  iconColor: 'text-chart-4',
                  shadowColor: 'group-hover:shadow-chart-4/20'
                },
                {
                  icon: Shield,
                  title: 'Secure by Default',
                  description: 'Enterprise-grade security with end-to-end encryption. Your data is always protected.',
                  gradient: 'from-chart-5/20 to-chart-5/5',
                  iconColor: 'text-chart-5',
                  shadowColor: 'group-hover:shadow-chart-5/20'
                },
                {
                  icon: BarChart3,
                  title: 'Analytics & Insights',
                  description: 'Track your productivity with detailed analytics. Understand your work patterns.',
                  gradient: 'from-accent/20 to-accent/5',
                  iconColor: 'text-accent',
                  shadowColor: 'group-hover:shadow-accent/20'
                },
                {
                  icon: Users,
                  title: 'Team Collaboration',
                  description: 'Share tasks and collaborate in real-time. Keep your team aligned and productive.',
                  gradient: 'from-chart-3/20 to-chart-3/5',
                  iconColor: 'text-chart-3',
                  shadowColor: 'group-hover:shadow-chart-3/20'
                },
                {
                  icon: Sparkles,
                  title: 'Smart Automation',
                  description: 'Automate repetitive tasks with smart rules. Let Todo handle the routine work.',
                  gradient: 'from-primary/20 to-accent/5',
                  iconColor: 'text-primary',
                  shadowColor: 'group-hover:shadow-primary/20'
                }
              ].map((feature, i) => (
                <div
                  key={feature.title}
                  className={`group relative overflow-hidden rounded-3xl border border-border/50 bg-card/50 p-8 backdrop-blur-sm transition-all duration-500 hover:border-primary/50 hover:shadow-2xl ${feature.shadowColor} hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700`}
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  {/* Background gradient on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />
                  
                  {/* Shine effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </div>
                  
                  <div className="relative">
                    <div className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-card to-card/50 border border-border/50 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-xl`}>
                      <feature.icon className={`h-8 w-8 ${feature.iconColor} transition-all duration-300 group-hover:scale-110`} />
                    </div>
                    <h3 className="mb-3 text-xl font-bold">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                  
                  {/* Animated gradient border on hover */}
                  <div className="absolute bottom-0 left-0 h-1.5 w-0 gradient-bg rounded-full transition-all duration-700 group-hover:w-full" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative border-t border-border/40 py-32 overflow-hidden">
          {/* Animated background */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-primary/20 via-accent/10 to-chart-3/10 blur-3xl animate-pulse-glow" />
            <div className="absolute top-0 right-1/4 h-3 w-3 rounded-full bg-primary animate-bounce-subtle" />
            <div className="absolute bottom-1/4 left-1/4 h-2 w-2 rounded-full bg-accent animate-bounce-subtle" style={{ animationDelay: '0.5s' }} />
          </div>
          
          <div className="container relative mx-auto px-4">
            <div className="mx-auto max-w-4xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                <span className="font-medium text-primary">Get Started Today</span>
              </div>
              <h2 className="mb-6 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                Ready to <span className="gradient-text">boost your productivity</span>?
              </h2>
              <p className="mb-10 text-xl text-muted-foreground max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                Join thousands of users who have transformed their workflow with Todo.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                <Link href="/signup">
                  <Button size="lg" className="group relative h-16 gap-3 overflow-hidden gradient-bg px-12 text-xl font-semibold text-white shadow-2xl shadow-primary/30 transition-all duration-500 hover:shadow-3xl hover:shadow-primary/40 hover:scale-105">
                    <span className="relative z-10 flex items-center gap-3">
                      Start Free Trial
                      <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-2" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  </Button>
                </Link>
                <p className="text-sm text-muted-foreground">No credit card required</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
}

export default function HomePage() {
  return (
    <AuthProvider>
      <LandingContent />
    </AuthProvider>
  )
}