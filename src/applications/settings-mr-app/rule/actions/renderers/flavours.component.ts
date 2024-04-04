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

@Component({
    selector: 'kActionFlavours',
    styleUrls: ['./renderers.scss'],
    template: `
        <k-area-blocker [showLoader]="_isBusy" [message]="_blockerMessage" [bodyScroll]="true">
            <div class="action">
                <div class="kRow">
                    <span class="kLabel">{{'applications.settings.mr.actions.value' | translate}}</span>
                    <span class="kLabelWithHelpTip">{{'applications.settings.mr.actions.flavours' | translate}}</span>
                    <kInputHelper>
                        <span>{{'applications.settings.mr.actions.flavours_tt' | translate}}</span>
                    </kInputHelper>
                </div>
                <div class="kRow">
                    <span class="kLabel">{{'applications.settings.mr.actions.flavour' | translate}}</span>
                    <div class="kCol">
                        <p-multiSelect [options]="flavours"
                                       [(ngModel)]="selectedFlavours" [filter]="false"
                                       optionLabel="name" optionValue="id" [showToggleAll]="false"
                                       (ngModelChange)="validate()"
                                       [defaultLabel]="'applications.settings.mr.actions.selectFlavours' | translate"></p-multiSelect>
                        <span class="kError" *ngIf="hasError">{{'applications.settings.mr.actions.flavoursError' | translate}}</span>
                    </div>
                </div>


                <span class="kDelete" (click)="delete()">{{'applications.content.table.delete'| translate}}</span>
            </div>
        </k-area-blocker>
    `
})
export class ActionFlavourComponent implements OnInit, OnDestroy{
    @Input() action: Action;
    @Input() profileId: string;
    @Output() onActionChange = new EventEmitter<Action>();

    public _isBusy = false;
    public _blockerMessage: AreaBlockerMessage = null;

    public flavours = [];
    public selectedFlavours = [];
    public hasError = false;

    constructor(private _kalturaServerClient: KalturaClient,
                private _appLocalization: AppLocalization) {
    }

    ngOnInit(): void {
        this.loadFlavours();
    }

    private loadFlavours(): void {
        this.flavours = [];
        this._blockerMessage = null;
        this._isBusy = true;
        const responseProfile: KalturaDetachedResponseProfile = new KalturaDetachedResponseProfile(
            {
                fields: 'id,format,name',
                type: KalturaResponseProfileType.includeFields
            }
        );
        const favourParamsPager = new KalturaFilterPager();
        favourParamsPager.pageSize = 500;

        this._kalturaServerClient.request(new FlavorParamsListAction({pager: favourParamsPager})
            .setRequestOptions({
                responseProfile
            }))
            .pipe(cancelOnDestroy(this))
            .subscribe(
                response => {
                    if (response?.objects) {
                        this.flavours = response.objects;
                        this.selectedFlavours = [];
                        const selectedFlavourIds = this.action.task?.taskParams?.deleteFlavorsTaskParams?.flavorParamsIds?.split(',') || [];
                        selectedFlavourIds.forEach(id=> {
                            this.selectedFlavours.push(parseInt(id));
                        })
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
            );
    }

    public validate(): void {
        this.hasError = this.selectedFlavours.length === 0;
        if (!this.hasError) {
            if (this.action.requires === 'create') {
                // new action - create task
                this.action.task = {
                    managedTasksProfileId: this.profileId,
                    type: 'deleteFlavors',
                    status: 'enabled',
                    taskParams: {
                        deleteFlavorsTaskParams: {
                            actionType: 'keepList',
                            flavorParamsIds: this.selectedFlavours.toString()
                        }
                    }
                }
            } else {
                // existing task
                this.action.task.taskParams.deleteFlavorsTaskParams.flavorParamsIds = this.selectedFlavours.toString();
            }
            this.onActionChange.emit(this.action);
        }
    }

    public delete(): void {
        this.action.requires = 'delete';
        this.onActionChange.emit(this.action);
    }

    ngOnDestroy(): void {
    }
}
