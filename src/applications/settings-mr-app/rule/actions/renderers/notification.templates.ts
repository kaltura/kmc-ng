export const notificationTemplates = {
    subject: {
        profileScan: 'Entries added to your review queue',
        headsUp: 'Review period is about to end',
        executionSummary: 'Actions performed on queued entries'
    },
    body: {
        profileScan: `Hi {user.firstName}

On {scanDate}, {profileName} rule was run and new entries were added to your review queue.

The following actions will be performed on {plannedExecutionDate}:

{Action names}

{action..

Please be sure to review your queue prior to {plannedExecutionDate}.



Thank you,

The Kaltura team



This is a system generated message. Please do not reply to this email.`,
        headsUp: `Hi {user.firstName}

On {scanDate}, {profileName} rule was run, and new entries were added to your review queue. The review period is about to end, please be sure to review the entry queue prior to {plannedExecutionDate}.

For more information about the entries, please check out this report.

The following actions will be performed on {plannedExecutionDate}:

{Action names}

{action..

Thank you,

The Kaltura team



This is a system generated message. Please do not reply to this email.`,
        executionSummary: `Hi {user.firstName}

Following a review period of {profileName} rule, on {actualExecutionDate} the following actions were performed:

{Action names}

{action..



Thank you,

The Kaltura team

This is a system generated message. Please do not reply to this email.`
    }
}
