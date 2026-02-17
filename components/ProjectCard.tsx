import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface ProjectCardProps {
  slug: string
  title: string
  heroImage?: string
  projectType?: string
  shortDescription?: string
  priority?: boolean
}

export default function ProjectCard({
  slug,
  title,
  heroImage,
  projectType,
  shortDescription,
  priority = false,
}: ProjectCardProps) {
  const truncatedDescription = shortDescription
    ? shortDescription.slice(0, 120) + (shortDescription.length > 120 ? '...' : '')
    : ''

  return (
    <Link
      href={`/projects/${slug}`}
      className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {heroImage ? (
          <Image
            src={heroImage}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={priority}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
            <span className="text-primary text-sm">No image</span>
          </div>
        )}
        {/* Project Type Badge */}
        {projectType && (
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-dark text-xs font-medium rounded-full">
              {projectType}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-semibold text-dark mb-2 group-hover:text-primary transition-colors font-heading">
          {title}
        </h3>
        {truncatedDescription && (
          <p className="text-secondary text-sm mb-4 line-clamp-2">
            {truncatedDescription}
          </p>
        )}
        <span className="inline-flex items-center gap-1 text-primary font-medium text-sm group-hover:gap-2 transition-all">
          View Project
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  )
}
