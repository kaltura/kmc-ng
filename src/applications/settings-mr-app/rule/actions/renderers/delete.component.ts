import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Action} from '../actions.component';
import {KMCPermissions, KMCPermissionsService} from 'app-shared/kmc-shared/kmc-permissions';
import {AppLocalization} from '@kaltura-ng/mc-shared';
import {AppAnalytics, ButtonType} from 'app-shared/kmc-shell';

@Component({
    selector: 'kActionDelete',
    styleUrls: ['./renderers.scss'],
    template: `
        <div class="action">
            <div class="kRow">
                <span class="kLabel">{{'applications.settings.mr.actions.value' | translate}}</span>
                <span class="kLabelWithHelpTip">{{'applications.settings.mr.actions.delete' | translate}}</span>
                <kInputHelper>
                    <span>{{'applications.settings.mr.actions.delete_tt' | translate}}</span>
                </kInputHelper>
            </div>
            <div class="kRow">
                <span class="kLabelWithHelpTip">{{'applications.settings.mr.actions.linked' | translate}}</span>
                <kInputHelper>
                    <span>{{this.isLiveRule? ('applications.settings.mr.actions.linked_live_tt' | translate) : ('applications.settings.mr.actions.linked_tt' | translate)}}</span>
                </kInputHelper>
                <p-dropdown [options]="_deleteOptions" [style]="isLiveRule ? {'width':'330px', 'margin-left': '91px'} : {'width':'210px', 'margin-left': '91px'}" [(ngModel)]="_deleteOption" (ngModelChange)="validate()"></p-dropdown>
            </div>
            <div class="kRow">
                <span class="kLabel"></span>
                <p-checkbox *ngIf="recycleAvailable" [(ngModel)]="recycle" (ngModelChange)="validate()"
                            label="{{'applications.settings.mr.actions.recycle' | translate}}"
                            binary="true"></p-checkbox>
            </div>

            <span class="kDelete" (click)="delete()">{{'applications.content.table.delete'| translate}}</span>
        </div>
    `
})
export class ActionDeleteComponent implements OnInit{
    @Input() set ruleAction(value: Action){
        this.action = value;
        this.recycle = this.action?.task?.taskParams?.deleteEntryTaskParams?.recycleBin === true ? true : false;
        this._deleteOption = this.action?.task?.taskParams?.deleteEntryTaskParams?.dualScreenOptions?.behavior || 'applyAction';
    };
    @Input() profileId: string;
    @Input() isLiveRule: boolean;
    @Output() onActionChange = new EventEmitter<Action>();

    public _deleteOptions: { value: string, label: string }[] = [
        {value: 'applyAction', label: this._appLocalization.get('applications.settings.mr.actions.applyAction')},
        {value: 'expose', label: this._appLocalization.get('applications.settings.mr.actions.expose')}
    ];
    public _deleteOption = 'applyAction';

    public recycleAvailable = this._permissionsService.hasPermission(KMCPermissions.FEATURE_RECYCLE_BIN);
    public recycle = false;
    private action: Action;

    constructor(private _appLocalization: AppLocalization,
                private _analytics: AppAnalytics,
                private _permissionsService: KMCPermissionsService) {
    }

    ngOnInit(): void {
        setTimeout(() => {
            if (this.action.requires === 'create') {
                this.validate(false);
            }
        }, 100);
        if (this.isLiveRule) {
            this._deleteOptions = [
                {value: 'applyAction', label: this._appLocalization.get('applications.settings.mr.actions.applyActionLive')},
                {value: 'expose', label: this._appLocalization.get('applications.settings.mr.actions.exposeLive')}
            ];
        }
    }

    public validate(sendAnalytics = true): void {
        if (this.action.requires === 'create') {
            // new action - create task
            this.action.task = {
                managedTasksProfileId: this.profileId,
                type: 'deleteEntry',
                status: 'enabled',
                taskParams: {
                    deleteEntryTaskParams: {
                        recycleBin: this.recycleAvailable ? this.recycle : false,
                        dualScreenOptions: {
                            behavior: this._deleteOption as 'applyAction' | 'expose'
                        }
                    }
                }
            }
        } else {
            // existing task
            this.action.task.taskParams.deleteEntryTaskParams.recycleBin = this.recycleAvailable ? this.recycle : false;
            this.action.task.taskParams.deleteEntryTaskParams.dualScreenOptions.behavior = this._deleteOption as 'applyAction' | 'expose';
        }
        if (sendAnalytics) {
            this._analytics.trackButtonClickEvent(ButtonType.Choose, 'AM_actions_delete_linked_entries', this._deleteOption === 'expose' ? this.isLiveRule ? 'AM_delete_live_only' : 'stand_alone' : this.isLiveRule ? 'AM_delete_live_and_recording' : 'secondary', 'Automation_manager');
        }
        this.onActionChange.emit(this.action);
    }

    public delete(): void {
        this.action.requires = 'delete';
        this.onActionChange.emit(this.action);
    }

}
