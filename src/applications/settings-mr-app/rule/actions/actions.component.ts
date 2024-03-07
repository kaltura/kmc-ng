import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {KalturaLogger, LogLevels} from '@kaltura-ng/kaltura-logger';
import {MenuItem} from 'primeng/api';
import {AppLocalization} from '@kaltura-ng/mc-shared';
import {BrowserService} from 'app-shared/kmc-shell';
import {Task} from '../../mr-store/mr-store.service';

export type Action = {
    type: 'flavours' | 'addCategory' | 'removeCategory' | 'addTags' | 'removeTags' | 'owner' | 'delete' | 'notification' | '';
    requires: 'add' | 'delete' | 'update' | 'none';
    task: Task | null;
    isNotification: boolean;
}
@Component({
    selector: 'kRuleActions',
    templateUrl: './actions.component.html',
    styleUrls: ['./actions.component.scss'],
    providers: [
        KalturaLogger.createLogger('RuleActionsComponent')
    ]
})
export class RuleActionsComponent implements OnInit {

    @Input() profileId: string;
    @Input() set ruleActions(value: Task[]) {
        this.actions = [];
        value.forEach(task => {
            this.actions.push({
                type: this.getActionType(task),
                requires: 'update',
                task,
                isNotification: typeof task.taskParams?.sendNotificationTaskParams !== "undefined"
            })
        })
    };
    @Input() selectedTab: string;
    @Output() onActionsChange = new EventEmitter<Action[]>();

    public items: MenuItem[];
    public actions: Action[] = [];
    public actionsOnSave: Action[] = [];

    constructor(private _appLocalization: AppLocalization) {
    }

    ngOnInit() {
        // this.loadActions();
    }

    public buildMenu(): void {
        this.items = [
            {
                label: this._appLocalization.get('applications.settings.mr.actions.flavours'),
                disabled: this.actions.filter(action => action.type === 'flavours').length > 0,
                command: () => {
                    this.addAction('flavours');
                }
            },
            {
                label: this._appLocalization.get('applications.settings.mr.actions.categories'),
                items: [
                    {
                        label: this._appLocalization.get('applications.settings.mr.actions.addCat'),
                        disabled: this.actions.filter(action => action.type === 'addCategory').length > 0,
                        command: () => {
                            this.addAction('addCategory');
                        }
                    },
                    {
                        label: this._appLocalization.get('applications.settings.mr.actions.removeCat'),
                        disabled: this.actions.filter(action => action.type === 'removeCategory').length > 0,
                        command: () => {
                            this.addAction('removeCategory');
                        }
                    }
                ]
            },
            {
                label: this._appLocalization.get('applications.settings.mr.actions.tags'),
                items: [
                    {
                        label: this._appLocalization.get('applications.settings.mr.actions.addTags'),
                        disabled: this.actions.filter(action => action.type === 'addTags').length > 0,
                        command: () => {
                            this.addAction('addTags');
                        }
                    },
                    {
                        label: this._appLocalization.get('applications.settings.mr.actions.removeTags'),
                        disabled: this.actions.filter(action => action.type === 'removeTags').length > 0,
                        command: () => {
                            this.addAction('removeTags');
                        }
                    }
                ]
            },
            {
                label: this._appLocalization.get('applications.settings.mr.actions.owner'),
                disabled: this.actions.filter(action => action.type === 'owner').length > 0,
                command: () => {
                    this.addAction('owner');
                }
            },
            {
                label: this._appLocalization.get('applications.settings.mr.actions.delete'),
                disabled: this.actions.filter(action => action.type === 'delete').length > 0,
                command: () => {
                    this.addAction('delete');
                }
            }
        ];
    }

    private getActionType(task: Task): Action['type'] {
        let type: Action['type'] = '';
        // 'flavours' | 'addCategory' | 'removeCategory' | 'addTags' | 'removeTags' | 'owner' | 'delete'
        if (task.taskParams?.deleteFlavorsTaskParams?.flavorParamsIds) {
            type = 'flavours';
        }
        return type;
    }

    private addAction(type: Action['type']): void {
        this.actions.push({
            type,
            requires: 'add',
            task: null,
            isNotification: type !== 'notification'
        })
    }

    public onActionChange(action: Action): void {
        const index = this.actionsOnSave.findIndex(ac => ac.type === action.type && ac.requires === action.requires);
        if (action.requires === 'delete') {
            this.actions = this.actions.filter(ac => ac.type !== action['type']);
            if (action.task?.id) {
                // existing task, need API call to delete
                this.actionsOnSave.push(action);
            } else {
                // remove the 'add' action from actionsOnSave
                if (index > -1) {
                    this.actionsOnSave.splice(index, 1);
                }
            }
        }
        if (action.requires === 'add' || action.requires === 'update') {
            // check if we have this action in the actionsOnSave array. Add if not found, update if found
            if (index > -1) {
                Object.assign(this.actionsOnSave[index], action);
            } else {
                this.actionsOnSave.push(action);
            }
        }
        this.onActionsChange.emit(this.actionsOnSave);
        console.log("actionsOnSave", this.actionsOnSave);
    }

}
