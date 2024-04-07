import {Component, OnInit, ViewChild} from '@angular/core';
import {SettingsMrMainViewService} from 'app-shared/kmc-shared/kmc-views';
import {ManagedTasksProfile, MrStoreService, Task} from '../mr-store/mr-store.service';
import {ActivatedRoute, Router} from '@angular/router';
import {AreaBlockerMessage} from '@kaltura-ng/kaltura-ui';
import {AppLocalization} from '@kaltura-ng/mc-shared';
import {BrowserService} from 'app-shared/kmc-shell';

import {KMCPermissions} from 'app-shared/kmc-shared/kmc-permissions';
import {subApplicationsConfig} from 'config/sub-applications';
import {Action, RuleActionsComponent} from './actions/actions.component';

@Component({
    selector: 'kMrRule',
    templateUrl: './rule.component.html',
    styleUrls: ['./rule.component.scss']
})
export class RuleComponent implements OnInit {
    @ViewChild('actionsComponent', { static: false }) actionsComponent: RuleActionsComponent;
    public rule: ManagedTasksProfile;
    public _ruleName: string = '';
    public _isBusy = false;
    public _blockerMessage: AreaBlockerMessage = null;
    public _isDirty = false;

    public _sections = ['general', 'criterrias', 'action', 'notifications'];
    public _selectedSection: string  = 'general';

    public _createdAtDateRange: string = subApplicationsConfig.shared.datesRange;
    public _calendarFormat = this._browserService.getCurrentDateFormat(true);

    public _timeUnitOptions: { value: string, label: string }[] = [
        {value: 'day', label: this._appLocalization.get('applications.settings.mr.schedule.daily')},
        {value: 'week', label: this._appLocalization.get('applications.settings.mr.schedule.weekly')},
        {value: 'month', label: this._appLocalization.get('applications.settings.mr.schedule.monthly')}
    ];
    public _everyDay: { value: number, label: string }[] = [];
    public _everyWeek: { value: number, label: string }[] = [];
    public _everyMonth: { value: number, label: string }[] = [];
    public _reviewPeriod: { value: number, label: string }[] = [];
    public _daysOfWeek: { value: string, label: string }[] = [{value: 'SUN', label: 'Sunday'}, {value: 'MON', label: 'Monday'}, {value: 'TUE', label: 'Tuesday'}, {value: 'WED', label: 'Wednesday'}, {value: 'THU', label: 'Thursday'}, {value: 'FRI', label: 'Friday'}, {value: 'SAT', label: 'Saturday'}];

    public ruleActions: Task[] = [];
    private actions: Action[] = [];

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
            for (let i = 1; i < 91; i++)
                this._reviewPeriod.push({value: i, label: i.toString()});
            for (let i = 1; i < 31; i++)
                this._everyDay.push({value: i, label: i.toString()});
            for (let i = 1; i < 51; i++) {
                this._everyWeek.push({value: i, label: i.toString()});
                this._everyMonth.push({value: i, label: i.toString()});
            }
            // load actions in the background without blocking UI
            this.loadActions(this._ruleRoute.snapshot.params.id);
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
        this.rule.nextRunDate = new Date(response.nextRunDate);
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

    private loadActions(ruleId: string): void {
        this.ruleActions = [];
        this._mrStore.loadTasks(ruleId).subscribe(
            (response) => {
                if (response.objects) {
                    this.ruleActions = response.objects;
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
                    // success. update rule actions if needed
                    if (this.actions.length) {
                        let multiRequest = [];
                        this.actions.forEach(ac => multiRequest.push({action: ac.requires, dto: ac.task}));
                        this._mrStore.saveActions(multiRequest).subscribe(
                            tasks => {
                                this.actions = this.actions.filter(ac => ac.requires !== 'delete');
                                this.actions.forEach(action => {
                                    if (action.requires === 'create') {
                                        action.requires = 'update';
                                        const updatedTask = this.findTaskByActionType(action.type, tasks.results);
                                        if (typeof updatedTask !== "undefined") {
                                            action.task = updatedTask;
                                        }
                                    }
                                });
                                this.actionsComponent.resetActionsOnSave();
                                this.handleSuccessResponse(response);
                                this._isDirty = false;
                            },
                            error => {
                                this.actionsComponent.resetActionsOnSave();
                                this.displayError(error.message ? error.message : this._appLocalization.get('applications.settings.mr.saveError'));
                                this._isDirty = false;
                            }
                        );
                    } else {
                        this.handleSuccessResponse(response);
                        this._isDirty = false;
                    }
                }
            },
            error => {
                this.displayError(this._appLocalization.get('applications.settings.mr.saveError'));
            }
        )
    }

