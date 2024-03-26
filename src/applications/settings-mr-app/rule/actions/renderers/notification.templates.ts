export const notificationTemplates = {
    subject: {
        profileScan: 'Entries added to your review queue',
        headsUp: 'Review period is about to end',
        executionSummary: 'Actions performed on queued entries'
    },
    body: {
        profileScan: `Hi {user.firstName}

On {scanDate}, {profileName} rule was run and new entries were added to your review queue.

Please be sure to review your queue prior to {plannedExecutionDate}. For more information, a report is available for download in the Kaltura Management Console.


Thank you,

The Kaltura team



This is a system generated message. Please do not reply to this email.`,
        headsUp: `Hi {user.firstName}

On {scanDate}, {profileName} rule was run, and new entries were added to your review queue. The review period is about to end, please be sure to review the entry queue prior to {plannedExecutionDate}.

Thank you,

The Kaltura team



This is a system generated message. Please do not reply to this email.`,
        executionSummary: `Hi {user.firstName}

Following a review period of {profileName} rule, on {actualExecutionDate} actions were performed on entries in your account. For more information, a report is available for download in the Kaltura Management Console.


Thank you,

The Kaltura team

This is a system generated message. Please do not reply to this email.`
    }
}
