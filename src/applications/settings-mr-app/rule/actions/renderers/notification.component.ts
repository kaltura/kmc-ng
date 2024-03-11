import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Action} from '../actions.component';
import {KMCPermissions, KMCPermissionsService} from 'app-shared/kmc-shared/kmc-permissions';

@Component({
    selector: 'kActionNotification',
    styleUrls: ['./renderers.scss'],
    template: `
        <div class="notification">
            <div class="kRow">
                <p-checkbox [(ngModel)]="selected" (ngModelChange)="validate()"
                            label="{{'applications.settings.mr.notification.' + this.type | translate}}"
                            binary="true"></p-checkbox>
                <a [class.kDisabledLink]="!selected" (click)="editPopup.open()">{{'applications.settings.mr.notification.edit' | translate}}</a>
            </div>
        </div>
        <kPopupWidget #editPopup data-aid="editNotificationPopup" [popupWidth]="790" [popupHeight]="582" [closeBtn]="true" [modal]="true">
            <div class="emailSettings">
                <div class="header">
                    <span>{{'applications.settings.mr.notification.editTitle' | translate}}</span>
                </div>
                <div class="kForm">
                    <div [class.kHidden]="type !== 'headsUp'" class="kRow kCenter">
                        <span class="kLabel">{{'applications.settings.mr.notification.scheduling' | translate}}</span>
                        <p-inputNumber class="kInput" [(ngModel)]="daysBeforeRun" (ngModelChange)="validate()"></p-inputNumber>
                        <span class="kText kLeft">{{'applications.settings.mr.notification.daysBefore' | translate}}</span>
                    </div>
                    <div class="kRow">
                        <span class="kLabel">{{'applications.settings.mr.notification.sendTo' | translate}}</span>
                    </div>
                    <div class="kRow">
                        <span class="kLabel">{{'applications.settings.mr.notification.subject' | translate}}</span>
                    </div>
                    <div class="kRow">
                        <span class="kLabel">{{'applications.settings.mr.notification.body' | translate}}</span>
                    </div>
                </div>

                <div class="footer">
                    <button type="button" class="kButtonDefault" (click)="this.revert();editPopup.close()" pButton
                            label="{{'app.common.cancel' | translate}}"></button>
                    <button pButton type="button" class="kButtonBranded" [label]="'app.common.apply' | translate"
                            (click)="this.validate();editPopup.close()"></button>
                </div>
            </div>
        </kPopupWidget>
    `
})
export class ActionNotificationComponent implements OnInit{
    @Input() set ruleAction(value: Action | undefined){
        if (value) {
            this.action = value;
            this.originalAction = JSON.parse(JSON.stringify(value)); // save for revert
            this.selected = true;
        }
    };
    @Input() type: 'profileScan' | 'headsUp' | 'executionSummary';
    @Input() profileId: string;
    @Output() onActionChange = new EventEmitter<Action>();

    public selected = false;
    public daysBeforeRun = 3;

    private action: Action;
    private originalAction: Action;

    constructor() {
    }

    ngOnInit(): void {
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
            if (!this.action) {
                this.action = {
                    requires: 'create',
                    type: this.getNotificationType(),
                    task: {
                        managedTasksProfileId: this.profileId,
                        type: 'sendNotification',
                        taskParams: {
                            sendNotificationTaskParams: {
                                notificationType: this.type,
                                recipients: {
                                    managedTasksProfileOwner: true
                                }
                            }
                        }
                    }
                }
                this.originalAction = JSON.parse(JSON.stringify((this.action))); // save for revert
            }
        } else {
            // remove notification
            this.action.requires = 'delete';
        }
        this.onActionChange.emit(this.action);
    }

    public revert(): void {
        this.action = this.originalAction;
    }

}
