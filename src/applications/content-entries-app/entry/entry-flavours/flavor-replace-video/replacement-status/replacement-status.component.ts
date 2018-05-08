import { Component, Input, OnInit } from '@angular/core';
import { KalturaMediaEntry } from 'kaltura-ngx-client/api/types/KalturaMediaEntry';
import { EntryFlavoursWidget } from '../../entry-flavours-widget.service';
import { KalturaEntryReplacementStatus } from 'kaltura-ngx-client/api/types/KalturaEntryReplacementStatus';
import { AppLocalization } from '@kaltura-ng/kaltura-common/localization/app-localization.service';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';

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

    public _approveBtnDisabled: boolean;
    public _approveBtnLabel: string;
    public _flavorsTabs = FlavorsTabs;
    public _currentTab = FlavorsTabs.current;

    constructor(private _widgetService: EntryFlavoursWidget,
                private _appLocalization: AppLocalization,
                private _logger: KalturaLogger) {
    }

    ngOnInit() {
        this._approveBtnDisabled = this.entry.replacementStatus === KalturaEntryReplacementStatus.approvedButNotReady
            || this.entry.replacementStatus === KalturaEntryReplacementStatus.failed;

        this._approveBtnLabel = this.entry.replacementStatus === KalturaEntryReplacementStatus.approvedButNotReady
            ? this._appLocalization.get('applications.content.entryDetails.flavours.replaceVideo.autoReplacement')
            : this._appLocalization.get('applications.content.entryDetails.flavours.replaceVideo.approveReplacement');

        this._currentTab = this.entry.id === this.currentEntryId ? FlavorsTabs.current : FlavorsTabs.replacement;
    }

    public _cancelReplacement(): void {
        this._logger.info(`handle cancel replacement action by user`, { entryId: this.entry.id });
        this._widgetService.cancelReplacement();
    }

    public _approveReplacement(): void {
        this._logger.info(`handle approve replacement action by user`, { entryId: this.entry.id });
        this._widgetService.approveReplacement();
    }

    public _selectFlavorsTab(tab: FlavorsTabs): void {
        this._logger.info(`handle change flavors tab action by user`, { tab, entryId: this.entry.id });
        const entryId = tab === FlavorsTabs.replacement ? this.entry.replacingEntryId : this.entry.id;

        if (entryId) {
            this._currentTab = tab;
            this._widgetService.loadFlavorsByEntryId(entryId);
        } else {
            this._logger.warn('no entryId abort action');
        }
    }
}

