import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import {Action} from '../actions.component';
import {
    FlavorParamsListAction,
    KalturaClient,
    KalturaDetachedResponseProfile,
    KalturaFilterPager,
    KalturaResponseProfileType
} from 'kaltura-ngx-client';
import {cancelOnDestroy} from '@kaltura-ng/kaltura-common';
import {AreaBlockerMessage} from '@kaltura-ng/kaltura-ui';
import {AppAnalytics, ButtonType} from 'app-shared/kmc-shell';
import {MrStoreService} from '../../../mr-store/mr-store.service';

@Component({
    selector: 'kActionAgent',
    styleUrls: ['./renderers.scss'],
    template: `
        <k-area-blocker [showLoader]="_isBusy" [message]="_blockerMessage">
            <div class="action">
                <div class="kRow">
                    <span class="kLabel">{{'applications.settings.mr.actions.value' | translate}}</span>
                    <span class="kLabelWithHelpTip">{{'applications.settings.mr.actions.agent' | translate}}</span>
                    <kInputHelper>
                        <span>{{'applications.settings.mr.actions.agent_tt' | translate}}</span>
                    </kInputHelper>
                </div>
                <div class="kRow">
                    <span class="kLabel">{{'applications.settings.mr.actions.agent_label' | translate}}</span>
                    <div class="kCol">
                        <p-dropdown [options]="agents" [(ngModel)]="selectedAgent" (ngModelChange)="handleAgentChange()" optionLabel="name" optionValue="id" [style]="{'width':'300px'}"></p-dropdown>
                    </div>
                </div>

                <span class="kDelete" (click)="delete()">{{'applications.content.table.delete'| translate}}</span>
            </div>
        </k-area-blocker>
    `
})
export class ActionAgentComponent implements OnInit, OnDestroy{
    @Input() action: Action;
    @Input() profileId: string;
    @Output() onActionChange = new EventEmitter<Action>();

    public _isBusy = false;
    public _blockerMessage: AreaBlockerMessage = null;

    public agents = [];
    public selectedAgent: any;
    public hasError = false;

    constructor(private _mrStore: MrStoreService,
                private _analytics: AppAnalytics,
                private _appLocalization: AppLocalization) {
    }

    ngOnInit(): void {
        this.loadAgents();
    }

    private loadAgents(): void {
        this.agents = [];
        this._blockerMessage = null;
        this._isBusy = true;
        this._mrStore.loadAgents().subscribe(
            (response) => {
                if (response.objects) {
                    this.agents = response.objects.filter(agent => (agent.trigger?.systemName !== 'RUN_ON_DEMAND' && agent.status === 'Enabled') || agent.trigger?.systemName === 'RUN_ON_DEMAND');
                    this.selectedAgent = this.action?.task?.taskParams?.agentTaskParams.agentId || this.agents[0]?.id;
                    if (!this.action?.task?.taskParams?.agentTaskParams.agentId) {
                        this.handleAgentChange();
                    }
                }
                this._isBusy = false;
            },
            error => {
                this._isBusy = false;
                this._blockerMessage = new AreaBlockerMessage({
                    message: error.message,
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
        )
    }

    public handleAgentChange(): void {
        if (this.action.requires === 'create') {
            // new action - create task
            this.action.task = {
                managedTasksProfileId: this.profileId,
                type: 'triggerAgent',
                status: 'enabled',
                taskParams: {
                    agentTaskParams: {
                        agentId: this.selectedAgent
                    }
                }
            }
        } else {
            this.action.task.taskParams.agentTaskParams.agentId = this.selectedAgent; // existing task
        }
        this.onActionChange.emit(this.action);

    }

    public delete(): void {
        this.action.requires = 'delete';
        this.onActionChange.emit(this.action);
    }

    ngOnDestroy(): void {
    }
}
