import project from './project'
import service from './service'
import testimonial from './testimonial'
import faq from './faq'
import siteSettings from './siteSettings'

// CRM Schemas
import { crmSchemas } from './crm'

export const schemaTypes = [
  project,
  service,
  testimonial,
  faq,
  siteSettings,
  // CRM
  ...crmSchemas,
]
