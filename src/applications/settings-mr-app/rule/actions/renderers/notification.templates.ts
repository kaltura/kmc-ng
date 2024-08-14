export const notificationTemplates = {
    subject: {
        profileScan: 'Entries added to your review queue',
        headsUp: 'Review period is about to end',
        executionSummary: 'Actions performed on queued entries'
    },
    body: {
        profileScan: 'Hi {user.firstName}<br><br>On {scanDate}, {profileName} rule was run and new entries were added to your review queue.<br><br>Please be sure to review your queue prior to {plannedExecutionDate}. For more information, a report is available for download in the Kaltura Management Console.<br><br><br>Thank you,<br><br>The Kaltura team<br><br><br><br>This is a system generated message. Please do not reply to this email.',
        headsUp: 'Hi {user.firstName}<br><br>On {scanDate}, {profileName} rule was run, and new entries were added to your review queue. The review period is about to end, please be sure to review the entry queue prior to {plannedExecutionDate}.<br><br><br>Thank you,<br><br>The Kaltura team<br><br><br><br>This is a system generated message. Please do not reply to this email.',
        executionSummary: 'Hi {user.firstName}<br><br>Following a review period of {profileName} rule, on {actualExecutionDate} actions were performed on entries in your account. For more information, a report is available for download in the Kaltura Management Console.<br><br><br>Thank you,<br><br>The Kaltura team<br><br><br><br>This is a system generated message. Please do not reply to this email.'
    }
}
