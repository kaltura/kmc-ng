import {AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {ISubscription} from 'rxjs/Subscription';

import {KalturaClient} from 'kaltura-ngx-client';
import { AppLocalization } from '@kaltura-ng/mc-shared/localization';
import {BrowserService} from 'app-shared/kmc-shell';
import {AreaBlockerMessage} from '@kaltura-ng/kaltura-ui';
import {PopupWidgetComponent, PopupWidgetStates} from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import {KalturaMediaEntry} from 'kaltura-ngx-client/api/types/KalturaMediaEntry';
import {KalturaUser} from 'kaltura-ngx-client/api/types/KalturaUser';

@Component({
  selector: 'kBulkRemovePublishers',
  templateUrl: './bulk-remove-publishers.component.html',
  styleUrls: ['./bulk-remove-publishers.component.scss']
})
export class BulkRemovePublishersComponent implements OnInit, OnDestroy, AfterViewInit {

  @Input() selectedEntries: KalturaMediaEntry[];
  @Input() parentPopupWidget: PopupWidgetComponent;
  @Output() removePublishersChanged = new EventEmitter<string[]>();

  public _loading = false;
  public _sectionBlockerMessage: AreaBlockerMessage;

  public users: KalturaUser[] = [];
  public usersToRemove: string[] = [];

  private _parentPopupStateChangeSubscribe: ISubscription;
  private _confirmClose = true;

  constructor(private _kalturaServerClient: KalturaClient, private _appLocalization: AppLocalization, private _browserService: BrowserService) {
  }

  ngOnInit() {
    const users = [];
    // create unique users array from all selected entries users
    this.selectedEntries.forEach(entry => {
      if (entry.entitledUsersPublish && entry.entitledUsersPublish.length) {
        const entryPublishers = entry.entitledUsersPublish.split(',').map(publisher => {
          return publisher.trim();
        });
        entryPublishers.forEach(publisher => {
          if (users.indexOf(publisher) === -1) {
            users.push(publisher);
          }
        });
      }
    });
    this.users = users.sort();
  }

  ngAfterViewInit() {
    if (this.parentPopupWidget) {
      this._parentPopupStateChangeSubscribe = this.parentPopupWidget.state$
        .subscribe(event => {
          if (event.state === PopupWidgetStates.Open) {
            this._confirmClose = true;
          }
          if (event.state === PopupWidgetStates.BeforeClose) {
            if (event.context && event.context.allowClose) {
              if (this.usersToRemove.length && this._confirmClose) {
                event.context.allowClose = false;
                this._browserService.confirm(
                  {
                    header: this._appLocalization.get('applications.content.entryDetails.captions.cancelEdit'),
                    message: this._appLocalization.get('applications.content.entryDetails.captions.discard'),
                    accept: () => {
                      this._confirmClose = false;
                      this.parentPopupWidget.close();
                    }
                  }
                );
              }
            }
          }
        });
    }
  }

  ngOnDestroy() {
    this._parentPopupStateChangeSubscribe.unsubscribe();
  }

  public _removeUser(user: string) {
    this.usersToRemove.push(user);
  }

  public _apply() {
    this.removePublishersChanged.emit(this.usersToRemove);
    this._confirmClose = false;
    this.parentPopupWidget.close();
  }
}

