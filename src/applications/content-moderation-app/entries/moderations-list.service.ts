import { Injectable } from '@angular/core';

import { BrowserService } from 'app-shared/kmc-shell/providers/browser.service';
import { ContentModerationMainViewService } from 'app-shared/kmc-shared/kmc-views';

@Injectable()
export class ModerationsListService {

    private _isViewAvailable: boolean;
    public get isViewAvailable(): boolean {
        return this._isViewAvailable;
    }

    constructor(contentModerationMainView: ContentModerationMainViewService,
                browserService: BrowserService) {
        if (contentModerationMainView.isAvailable()) {
            this._isViewAvailable = true;
        } else {
            browserService.handleUnpermittedAction(true);
        }
    }
}
