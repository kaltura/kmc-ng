import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {KalturaLogger, LogLevels} from '@kaltura-ng/kaltura-logger';
import {MenuItem} from 'primeng/api';
import {AppLocalization} from '@kaltura-ng/mc-shared';
import {BrowserService} from 'app-shared/kmc-shell';

export type Action = {
    type: 'flavours' | 'addCategory' | 'removeCategory' | 'addTags' | 'removeTags' | 'owner' | 'unpublish' | 'delete';
    requires: 'add' | 'delete' | 'update' | 'none';
    action: any;
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
    @Input() selectedTab: string;
    @Output() onActionsChange = new EventEmitter<any>();

    public items: MenuItem[];
    public actions: Action[] = [];

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
                label: this._appLocalization.get('applications.settings.mr.actions.unpublish'),
                disabled: this.actions.filter(action => action.type === 'unpublish').length > 0,
                command: () => {
                    this.addAction('unpublish');
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

    private addAction(type: string): void {
        console.log("Add action: " + type);
    }

}
