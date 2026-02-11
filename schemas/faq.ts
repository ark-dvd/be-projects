export default {
  name: 'faq',
  title: 'FAQ',
  type: 'document',
  fields: [
    {
      name: 'question',
      title: 'Question',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'answer',
      title: 'Answer',
      type: 'text',
      rows: 5,
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      description: 'Optional grouping (e.g., "General", "Pricing", "Process")',
    },
    {
      name: 'order',
      title: 'Display Order',
      type: 'number',
      initialValue: 0,
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'isActive',
      title: 'Show on Website',
      type: 'boolean',
      initialValue: true,
    },
  ],
  preview: {
    select: { title: 'question', subtitle: 'category', isActive: 'isActive' },
    prepare({ title, subtitle, isActive }: any) {
      return { title, subtitle: `${subtitle || 'General'} ${isActive ? '' : '🔒 Hidden'}` }
    },
  },
}