    private findTaskByActionType(actionType: Action['type'], tasks: (Task | null)[]): Task | undefined {
        switch (actionType) {
            case 'delete':
                return tasks.find(task => task?.type === 'deleteEntry');
                break;
            case 'flavours':
                return tasks.find(task => task?.taskParams?.deleteFlavorsTaskParams?.flavorParamsIds?.length > 0);
                break;
            case 'addTags':
                return tasks.find(task => task?.taskParams?.modifyEntryTaskParams?.addTags?.length > 0);
                break;
            case 'removeTags':
                return tasks.find(task => task?.taskParams?.modifyEntryTaskParams?.removeTags?.length > 0);
                break;
            case 'addCategory':
                return tasks.find(task => task?.taskParams?.modifyEntryTaskParams?.addToCategoryIds?.length > 0);
                break;
            case 'removeCategory':
                return tasks.find(task => task?.taskParams?.modifyEntryTaskParams?.removeFromCategoryIds?.length > 0);
                break;
            case 'owner':
                return tasks.find(task => task?.taskParams?.modifyEntryTaskParams?.kalturaEntry?.userId?.length > 0);
                break;
            case 'notificationProfileScan':
                return tasks.find(task => task?.taskParams?.sendNotificationTaskParams?.notificationType === 'profileScan');
                break;
            case 'notificationHeadsUp':
                return tasks.find(task => task?.taskParams?.sendNotificationTaskParams?.notificationType === 'headsUp');
                break;
            case 'notificationExecutionSummary':
                return tasks.find(task => task?.taskParams?.sendNotificationTaskParams?.notificationType === 'executionSummary');
                break;
        }
        return undefined;
    }

    public get _enableSaveBtn(): boolean {
        return  this._isDirty && this.rule.name.length > 0;
    }

    public onCriteriaChange(filter: any): void {
        this.rule.objectFilter = filter;
        this._isDirty = true;
    }

    public onActionChange(actions: Action[]): void {
        this.actions = actions;
        // console.log(this.actions);
        this._isDirty = true;
    }

    public ownerSelected(owner: string): void {
        this.rule.ownerId = owner;
        this._isDirty = true;
    }

    public onTimeUnitChange(): void {
        this._isDirty = true;
        // set default values when changing date unit
        switch (this.rule.runningCadence.advancedCadence.dateUnit) {
            case 'day':
                this.rule.runningCadence.advancedCadence.numberOfUnits = 1
                break;
            case 'week':
                this.rule.runningCadence.advancedCadence.numberOfUnits = 1;
                this.rule.runningCadence.advancedCadence.day = 'SUN';
                break;
            case 'month':
                this.rule.runningCadence.advancedCadence.numberOfUnits = 1;
                this.rule.runningCadence.advancedCadence.dayNumber = 1
                break;
        }
    }

    public save(): void {
        // check for missing criteria in enabled rule
        if (this.rule.status === 'enabled' && Object.keys(this.rule.objectFilter).length === 0) {
            this._browserService.confirm(
                {
                    header: this._appLocalization.get('applications.settings.mr.noCriteriaHeader'),
                    message: this._appLocalization.get('applications.settings.mr.noCriteriaMsg'),
                    accept: () => {
                        this.rule.status = 'disabled';
                        this.doSave();
                    }
                }
            );
        } else {
            this.doSave();
        }
    }

    private doSave(): void {
        delete this.rule.partnerId; // remove partner as it is read only and cannot be saved
        // fix advancedCadence
        if (this.rule.runningCadence.advancedCadence.dateUnit === 'day') {
            delete this.rule.runningCadence.advancedCadence.day;
            delete this.rule.runningCadence.advancedCadence.dayNumber;
        }
        if (this.rule.runningCadence.advancedCadence.dateUnit === 'week') {
            delete this.rule.runningCadence.advancedCadence.dayNumber;
        }
        if (this.rule.runningCadence.advancedCadence.dateUnit === 'month') {
            delete this.rule.runningCadence.advancedCadence.day;
        }
        // remove empty objectsFilter
        if (Object.keys(this.rule.objectFilter).length === 0) {
            this.rule.objectFilter = {};
            this.rule.objectFilterType = '';
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

