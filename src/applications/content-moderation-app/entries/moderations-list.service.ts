import {BrowserService} from 'app-shared/kmc-shell/providers/browser.service';
import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Observable';
import {ISubscription} from 'rxjs/Subscription';
import 'rxjs/add/operator/map';
import { ContentEntriesMainViewService, ContentModerationMainViewService } from 'app-shared/kmc-shared/kmc-views';

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
