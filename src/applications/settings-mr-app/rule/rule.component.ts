import {Component, OnDestroy, OnInit} from '@angular/core';
import {SettingsMrMainViewService} from 'app-shared/kmc-shared/kmc-views';
import {ManagedTasksProfile, MrStoreService} from '../mr-store/mr-store.service';
import {cancelOnDestroy} from '@kaltura-ng/kaltura-common';
import {filter} from 'rxjs/operators';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {AreaBlockerMessage} from '@kaltura-ng/kaltura-ui';
import {AppLocalization} from '@kaltura-ng/mc-shared';

@Component({
    selector: 'kMrRule',
    templateUrl: './rule.component.html',
    styleUrls: ['./rule.component.scss']
})
export class RuleComponent implements OnInit, OnDestroy {
    public rule: ManagedTasksProfile;
    public _isBusy = false;
    public _blockerMessage: AreaBlockerMessage = null;

    constructor(private _mrMainViewService: SettingsMrMainViewService,
                private _router: Router,
                private _appLocalization: AppLocalization,
                private _ruleRoute: ActivatedRoute,
                private _mrStore: MrStoreService) {
    }

    ngOnInit() {
        if (this._mrMainViewService.viewEntered()) {
            if (this._mrStore.selectedRule) {
                this.rule = this._mrStore.selectedRule;
            } else {
                this.loadRule(this._ruleRoute.snapshot.params.id);
            }
        }
    }

    private loadRule(ruleId: string): void {
        this._blockerMessage = null;
        this._isBusy = true;
        const displayError = (error: string) => {
            this._isBusy = false;
            this._blockerMessage = new AreaBlockerMessage({
                message: error?.length ? error : this._appLocalization.get('applications.settings.mr.loadError'),
                buttons: [
                    {
                        label: this._appLocalization.get('app.common.close'),
                        action: () => {
                            this._blockerMessage = null;
                        }
                    }
                ]
            });
        }
        this._mrStore.loadProfile(ruleId).subscribe(
            (response) => {
                if (response && response.objectType && response.objectType === "KalturaAPIException") {
                    // error returned from the server in the response
                    displayError(response.message ? response.message : '');
                } else {
                    // success
                    this.rule = response;
                }
            },
            error => {
                displayError('');
            }
        )
    }

    ngOnDestroy(): void {}
}

