export const ContextualHelpDataSchema = {
    type: 'array',
    items: {
        type: 'object',
        properties: {
            viewKey: { type: 'string' },
            links: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        label: { type: 'string' },
                        value: { type: 'string' }
                    },
                    required: ['label', 'value'],
                    additionalProperties: false
                }
            }
        },
        required: ['viewKey', 'links'],
        additionalProperties: false
    }
};
