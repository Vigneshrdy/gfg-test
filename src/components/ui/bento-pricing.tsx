'use client'
import React from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckIcon, SparklesIcon } from 'lucide-react'

type PricingCardProps = {
  titleBadge: string
  priceLabel: string
  priceSuffix?: string
  features: string[]
  cta?: string
  ctaTo?: string
  className?: string
}

function FilledCheck() {
  return (
    <div className="rounded-full bg-[#2DD4BF] p-0.5 text-[#080B0E]">
      <CheckIcon className="size-3" strokeWidth={3} />
    </div>
  )
}

function PricingCard({
  titleBadge,
  priceLabel,
  priceSuffix = '/month',
  features,
  cta = 'Get Started',
  ctaTo = '/signup',
  className,
}: PricingCardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-[10px] border border-[#253040] bg-[#131920]',
        'supports-[backdrop-filter]:bg-[#131920]/80 backdrop-blur',
        className,
      )}
    >
      <div className="flex items-center gap-3 p-4">
        <Badge
          variant="secondary"
          className="bg-[#1A232D] text-[#8FA3B8] border-[#253040] font-mono tracking-widest text-[11px]"
        >
          {titleBadge}
        </Badge>
        <div className="ml-auto">
          <Link to={ctaTo}>
            <Button
              variant="outline"
              size="sm"
              className="border-[#344558] bg-transparent text-[#E8EDF2] hover:border-[#2DD4BF]/50 hover:text-[#2DD4BF] transition-colors"
            >
              {cta}
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex items-end gap-2 px-4 py-2">
        <span className="font-mono text-5xl font-semibold tracking-tight text-[#E8EDF2]">
          {priceLabel}
        </span>
        {priceLabel.toLowerCase() !== 'free' && priceLabel.toLowerCase() !== 'custom' && (
          <span className="text-[#4F6478] text-sm pb-1">{priceSuffix}</span>
        )}
      </div>

      <ul className="text-[#8FA3B8] grid gap-3 p-4 text-sm">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-3">
            <FilledCheck />
            <span className="leading-relaxed">{f}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function BentoPricing() {
  return (
    <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-8">
      {/* Featured / Pro card */}
      <div
        className={cn(
          'relative w-full overflow-hidden rounded-[10px] border border-[#2DD4BF]/30 bg-[#131920]',
          'supports-[backdrop-filter]:bg-[#131920]/80 backdrop-blur',
          'lg:col-span-5',
        )}
        style={{ boxShadow: '0 0 32px rgba(45,212,191,0.08)' }}
      >
        {/* Grid overlay */}
        <div className="pointer-events-none absolute top-0 left-1/2 -mt-2 -ml-20 h-full w-full [mask-image:linear-gradient(white,transparent)]">
          <div className="absolute inset-0 bg-gradient-to-r from-[#2DD4BF]/5 to-[#60A5FA]/3 [mask-image:radial-gradient(farthest-side_at_top,white,transparent)]">
            <div
              aria-hidden="true"
              className="absolute inset-0 size-full mix-blend-overlay opacity-40"
              style={{
                backgroundImage: 'linear-gradient(to right, rgba(45,212,191,0.1) 1px, transparent 1px)',
                backgroundSize: '24px',
              }}
            />
          </div>
        </div>

        <div className="relative flex items-center gap-3 p-4">
          <Badge
            variant="secondary"
            className="bg-[#0F3D38] text-[#2DD4BF] border-[#2DD4BF]/20 font-mono tracking-widest text-[11px]"
          >
            PRO
          </Badge>
          <Badge
            variant="outline"
            className="hidden lg:flex border-[#344558] text-[#8FA3B8] text-[11px]"
          >
            <SparklesIcon className="me-1 size-3 text-[#2DD4BF]" /> Most Popular
          </Badge>
          <div className="ml-auto">
            <Link to="/signup">
              <Button
                size="sm"
                style={{ background: 'linear-gradient(135deg, #2DD4BF 0%, #1A9E8F 100%)' }}
                className="text-[#080B0E] font-semibold hover:opacity-90 transition-opacity"
              >
                Start Free Trial
              </Button>
            </Link>
          </div>
        </div>

        <div className="relative flex flex-col p-4 lg:flex-row">
          <div className="pb-4 lg:w-[30%]">
            <span className="font-mono text-5xl font-semibold tracking-tight text-[#E8EDF2]">$29</span>
            <span className="text-[#4F6478] text-sm"> /month</span>
          </div>
          <ul className="text-[#8FA3B8] grid gap-3 text-sm lg:w-[70%]">
            {[
              'Unlimited NL queries against your database',
              'Up to 5 connected MySQL / Postgres sources',
              'AI-generated insights & anomaly detection',
              'CSV upload + full export (PDF / PNG)',
              'Priority support & guaranteed uptime SLA',
            ].map((f, i) => (
              <li key={i} className="flex items-start gap-3">
                <FilledCheck />
                <span className="leading-relaxed">{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Free card */}
      <PricingCard
        titleBadge="FREE"
        priceLabel="$0"
        features={[
          '50 queries / month',
          '1 database connection',
          'CSV upload',
          'Basic charts',
        ]}
        cta="Get Started Free"
        ctaTo="/signup"
        className="lg:col-span-3"
      />

      {/* Teams card */}
      <PricingCard
        titleBadge="TEAMS"
        priceLabel="$79"
        features={[
          'Unlimited queries across your team',
          'Up to 15 database connections',
          'Collaborative dashboards & sharing',
          'Role-based access control',
          'Advanced analytics & audit log',
        ]}
        cta="Try Teams"
        ctaTo="/signup"
        className="lg:col-span-4"
      />

      {/* Enterprise card */}
      <PricingCard
        titleBadge="ENTERPRISE"
        priceLabel="Custom"
        features={[
          'Unlimited connections & users',
          'SSO / SAML authentication',
          'On-premise deployment option',
          'Dedicated account management',
          'Custom SLA & data residency',
        ]}
        cta="Contact Sales"
        ctaTo="/signup"
        className="lg:col-span-4"
      />
    </div>
  )
}
