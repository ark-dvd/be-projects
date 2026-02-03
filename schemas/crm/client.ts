export default {
  name: 'client',
  title: 'Clients',
  type: 'document',
  groups: [
    { name: 'contact', title: 'Contact Info' },
    { name: 'details', title: 'Client Details' },
    { name: 'notes', title: 'Notes' },
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
    {
      name: 'address',
      title: 'Address',
      type: 'text',
      rows: 3,
      group: 'contact',
      description: 'Client mailing address',
    },

    // Client Details
    {
      name: 'status',
      title: 'Status',
      type: 'string',
      group: 'details',
      options: {
        list: [
          { title: 'Active', value: 'active' },
          { title: 'Past', value: 'past' },
        ],
        layout: 'radio',
      },
      initialValue: 'active',
    },
    {
      name: 'clientSince',
      title: 'Client Since',
      type: 'datetime',
      group: 'details',
      initialValue: () => new Date().toISOString(),
    },
    {
      name: 'preferredContact',
      title: 'Preferred Contact Method',
      type: 'string',
      group: 'details',
      options: {
        list: [
          { title: 'Phone', value: 'phone' },
          { title: 'Email', value: 'email' },
          { title: 'Text', value: 'text' },
        ],
      },
    },

    // Notes
    {
      name: 'internalNotes',
      title: 'Internal Notes',
      type: 'text',
      rows: 6,
      group: 'notes',
      description: 'Private notes about this client',
    },

    // Relationships
    {
      name: 'sourceLead',
      title: 'Source Lead',
      type: 'reference',
      to: [{ type: 'lead' }],
      group: 'meta',
      description: 'The original lead that converted to this client',
    },

    // Contractor-specific custom fields
    {
      name: 'propertyType',
      title: 'Property Type',
      type: 'string',
      group: 'details',
      options: {
        list: [
          { title: 'Single Family Home', value: 'single_family' },
          { title: 'Condo / Townhouse', value: 'condo_townhouse' },
          { title: 'Multi-Family', value: 'multi_family' },
          { title: 'Commercial', value: 'commercial' },
          { title: 'Other', value: 'other' },
        ],
      },
    },
  ],
  preview: {
    select: {
      title: 'fullName',
      status: 'status',
      email: 'email',
    },
    prepare({ title, status, email }: any) {
      const statusIcon = status === 'active' ? '🟢' : '⚪'
      return {
        title: `${statusIcon} ${title}`,
        subtitle: email || 'No email',
      }
    },
  },
  orderings: [
    {
      title: 'Name (A-Z)',
      name: 'nameAsc',
      by: [{ field: 'fullName', direction: 'asc' }],
    },
    {
      title: 'Newest First',
      name: 'clientSinceDesc',
      by: [{ field: 'clientSince', direction: 'desc' }],
    },
  ],
}
