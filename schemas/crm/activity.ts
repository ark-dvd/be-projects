export default {
  name: 'activity',
  title: 'Activities',
  type: 'document',
  fields: [
    {
      name: 'type',
      title: 'Activity Type',
      type: 'string',
      options: {
        list: [
          // Lead activities
          { title: 'Lead Created (Auto)', value: 'lead_created_auto' },
          { title: 'Lead Created (Manual)', value: 'lead_created_manual' },
          { title: 'Status Changed', value: 'status_changed' },
          // Communication
          { title: 'Call Logged', value: 'call_logged' },
          { title: 'Email Sent', value: 'email_sent' },
          { title: 'Email Received', value: 'email_received' },
          { title: 'Note Added', value: 'note_added' },
          // Sales process
          { title: 'Site Visit Scheduled', value: 'site_visit_scheduled' },
          { title: 'Site Visit Completed', value: 'site_visit_completed' },
          { title: 'Quote Sent', value: 'quote_sent' },
          { title: 'Quote Accepted', value: 'quote_accepted' },
          { title: 'Quote Rejected', value: 'quote_rejected' },
          // Conversions
          { title: 'Converted to Client', value: 'converted_to_client' },
          { title: 'Deal Created', value: 'deal_created' },
          { title: 'Deal Completed', value: 'deal_completed' },
          // System
          { title: 'Auto-Reply Sent', value: 'auto_reply_sent' },
          { title: 'Notification Sent', value: 'notification_sent' },
          // Generic
          { title: 'Custom', value: 'custom' },
        ],
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      description: 'Details about this activity',
    },
    {
      name: 'timestamp',
      title: 'Timestamp',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (Rule: any) => Rule.required(),
    },

    // Polymorphic references - an activity can belong to any entity
    {
      name: 'lead',
      title: 'Related Lead',
      type: 'reference',
      to: [{ type: 'lead' }],
    },
    {
      name: 'client',
      title: 'Related Client',
      type: 'reference',
      to: [{ type: 'client' }],
    },
    {
      name: 'deal',
      title: 'Related Deal',
      type: 'reference',
      to: [{ type: 'deal' }],
    },

    // Metadata
    {
      name: 'performedBy',
      title: 'Performed By',
      type: 'string',
      description: '"system" for auto actions, admin name for manual actions',
      initialValue: 'system',
    },

    // Additional data for specific activity types
    {
      name: 'metadata',
      title: 'Additional Data',
      type: 'object',
      fields: [
        { name: 'oldStatus', title: 'Old Status', type: 'string' },
        { name: 'newStatus', title: 'New Status', type: 'string' },
        { name: 'callDuration', title: 'Call Duration (minutes)', type: 'number' },
        { name: 'quoteAmount', title: 'Quote Amount', type: 'number' },
      ],
    },
  ],
  preview: {
    select: {
      type: 'type',
      description: 'description',
      timestamp: 'timestamp',
      leadName: 'lead.fullName',
      clientName: 'client.fullName',
      dealTitle: 'deal.title',
    },
    prepare({ type, description, timestamp, leadName, clientName, dealTitle }: any) {
      const typeLabels: any = {
        lead_created_auto: '⚡ Lead Auto-Created',
        lead_created_manual: '✎ Lead Created',
        status_changed: '🔄 Status Changed',
        call_logged: '📞 Call',
        email_sent: '📧 Email Sent',
        email_received: '📬 Email Received',
        note_added: '📝 Note',
        site_visit_scheduled: '📅 Site Visit Scheduled',
        site_visit_completed: '✅ Site Visit Completed',
        quote_sent: '💰 Quote Sent',
        quote_accepted: '✅ Quote Accepted',
        quote_rejected: '❌ Quote Rejected',
        converted_to_client: '🎉 Converted to Client',
        deal_created: '🤝 Deal Created',
        deal_completed: '🏆 Deal Completed',
        auto_reply_sent: '🤖 Auto-Reply',
        notification_sent: '🔔 Notification',
        custom: '📌 Note',
      }

      const entity = leadName || clientName || dealTitle || ''
      const date = timestamp ? new Date(timestamp).toLocaleDateString() : ''

      return {
        title: typeLabels[type] || type,
        subtitle: `${entity} • ${date}${description ? ` • ${description.substring(0, 50)}...` : ''}`,
      }
    },
  },
  orderings: [
    {
      title: 'Newest First',
      name: 'timestampDesc',
      by: [{ field: 'timestamp', direction: 'desc' }],
    },
  ],
}
