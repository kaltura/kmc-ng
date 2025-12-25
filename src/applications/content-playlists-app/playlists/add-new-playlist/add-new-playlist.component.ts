import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PopupWidgetComponent, PopupWidgetStates } from '@kaltura-ng/kaltura-ui';
import { BrowserService } from 'app-shared/kmc-shell/providers';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { AppEventsService } from 'app-shared/kmc-shared';
import { CreateNewPlaylistEvent } from 'app-shared/kmc-shared/events/playlist-creation';
import { KalturaEntryApplication, KalturaPlaylistType } from 'kaltura-ngx-client';
import { cancelOnDestroy, tag } from '@kaltura-ng/kaltura-common';
import {globalConfig} from 'config/global';

@Component({
  selector: 'kAddNewPlaylist',
  templateUrl: './add-new-playlist.component.html',
  styleUrls: ['./add-new-playlist.component.scss']
})
export class AddNewPlaylistComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() parentPopupWidget: PopupWidgetComponent;
  addNewPlaylistForm: FormGroup;
  private _showConfirmationOnClose = true;

  public _playlistTypes = KalturaPlaylistType;

  constructor(private _formBuilder: FormBuilder,
              public router: Router,
              private _browserService: BrowserService,
              private _appLocalization: AppLocalization,
              private _appEvents: AppEventsService) {
    // build FormControl group
    this.addNewPlaylistForm = _formBuilder.group({
      name: ['', Validators.required],
      description: '',
      playlistType: KalturaPlaylistType.staticList,
      application: KalturaEntryApplication.kmc,
      applicationVersion: globalConfig.client.appVersion
    });
  }

  goNext() {
    if (this.addNewPlaylistForm.valid) {
      this._showConfirmationOnClose = false;
      this.parentPopupWidget.close();
      const { name, description, playlistType: type , application, applicationVersion} = this.addNewPlaylistForm.value;
      this._appEvents.publish(new CreateNewPlaylistEvent({ name, description, type , application, applicationVersion}))    }
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    if (this.parentPopupWidget) {
      this.parentPopupWidget.state$
        .pipe(cancelOnDestroy(this))
        .subscribe(({ state, context }) => {
          if (state === PopupWidgetStates.Open) {
            this._showConfirmationOnClose = true;
          }
          if (state === PopupWidgetStates.BeforeClose
            && context && context.allowClose
            && this.addNewPlaylistForm.dirty
            && this._showConfirmationOnClose) {
            context.allowClose = false;
            this._browserService.confirm(
              {
                header: this._appLocalization.get('applications.content.addNewPlaylist.cancelEdit'),
                message: this._appLocalization.get('applications.content.addNewPlaylist.discard'),
                accept: () => {
                  this._showConfirmationOnClose = false;
                  this.parentPopupWidget.close();
                }
              }
            );
          }
        });
    }
  }

  ngOnDestroy() {
  }
}

