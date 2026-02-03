export default {
  name: 'crmSettings',
  title: 'CRM Settings',
  type: 'document',
  groups: [
    { name: 'pipeline', title: 'Pipeline & Statuses' },
    { name: 'options', title: 'Dropdown Options' },
    { name: 'defaults', title: 'Defaults' },
    { name: 'display', title: 'Display Settings' },
  ],
  fields: [
    // Pipeline Stages
    {
      name: 'pipelineStages',
      title: 'Pipeline Stages',
      type: 'array',
      group: 'pipeline',
      description: 'Stages for the lead pipeline (Kanban board)',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'key',
              title: 'Key (Internal ID)',
              type: 'string',
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: 'label',
              title: 'Display Label',
              type: 'string',
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: 'color',
              title: 'Color (Hex)',
              type: 'string',
              validation: (Rule: any) => Rule.required().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color'),
            },
          ],
          preview: {
            select: { label: 'label', color: 'color' },
            prepare({ label, color }: any) {
              return {
                title: label,
                subtitle: color,
              }
            },
          },
        },
      ],
      initialValue: [
        { key: 'new', label: 'New Lead', color: '#fe5557' },
        { key: 'contacted', label: 'Contacted', color: '#8b5cf6' },
        { key: 'site_visit', label: 'Site Visit', color: '#6366f1' },
        { key: 'quoted', label: 'Quote Sent', color: '#f59e0b' },
        { key: 'negotiating', label: 'Negotiating', color: '#f97316' },
        { key: 'won', label: 'Won', color: '#10b981' },
        { key: 'lost', label: 'Lost', color: '#6b7280' },
      ],
    },

    // Deal Statuses
    {
      name: 'dealStatuses',
      title: 'Deal/Project Statuses',
      type: 'array',
      group: 'pipeline',
      description: 'Statuses for deals/projects',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'key',
              title: 'Key',
              type: 'string',
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: 'label',
              title: 'Label',
              type: 'string',
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: 'color',
              title: 'Color (Hex)',
              type: 'string',
              validation: (Rule: any) => Rule.required(),
            },
          ],
          preview: {
            select: { label: 'label', color: 'color' },
            prepare({ label, color }: any) {
              return { title: label, subtitle: color }
            },
          },
        },
      ],
      initialValue: [
        { key: 'planning', label: 'Planning', color: '#f59e0b' },
        { key: 'permitting', label: 'Permitting', color: '#6366f1' },
        { key: 'in_progress', label: 'In Progress', color: '#10b981' },
        { key: 'inspection', label: 'Final Inspection', color: '#14b8a6' },
        { key: 'completed', label: 'Completed', color: '#059669' },
        { key: 'warranty', label: 'Warranty Period', color: '#6b7280' },
        { key: 'paused', label: 'Paused', color: '#ef4444' },
        { key: 'cancelled', label: 'Cancelled', color: '#374151' },
      ],
    },

    // Lead Sources (for manual entry)
    {
      name: 'leadSources',
      title: 'Lead Sources (Manual)',
      type: 'array',
      group: 'options',
      description: 'Options for how the lead found the business',
      of: [{ type: 'string' }],
      initialValue: [
        'Phone Call',
        'Referral',
        'Walk-in',
        'Yard Sign',
        'Home Show / Expo',
        'Returning Client',
        'Nextdoor',
        'Social Media',
        'Other',
      ],
    },

    // Service/Project Types
    {
      name: 'serviceTypes',
      title: 'Service / Project Types',
      type: 'array',
      group: 'options',
      description: 'Types of projects/services offered',
      of: [{ type: 'string' }],
      initialValue: [
        'Kitchen Remodel',
        'Bathroom Remodel',
        'Home Addition',
        'Deck / Patio',
        'Full Renovation',
        'ADU / Guest House',
        'Roofing',
        'Flooring',
        'Exterior / Siding',
        'Garage',
        'Basement Finish',
        'Commercial',
        'Other',
      ],
    },

    // Defaults
    {
      name: 'defaultPriority',
      title: 'Default Lead Priority',
      type: 'string',
      group: 'defaults',
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

    // Display Settings
    {
      name: 'currency',
      title: 'Currency Symbol',
      type: 'string',
      group: 'display',
      initialValue: '$',
    },
    {
      name: 'industryLabel',
      title: 'Industry Label',
      type: 'string',
      group: 'display',
      description: 'e.g., "Contractor", "Realtor", "Coach"',
      initialValue: 'Contractor',
    },
    {
      name: 'dealLabel',
      title: 'Deal Label',
      type: 'string',
      group: 'display',
      description: 'What to call deals in the UI (e.g., "Project", "Transaction", "Engagement")',
      initialValue: 'Project',
    },
    {
      name: 'leadsPageSize',
      title: 'Leads Per Page',
      type: 'number',
      group: 'display',
      description: 'Number of leads to show per page in the table',
      initialValue: 20,
    },
  ],
  preview: {
    prepare() {
      return {
        title: 'CRM Settings',
        subtitle: 'Configure your CRM',
      }
    },
  },
}
