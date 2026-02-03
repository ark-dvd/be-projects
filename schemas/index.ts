import project from './project'
import service from './service'
import testimonial from './testimonial'
import activeJob from './activeJob'
import siteSettings from './siteSettings'

// CRM Schemas
import { crmSchemas } from './crm'

export const schemaTypes = [
  project,
  service,
  testimonial,
  activeJob,
  siteSettings,
  // CRM
  ...crmSchemas,
]
