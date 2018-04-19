import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PopupWidgetComponent, PopupWidgetStates } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import { BrowserService } from 'app-shared/kmc-shell';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { AppEventsService } from 'app-shared/kmc-shared';
import { CreateNewPlaylistEvent } from 'app-shared/kmc-shared/events/playlist-creation';
import { KalturaPlaylistType } from 'kaltura-ngx-client/api/types/KalturaPlaylistType';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';

@Component({
  selector: 'kAddNewPlaylist',
  templateUrl: './add-new-playlist.component.html',
  styleUrls: ['./add-new-playlist.component.scss'],
    providers: [KalturaLogger.createLogger('AddNewPlaylistComponent')]
})
export class AddNewPlaylistComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() parentPopupWidget: PopupWidgetComponent;
  addNewPlaylistForm: FormGroup;
  private _showConfirmationOnClose = true;

  public _playlistTypes = KalturaPlaylistType;

  constructor(private _formBuilder: FormBuilder,
              private _browserService: BrowserService,
              private _appLocalization: AppLocalization,
              private _logger: KalturaLogger,
              private _appEvents: AppEventsService) {
    // build FormControl group
    this.addNewPlaylistForm = _formBuilder.group({
      name: ['', Validators.required],
      description: '',
      playlistType: KalturaPlaylistType.staticList
    });
  }

  goNext() {
      this._logger.info(`handle add playlist action by user`);
    if (this.addNewPlaylistForm.valid) {
      this._showConfirmationOnClose = false;
      this.parentPopupWidget.close();
      const { name, description, playlistType: type } = this.addNewPlaylistForm.value;
      this._logger.info(`publish 'CreateNewPlaylistEvent' event`, { name, description, type });
      this._appEvents.publish(new CreateNewPlaylistEvent({ name, description, type }));
    } else {
        this._logger.info(`add new playlist form is not valid, abort action`);
    }
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    if (this.parentPopupWidget) {
      this.parentPopupWidget.state$
        .cancelOnDestroy(this)
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

