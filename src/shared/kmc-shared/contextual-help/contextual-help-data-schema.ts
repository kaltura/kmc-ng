export const ContextualHelpDataSchema = {
    type: 'array',
    items: [{
        viewKey: { type: 'string' },
        links: {
            type: 'array',
            items: [{
                type: 'object',
                properties: {
                    label: { type: 'string' },
                    value: { type: 'string' }
                },
                required: ['label', 'value'],
                additionalProperties: false
            }]
        }
    }]
};
