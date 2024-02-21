import {Component, OnInit} from '@angular/core';
import {SettingsMrMainViewService} from 'app-shared/kmc-shared/kmc-views';
import {ManagedTasksProfile, MrStoreService} from '../mr-store/mr-store.service';
import {ActivatedRoute, Router} from '@angular/router';
import {AreaBlockerMessage} from '@kaltura-ng/kaltura-ui';
import {AppLocalization} from '@kaltura-ng/mc-shared';
import {BrowserService} from 'app-shared/kmc-shell';
import {KalturaMediaEntryFilter} from 'kaltura-ngx-client';

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
    public _selectedSection: string  = 'actions';

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
                this.handleSuccessResponse(this._mrStore.selectedRule);
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

    private handleSuccessResponse(response :ManagedTasksProfile): void {
        this.rule = response;
        this.rule.createdAt = new Date(response.createdAt);
        this.rule.updatedAt = new Date(response.updatedAt);
        this._ruleName = response.name;
        if (typeof response.objectFilter === "undefined") {
            this.rule.objectFilter = {};
            this.rule.objectFilterType = "KalturaMediaEntryFilter";
        }
        this._isBusy = false;
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
                    this.handleSuccessResponse(response)
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
                    this.handleSuccessResponse(response);
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

    public onCriteriaChange(filter: any): void {
        this.rule.objectFilter = filter;
        this._isDirty = true;
        console.log(filter);
    }

    public save(): void {
        delete this.rule.partnerId; // remove partner as it is read only and cannot be saved
        this.rule.runningCadence.advancedCadence = {};
        // remove empty objectsFilter
        if (Object.keys(this.rule.objectFilter).length === 0) {
            delete this.rule.objectFilter;
            delete this.rule.objectFilterType;
        }
        this.updateRule();
    }

    public sectionSelected(section: string): void {
        this._selectedSection = section;
        this._browserService.scrollToTop(0);
    }
    public _backToList(): void {
        if (this._isDirty) {
            this._browserService.confirm(
                {
                    header: this._appLocalization.get('applications.content.entryDetails.captions.cancelEdit'),
                    message: this._appLocalization.get('applications.content.entryDetails.captions.discard'),
                    accept: () => {
                        this._router.navigateByUrl('settings/mr/rules');
                    }
                }
            );
        } else {
            this._router.navigateByUrl('settings/mr/rules');
        }
    }
}

