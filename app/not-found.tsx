import Link from 'next/link'
import { Home, FolderOpen, Phone } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        {/* 404 Number */}
        <div className="text-9xl font-bold text-secondary/20 mb-4">404</div>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-dark mb-4 font-heading">
          Page Not Found
        </h1>

        {/* Description */}
        <p className="text-lg text-secondary mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-dark font-semibold rounded-lg hover:bg-accent-600 transition-colors"
          >
            <Home className="h-5 w-5" />
            Go Home
          </Link>
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 px-6 py-3 bg-light text-secondary font-semibold rounded-lg hover:bg-secondary/10 transition-colors"
          >
            <FolderOpen className="h-5 w-5" />
            View Projects
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-light text-secondary font-semibold rounded-lg hover:bg-secondary/10 transition-colors"
          >
            <Phone className="h-5 w-5" />
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  )
}
