export default {
  name: 'lead',
  title: 'Leads',
  type: 'document',
  groups: [
    { name: 'contact', title: 'Contact Info' },
    { name: 'details', title: 'Lead Details' },
    { name: 'content', title: 'Content & Notes' },
    { name: 'meta', title: 'Metadata' },
  ],
  fields: [
    // Contact Info
    {
      name: 'fullName',
      title: 'Full Name',
      type: 'string',
      group: 'contact',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'email',
      title: 'Email',
      type: 'string',
      group: 'contact',
      validation: (Rule: any) => Rule.email(),
    },
    {
      name: 'phone',
      title: 'Phone',
      type: 'string',
      group: 'contact',
    },

    // Lead Details
    {
      name: 'origin',
      title: 'Origin',
      type: 'string',
      group: 'details',
      description: 'How this lead entered the system',
      options: {
        list: [
          { title: 'Website Form (Auto)', value: 'auto_website_form' },
          { title: 'Landing Page (Auto)', value: 'auto_landing_page' },
          { title: 'Manual Entry', value: 'manual' },
        ],
      },
      validation: (Rule: any) => Rule.required(),
      initialValue: 'manual',
    },
    {
      name: 'source',
      title: 'Source',
      type: 'string',
      group: 'details',
      description: 'How they found the business (for manual leads)',
      options: {
        list: [
          { title: 'Phone Call', value: 'phone_call' },
          { title: 'Referral', value: 'referral' },
          { title: 'Walk-in', value: 'walk_in' },
          { title: 'Yard Sign', value: 'yard_sign' },
          { title: 'Home Show / Expo', value: 'home_show' },
          { title: 'Returning Client', value: 'returning_client' },
          { title: 'Nextdoor', value: 'nextdoor' },
          { title: 'Social Media', value: 'social_media' },
          { title: 'Other', value: 'other' },
        ],
      },
    },
    {
      name: 'serviceType',
      title: 'Service Type',
      type: 'string',
      group: 'details',
      description: 'Type of project they are interested in',
      options: {
        list: [
          { title: 'Kitchen Remodel', value: 'kitchen_remodel' },
          { title: 'Bathroom Remodel', value: 'bathroom_remodel' },
          { title: 'Home Addition', value: 'home_addition' },
          { title: 'Deck / Patio', value: 'deck_patio' },
          { title: 'Full Renovation', value: 'full_renovation' },
          { title: 'ADU / Guest House', value: 'adu_guest_house' },
          { title: 'Roofing', value: 'roofing' },
          { title: 'Flooring', value: 'flooring' },
          { title: 'Exterior / Siding', value: 'exterior_siding' },
          { title: 'Garage', value: 'garage' },
          { title: 'Basement Finish', value: 'basement_finish' },
          { title: 'Commercial', value: 'commercial' },
          { title: 'Other', value: 'other' },
        ],
      },
    },
    {
      name: 'estimatedValue',
      title: 'Estimated Value',
      type: 'number',
      group: 'details',
      description: 'Estimated project value in dollars',
    },
    {
      name: 'priority',
      title: 'Priority',
      type: 'string',
      group: 'details',
      options: {
        list: [
          { title: 'High', value: 'high' },
          { title: 'Medium', value: 'medium' },
          { title: 'Low', value: 'low' },
        ],
        layout: 'radio',
      },
      initialValue: 'medium',
    },
    {
      name: 'status',
      title: 'Status',
      type: 'string',
      group: 'details',
      options: {
        list: [
          { title: 'New Lead', value: 'new' },
          { title: 'Contacted', value: 'contacted' },
          { title: 'Site Visit', value: 'site_visit' },
          { title: 'Quote Sent', value: 'quoted' },
          { title: 'Negotiating', value: 'negotiating' },
          { title: 'Won', value: 'won' },
          { title: 'Lost', value: 'lost' },
        ],
      },
      initialValue: 'new',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'referredBy',
      title: 'Referred By',
      type: 'string',
      group: 'details',
      description: 'Name of person or business who referred this lead',
    },

    // Content & Notes
    {
      name: 'originalMessage',
      title: 'Original Message',
      type: 'text',
      rows: 6,
      group: 'content',
      description: 'Auto-populated from form submission',
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
      group: 'content',
      description: 'Project description or requirements',
    },
    {
      name: 'internalNotes',
      title: 'Internal Notes',
      type: 'text',
      rows: 4,
      group: 'content',
      description: 'Private notes (not visible to client)',
    },

    // Relationships
    {
      name: 'convertedToClient',
      title: 'Converted to Client',
      type: 'reference',
      to: [{ type: 'client' }],
      group: 'meta',
      description: 'Link to client record if this lead was converted',
    },

    // Metadata
    {
      name: 'receivedAt',
      title: 'Received At',
      type: 'datetime',
      group: 'meta',
      initialValue: () => new Date().toISOString(),
    },
    {
      name: 'formId',
      title: 'Form ID',
      type: 'string',
      group: 'meta',
      description: 'ID of the form that generated this lead (for auto leads)',
      hidden: true,
    },
  ],
  preview: {
    select: {
      title: 'fullName',
      status: 'status',
      origin: 'origin',
      serviceType: 'serviceType',
    },
    prepare({ title, status, origin, serviceType }: any) {
      const statusLabels: any = {
        new: '🔵 New',
        contacted: '🟣 Contacted',
        site_visit: '🟣 Site Visit',
        quoted: '🟡 Quoted',
        negotiating: '🟠 Negotiating',
        won: '🟢 Won',
        lost: '⚫ Lost',
      }
      const originIcon = origin?.startsWith('auto') ? '⚡' : '✎'
      return {
        title: `${originIcon} ${title}`,
        subtitle: `${statusLabels[status] || status} • ${serviceType || 'No service type'}`,
      }
    },
  },
  orderings: [
    {
      title: 'Newest First',
      name: 'receivedAtDesc',
      by: [{ field: 'receivedAt', direction: 'desc' }],
    },
    {
      title: 'Priority',
      name: 'priorityDesc',
      by: [{ field: 'priority', direction: 'asc' }],
    },
  ],
}
