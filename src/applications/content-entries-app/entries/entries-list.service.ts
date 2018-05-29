import { Injectable } from '@angular/core';

import { BrowserService } from 'app-shared/kmc-shell/providers/browser.service';
import { ContentEntriesMainViewService } from 'app-shared/kmc-shared/kmc-views';

@Injectable()
export class EntriesListService {

    private _isViewAvailable: boolean;
    public get isViewAvailable(): boolean {
        return this._isViewAvailable;
    }

    constructor(contentEntriesMainView: ContentEntriesMainViewService,
                browserService: BrowserService) {
        if (contentEntriesMainView.isAvailable()) {
            this._isViewAvailable = true;
        } else {
            browserService.handleUnpermittedAction(true);
        }
    }
}
