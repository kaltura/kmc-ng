import { Component, Input, OnInit } from '@angular/core';
import { KalturaMediaEntry } from 'kaltura-ngx-client/api/types/KalturaMediaEntry';
import { EntryFlavoursWidget, ReplacementData } from '../../entry-flavours-widget.service';
import { KalturaEntryReplacementStatus } from 'kaltura-ngx-client/api/types/KalturaEntryReplacementStatus';
import { AppLocalization } from '@kaltura-ng/kaltura-common/localization/app-localization.service';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';
import { NewReplaceVideoUploadService } from 'app-shared/kmc-shell/new-replace-video-upload';

export enum FlavorsTabs {
    current = 'current',
    replacement = 'replacement'
}

@Component({
    selector: 'kFlavorReplaceMediaStatus',
    templateUrl: './replacement-status.component.html',
    styleUrls: ['./replacement-status.component.scss'],
    providers: [KalturaLogger.createLogger('ReplacementStatusComponent')]
})
export class ReplacementStatusComponent implements OnInit {
    @Input() entry: KalturaMediaEntry;
    @Input() currentEntryId: string;
    @Input() replacementData: ReplacementData;

    public _flavorsTabs = FlavorsTabs;
    public _currentTab = FlavorsTabs.current;

    public get _approveBtnDisabled(): boolean {
        return this.replacementData.status === KalturaEntryReplacementStatus.approvedButNotReady
            || this.replacementData.status === KalturaEntryReplacementStatus.failed;
    }

    public get _approveBtnLabel(): string {
        return this.replacementData.status === KalturaEntryReplacementStatus.approvedButNotReady
            ? this._appLocalization.get('applications.content.entryDetails.flavours.replaceVideo.autoReplacement')
            : this._appLocalization.get('applications.content.entryDetails.flavours.replaceVideo.approveReplacement');
    }

    constructor(private _widgetService: EntryFlavoursWidget,
                private _appLocalization: AppLocalization,
                private _logger: KalturaLogger,
                private _newReplaceVideoUpload: NewReplaceVideoUploadService) {
    }

    ngOnInit() {
        this._currentTab = this.entry.id === this.currentEntryId ? FlavorsTabs.current : FlavorsTabs.replacement;
    }

    public _cancelReplacement(): void {
        this._logger.info(`handle cancel replacement action by user`, { entryId: this.entry.id });
        this._widgetService.cancelReplacement();
        this._newReplaceVideoUpload.cancelUploadByEntryId(this.entry.id);
    }

    public _approveReplacement(): void {
        this._logger.info(`handle approve replacement action by user`, { entryId: this.entry.id });
        this._widgetService.approveReplacement();
    }

    public _selectFlavorsTab(tab: FlavorsTabs): void {
        this._logger.info(`handle change flavors tab action by user`, { tab, entryId: this.entry.id });
        const entryId = tab === FlavorsTabs.replacement ? this.replacementData.tempEntryId : this.entry.id;

        if (entryId) {
            this._currentTab = tab;
            this._widgetService.loadFlavorsByEntryId(entryId);
        } else {
            this._logger.warn('no entryId abort action');
        }
    }
}

