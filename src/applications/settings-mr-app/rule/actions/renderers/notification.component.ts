import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Action} from '../actions.component';
import {
    ESearchSearchUserAction, KalturaClient, KalturaESearchItemType,
    KalturaESearchOperatorType, KalturaESearchUserFieldName, KalturaESearchUserItem,
    KalturaESearchUserOperator,
    KalturaESearchUserParams, KalturaESearchUserResponse, KalturaESearchUserResult, KalturaFilterPager,
    KalturaUser, KalturaUserFilter, UserListAction
} from 'kaltura-ngx-client';
import {ISubscription} from 'rxjs/Subscription';
import {Observable, Subject} from 'rxjs';
import {SuggestionsProviderData} from '@kaltura-ng/kaltura-primeng-ui';
import {cancelOnDestroy} from '@kaltura-ng/kaltura-common';
import {notificationTemplates} from './notification.templates';
import {AppAnalytics, ButtonType} from 'app-shared/kmc-shell';

@Component({
    selector: 'kActionNotification',
    styleUrls: ['./renderers.scss'],
    template: `
        <div class="notification">
            <div class="kRow">
                <p-checkbox [(ngModel)]="selected" (ngModelChange)="this.sendMainAnalytics(); validate()"
                            label="{{'applications.settings.mr.notification.' + this.type | translate}}"
                            binary="true"></p-checkbox>
                <a [class.kDisabledLink]="!selected" (click)="editPopup.open()">{{'applications.settings.mr.notification.edit' | translate}}</a>
            </div>
        </div>
        <kPopupWidget #editPopup data-aid="editNotificationPopup" [popupWidth]="790" [popupHeight]="582" [closeBtn]="false" [modal]="true">
            <ng-template>
                <div class="emailSettings">
                    <div class="header">
                        <span>{{'applications.settings.mr.notification.editTitle' | translate}}</span>
                    </div>
                    <div class="kForm" *ngIf="action">
                        <div [class.kHidden]="type !== 'headsUp'" class="kRow kCenter">
                            <span class="kLabel">{{'applications.settings.mr.notification.scheduling' | translate}}</span>
                            <p-inputNumber class="kInput" [(ngModel)]="action.task.taskParams.sendNotificationTaskParams.daysToWait" (ngModelChange)="this.sendBeforeAnalytics(); validate()"></p-inputNumber>
                            <span class="kText kLeft">{{'applications.settings.mr.notification.daysBefore' | translate}}</span>
                        </div>
                        <div class="kRow">
                            <span class="kLabel">{{'applications.settings.mr.notification.sendTo' | translate}}</span>
                            <div class="kCol">
                                <p-checkbox [(ngModel)]="action.task.taskParams.sendNotificationTaskParams.recipients.managedTasksProfileOwner"
                                            (ngModelChange)="sendAnalytics('_send_to_rule_owner', action.task.taskParams.sendNotificationTaskParams.recipients.managedTasksProfileOwner); validate()"
                                            label="{{'applications.settings.mr.notification.rule' | translate}}" binary="true"></p-checkbox>
                                <p-checkbox [class.kHidden]="type === 'executionSummary'" [(ngModel)]="action.task.taskParams.sendNotificationTaskParams.recipients.objectOwner"
                                            (ngModelChange)="sendAnalytics('_send_to_entry_owner', action.task.taskParams.sendNotificationTaskParams.recipients.objectOwner); validate()"
                                            label="{{'applications.settings.mr.notification.entry' | translate}}" binary="true"></p-checkbox>
                                <p-checkbox [(ngModel)]="sendToCustomUsers" (ngModelChange)="sendAnalytics('_send_to_custom', sendToCustomUsers); validate()"
                                            label="{{'applications.settings.mr.notification.custom' | translate}}" binary="true"></p-checkbox>
                                <kAutoComplete
                                    [disabled]="!sendToCustomUsers"
                                    [(ngModel)]="owners"
                                    (ngModelChange)="validate()"
                                    suggestionItemField="item"
                                    suggestionLabelField="name"
                                    [tooltipResolver]="'__tooltip'"
                                    [classField]="'__class'"
                                    field="id"
                                    [allowMultiple]="true"
                                    [limitToSuggestions]="false"
                                    [minLength]="3"
                                    suggestionSelectableField="isSelectable"
                                    [suggestionsProvider]="_usersProvider"
                                    (completeMethod)="_searchUsers($event, 'editors')">
                                </kAutoComplete>
                            </div>
                        </div>
                        <div class="kRow">
                            <span class="kLabel">{{'applications.settings.mr.notification.subject' | translate}}</span>
                            <input pInputText [(ngModel)]="action.task.taskParams.sendNotificationTaskParams.messageSubject" (ngModelChange)="validate()">
                        </div>
                        <div class="kRow">
                            <span class="kLabel">{{'applications.settings.mr.notification.body' | translate}}</span>
                            <textarea class="threeRows" pInputTextarea [(ngModel)]="action.task.taskParams.sendNotificationTaskParams.messageBody" (ngModelChange)="validate()"></textarea>
                        </div>
                    </div>

                    <div class="footer">
                        <button type="button" class="kButtonDefault" (click)="this.revert();editPopup.close()" pButton
                                label="{{'app.common.cancel' | translate}}"></button>
                        <button pButton type="button" class="kButtonBranded" [label]="'app.common.apply' | translate"
                                (click)="this.validate();editPopup.close()"></button>
                    </div>
                </div>
            </ng-template>
        </kPopupWidget>
    `
})
export class ActionNotificationComponent implements OnDestroy{
    @Input() set ruleAction(value: Action | undefined){
        if (value) {
            this.action = value;
            this.originalAction = JSON.parse(JSON.stringify(value)); // save for revert
            this.sendToCustomUsers = this.action?.task?.taskParams?.sendNotificationTaskParams?.recipients?.userIds?.length > 0;
            this.loadUsers();
            this.selected = true;
        }
    };
    @Input() type: 'profileScan' | 'headsUp' | 'executionSummary';
    @Input() profileId: string;
    @Output() onActionChange = new EventEmitter<Action>();

