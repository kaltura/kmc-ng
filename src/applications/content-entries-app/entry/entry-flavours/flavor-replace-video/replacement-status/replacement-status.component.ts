import { Component, Input, OnInit } from '@angular/core';
import { KalturaMediaEntry } from 'kaltura-ngx-client/api/types/KalturaMediaEntry';
import { EntryFlavoursWidget } from '../../entry-flavours-widget.service';
import { KalturaEntryReplacementStatus } from 'kaltura-ngx-client/api/types/KalturaEntryReplacementStatus';
import { AppLocalization } from '@kaltura-ng/kaltura-common/localization/app-localization.service';

@Component({
    selector: 'kFlavorReplaceMediaStatus',
    templateUrl: './replacement-status.component.html',
    styleUrls: ['./replacement-status.component.scss']
})
export class ReplacementStatusComponent implements OnInit {
    @Input() entry: KalturaMediaEntry;

    public _approveBtnDisabled: boolean;
    public _approveBtnLabel: string;

    constructor(private _widgetService: EntryFlavoursWidget,
                private _appLocalization: AppLocalization) {
    }

    ngOnInit() {
        this._approveBtnDisabled = this.entry.replacementStatus === KalturaEntryReplacementStatus.approvedButNotReady
            || this.entry.replacementStatus === KalturaEntryReplacementStatus.failed;

        this._approveBtnLabel = this.entry.replacementStatus === KalturaEntryReplacementStatus.approvedButNotReady
            ? this._appLocalization.get('applications.content.entryDetails.flavours.replaceVideo.autoReplacement')
            : this._appLocalization.get('applications.content.entryDetails.flavours.replaceVideo.approveReplacement');
    }

    public _cancelReplacement(): void {
        this._widgetService.cancelReplacement();
    }

    public _approveReplacement(): void {
        this._widgetService.approveReplacement();
    }
}

