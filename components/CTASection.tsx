import Link from 'next/link'
import { Phone } from 'lucide-react'

interface CTASectionProps {
  companyName: string
  phone?: string
  headline?: string
  description?: string
  buttonText?: string
}

export default function CTASection({ companyName, phone, headline, description, buttonText }: CTASectionProps) {
  return (
    <section className="bg-primary py-16 lg:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4 font-heading">
          {headline || 'Ready to Transform Your Outdoor Space?'}
        </h2>
        <p className="text-lg text-white/80 mb-8">
          {description || `Let ${companyName} help bring your landscape vision to life. Get in touch for a free consultation.`}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/contact"
            className="w-full sm:w-auto px-8 py-4 bg-accent text-dark font-semibold rounded-lg hover:bg-accent-600 transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            {buttonText || 'Contact Us'}
          </Link>
          {phone && (
            <a
              href={`tel:${phone.replace(/\D/g, '')}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-lg border-2 border-white/30 hover:bg-white hover:text-primary transition-all shadow-lg hover:shadow-xl"
            >
              <Phone className="h-5 w-5" />
              {phone}
            </a>
          )}
        </div>
      </div>
    </section>
  )
}