    public selected = false;

    public action: Action;
    private originalAction: Action;

    public sendToCustomUsers = false;
    public owners: KalturaUser[] = [];
    private _searchUsersSubscription: ISubscription;
    public _usersProvider = new Subject<SuggestionsProviderData>();

    private analyticsEvents = {
        profileScan: 'AM_notifications_post_scan',
        headsUp: 'AM_notifications_pre_action',
        executionSummary: 'AM_notifications_post_action'
    }

    constructor(private _analytics: AppAnalytics, private _kalturaServerClient: KalturaClient) {
    }

    private getNotificationType():  'notificationHeadsUp' | 'notificationProfileScan' | 'notificationExecutionSummary' {
        switch (this.type) {
            case 'headsUp':
                return 'notificationHeadsUp';
                break;
            case 'profileScan':
                return 'notificationProfileScan';
                break;
            case 'executionSummary':
                return 'notificationExecutionSummary';
                break;
        }
    }

    public validate(): void {
        if (this.selected) {
            if (!this.action || this.action.requires === 'delete') {
                this.action = {
                    requires: 'create',
                    type: this.getNotificationType(),
                    task: {
                        managedTasksProfileId: this.profileId,
                        type: 'sendNotification',
                        status: 'enabled',
                        taskParams: {
                            sendNotificationTaskParams: {
                                notificationType: this.type,
                                recipients: {
                                    managedTasksProfileOwner: true
                                },
                                messageSubject: notificationTemplates.subject[this.type],
                                messageBody: notificationTemplates.body[this.type]
                            }
                        }
                    }
                }
                if (this.type === 'headsUp') {
                    this.action.task.taskParams.sendNotificationTaskParams.daysToWait = 3;
                }
                this.originalAction = JSON.parse(JSON.stringify((this.action))); // save for revert
            } else {
                // update
                if (this.action.task?.id) {
                    this.action.requires = 'update';
                }
                if (this.sendToCustomUsers) {
                    if (this.owners.length) {
                        this.action.task.taskParams.sendNotificationTaskParams.recipients.userIds = this.owners.map(user => user.id);
                    }
                } else {
                    this.owners = [];
                    delete this.action.task.taskParams.sendNotificationTaskParams.recipients.userIds;
                }
            }
        } else {
            // remove notification
            this.action.requires = 'delete';
        }

        this.onActionChange.emit(this.action);
    }

    public sendMainAnalytics(): void {
        this._analytics.trackButtonClickEvent(ButtonType.Toggle, this.analyticsEvents[this.type], this.selected ? 'enable' : 'disable' , 'Automation_manager');
    }

    public sendBeforeAnalytics(): void {
        this._analytics.trackButtonClickEvent(ButtonType.Choose, 'AM_notifications_pre_action_days_before', this.action.task.taskParams.sendNotificationTaskParams.daysToWait.toString() , 'Automation_manager');
    }

    public sendAnalytics(postFix: string, enabled: boolean): void {
        this._analytics.trackButtonClickEvent(ButtonType.Toggle, this.analyticsEvents[this.type] + postFix, enabled ? 'enable' : 'disable' , 'Automation_manager');
    }

