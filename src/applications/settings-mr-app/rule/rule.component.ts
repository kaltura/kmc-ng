import {Component, OnDestroy, OnInit} from '@angular/core';
import {SettingsMrMainViewService} from 'app-shared/kmc-shared/kmc-views';
import {ManagedTasksProfile, MrStoreService} from '../mr-store/mr-store.service';
import {cancelOnDestroy} from '@kaltura-ng/kaltura-common';
import {filter} from 'rxjs/operators';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {AreaBlockerMessage} from '@kaltura-ng/kaltura-ui';
import {AppLocalization} from '@kaltura-ng/mc-shared';
import {KMCPermissions} from 'app-shared/kmc-shared/kmc-permissions';
import {BrowserService} from 'app-shared/kmc-shell';

@Component({
    selector: 'kMrRule',
    templateUrl: './rule.component.html',
    styleUrls: ['./rule.component.scss']
})
export class RuleComponent implements OnInit {
    public rule: ManagedTasksProfile;
    public _ruleName: string = '';
    public _isBusy = false;
    public _blockerMessage: AreaBlockerMessage = null;
    public _isDirty = false;

    public _sections = ['general', 'actions', 'settings'];
    public _selectedSection: string  = 'general';

    constructor(private _mrMainViewService: SettingsMrMainViewService,
                private _router: Router,
                private _browserService: BrowserService,
                private _appLocalization: AppLocalization,
                private _ruleRoute: ActivatedRoute,
                private _mrStore: MrStoreService) {
    }

    ngOnInit() {
        if (this._mrMainViewService.viewEntered()) {
            if (this._mrStore.selectedRule) {
                this.rule = this._mrStore.selectedRule;
                this._ruleName = this._mrStore.selectedRule.name;
                this.rule.createdAt = new Date(this._mrStore.selectedRule.createdAt);
                this.rule.updatedAt = new Date(this._mrStore.selectedRule.updatedAt);
            } else {
                this.loadRule(this._ruleRoute.snapshot.params.id);
            }
        }
    }
    private displayError(message: string): void {
        this._isBusy = false;
        this._blockerMessage = new AreaBlockerMessage({
            message,
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

    private loadRule(ruleId: string): void {
        this._blockerMessage = null;
        this._isBusy = true;
        this._mrStore.loadProfile(ruleId).subscribe(
            (response) => {
                if (response && response.objectType && response.objectType === "KalturaAPIException") {
                    // error returned from the server in the response
                    this.displayError(response.message ? response.message : this._appLocalization.get('applications.settings.mr.loadError'));
                } else {
                    // success
                    this.rule = response;
                    this.rule.createdAt = new Date(response.createdAt);
                    this.rule.updatedAt = new Date(response.updatedAt);
                    this._ruleName = response.name;
                    this._isBusy = false;
                }
            },
            error => {
                this.displayError(this._appLocalization.get('applications.settings.mr.loadError'));
            }
        )
    }

    private updateRule(): void {
        this._blockerMessage = null;
        this._isBusy = true;
        this._mrStore.updateProfile(this.rule).subscribe(
            (response) => {
                if (response && response.objectType && response.objectType === "KalturaAPIException") {
                    // error returned from the server in the response
                    this.displayError(response.message ? response.message : this._appLocalization.get('applications.settings.mr.saveError'));
                } else {
                    // success
                    this.rule = response;
                    this.rule.createdAt = new Date(response.createdAt);
                    this.rule.updatedAt = new Date(response.updatedAt);
                    this._ruleName = response.name;
                    this._isBusy = false;
                    this._isDirty = false;
                }
            },
            error => {
                this.displayError(this._appLocalization.get('applications.settings.mr.saveError'));
            }
        )
    }

    public get _enableSaveBtn(): boolean {
        return  this._isDirty && this.rule.name.length > 0;
    }

    public save(): void {
        delete this.rule["partnerId"];
        this.rule.runningCadence.advancedCadence = {};
        this.updateRule();
    }

    public sectionSelected(section: string): void {
        this._selectedSection = section;
        this._browserService.scrollToTop(0);
    }
    public _backToList(): void {
        this._router.navigateByUrl('settings/mr/rules');
    }
}

