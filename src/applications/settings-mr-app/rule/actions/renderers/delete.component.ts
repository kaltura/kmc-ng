import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Action} from '../actions.component';
import {KMCPermissions, KMCPermissionsService} from 'app-shared/kmc-shared/kmc-permissions';

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
    };
    @Input() profileId: string;
    @Output() onActionChange = new EventEmitter<Action>();

    public recycleAvailable = this._permissionsService.hasPermission(KMCPermissions.FEATURE_RECYCLE_BIN);
    public recycle = false;
    private action: Action;

    constructor(private _permissionsService: KMCPermissionsService) {
    }

    ngOnInit(): void {
        setTimeout(() => {
            if (this.action.requires === 'create') {
                this.validate();
            }
        }, 100);
    }

    public validate(): void {
        if (this.action.requires === 'create') {
            // new action - create task
            this.action.task = {
                managedTasksProfileId: this.profileId,
                type: 'deleteEntry',
                status: 'enabled',
                taskParams: {
                    deleteEntryTaskParams: {
                        recycleBin: this.recycleAvailable ? this.recycle : false
                    }
                }
            }
        } else {
            // existing task
            this.action.task.taskParams.deleteEntryTaskParams.recycleBin = this.recycleAvailable ? this.recycle : false;
        }
        this.onActionChange.emit(this.action);
    }

    public delete(): void {
        this.action.requires = 'delete';
        this.onActionChange.emit(this.action);
    }

}