    public revert(): void {
        this.action = JSON.parse(JSON.stringify(this.originalAction));
        this.loadUsers();
        this.sendToCustomUsers = this.action?.task?.taskParams?.sendNotificationTaskParams?.recipients?.userIds?.length > 0;
    }

    public onNotificationsSaved(): void {
        if (this.action) {
            this.originalAction = JSON.parse(JSON.stringify(this.action));
            this.loadUsers();
            this.sendToCustomUsers = this.action?.task?.taskParams?.sendNotificationTaskParams?.recipients?.userIds?.length > 0;
        }
    }

    // --------------------------- users auto complete code --------------------------
    private loadUsers(): void {
        const userIds = this.action?.task?.taskParams?.sendNotificationTaskParams?.recipients?.userIds?.toString() || '';
        if (userIds) {
            // load users from their IDs
            this._kalturaServerClient.request(new UserListAction({
                filter: new KalturaUserFilter({
                    idIn: userIds
                })
            }))
                .pipe(cancelOnDestroy(this))
                .subscribe(response => {
                        this.owners = response?.objects ? response.objects : [];
                    },
                    error => {
                        console.error("Error loading users ", error);
                    })
        }
    }

    private searchUsers(text : string) {
        return Observable.create(
            observer => {
                const requestSubscription: ISubscription = this._kalturaServerClient.request(
                    new ESearchSearchUserAction({
                        searchParams: new KalturaESearchUserParams({
                            searchOperator: new KalturaESearchUserOperator({
                                operator: KalturaESearchOperatorType.orOp,
                                searchItems: [
                                    new KalturaESearchUserItem({
                                        itemType: KalturaESearchItemType.startsWith,
                                        fieldName: KalturaESearchUserFieldName.screenName,
                                        searchTerm: text
                                    }),
                                    new KalturaESearchUserItem({
                                        itemType: KalturaESearchItemType.startsWith,
                                        fieldName: KalturaESearchUserFieldName.firstName,
                                        searchTerm: text.split(" ")[0]
                                    }),
                                    new KalturaESearchUserItem({
                                        itemType: KalturaESearchItemType.partial,
                                        fieldName: KalturaESearchUserFieldName.lastName,
                                        searchTerm: text
                                    }),
                                    new KalturaESearchUserItem({
                                        itemType: KalturaESearchItemType.startsWith,
                                        fieldName: KalturaESearchUserFieldName.userId,
                                        searchTerm: text
                                    })
                                ]
                            })
                        }),
                        pager: new KalturaFilterPager({
                            pageIndex : 0,
                            pageSize : 30
                        })
                    })
                )
                    .pipe(cancelOnDestroy(this))
                    .subscribe(
                        (result: KalturaESearchUserResponse) =>
                        {
                            let users = [];
                            if (result?.objects) {
                                result.objects.forEach((res: KalturaESearchUserResult) => users.push(res.object))
                            }
                            observer.next(users);
                            observer.complete();
                        },
                        err =>
                        {
                            observer.error(err);
                        }
                    );

                return () =>
                {
                    console.log("entryUsersHandler.searchOwners(): cancelled");
                    requestSubscription.unsubscribe();
                }
            });
    }

    public _searchUsers(event, formControl?) : void {
        this._usersProvider.next({ suggestions : [], isLoading : true});

        if (this._searchUsersSubscription)
        {
            // abort previous request
            this._searchUsersSubscription.unsubscribe();
            this._searchUsersSubscription = null;
        }

        this._searchUsersSubscription = this.searchUsers(event.query).subscribe(data => {
                const suggestions = [];
                (data || []).forEach((suggestedUser: KalturaUser) => {
                    suggestedUser['__tooltip'] = suggestedUser.id;
                    let isSelectable = true;
                    if (formControl){
                        isSelectable = !this.owners.find(user => {
                            return user.id === suggestedUser.id;
                        });
                    }
                    suggestions.push({
                        name: `${suggestedUser.screenName} (${suggestedUser.id})`,
                        item: suggestedUser,
                        isSelectable: isSelectable
                    });
                });
                this._usersProvider.next({suggestions: suggestions, isLoading: false});
            },
            (err) => {
                this._usersProvider.next({ suggestions : [], isLoading : false, errorMessage : <any>(err.message || err)});
            });
    }

    ngOnDestroy(): void {
        this._usersProvider.complete();
        if (this._searchUsersSubscription) {
            this._searchUsersSubscription.unsubscribe();
        }
    }
}
