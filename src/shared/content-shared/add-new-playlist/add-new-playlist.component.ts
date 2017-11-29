import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Optional, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PopupWidgetComponent, PopupWidgetStates } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import { BrowserService } from 'app-shared/kmc-shell';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { PlaylistsStore } from 'app-shared/content-shared/playlists-store/playlists-store.service';
import { KalturaMediaEntry } from 'kaltura-ngx-client/api/types/KalturaMediaEntry';
import { PlaylistAddAction } from 'kaltura-ngx-client/api/types/PlaylistAddAction';
import { KalturaPlaylist } from 'kaltura-ngx-client/api/types/KalturaPlaylist';
import { KalturaPlaylistType } from 'kaltura-ngx-client/api/types/KalturaPlaylistType';
import { KalturaAPIException, KalturaClient } from 'kaltura-ngx-client';

@Component({
  selector: 'kAddNewPlaylist',
  templateUrl: './add-new-playlist.component.html',
  styleUrls: ['./add-new-playlist.component.scss']
})
export class AddNewPlaylistComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input()
  set silent(value: boolean) {
    this._silent = value;

    if (this._addNewPlaylistForm) {
      this._addNewPlaylistButtonLabel = this._appLocalization.get('applications.content.addNewPlaylist.save');
      this._addNewPlaylistForm.controls['playlistType'].disable();
    }
  }

  @Input() entries: KalturaMediaEntry[] = [];
  @Input() parentPopupWidget: PopupWidgetComponent;
  @Output() showNotSupportedMsg = new EventEmitter<boolean>();
  @Output() actionPerformed = new EventEmitter<void>();

  private _showConfirmationOnClose = true;

  public _addNewPlaylistForm: FormGroup;
  public _silent = false;
  public _addNewPlaylistButtonLabel = this._appLocalization.get('applications.content.addNewPlaylist.next');

  constructor(private _formBuilder: FormBuilder,
              private _router: Router,
              private _browserService: BrowserService,
              private _appLocalization: AppLocalization,
              private _kalturaClient: KalturaClient,
              @Optional() private _playlistsStore: PlaylistsStore) {
    // build FormControl group
    this._addNewPlaylistForm = _formBuilder.group({
      name: ['', Validators.required],
      description: '',
      playlistType: ['manual'],
      ruleBasedSub: false
    });
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
            && this._addNewPlaylistForm.dirty
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

  private _create(): void {
    if (this._addNewPlaylistForm.controls['playlistType'].value === 'ruleBased') {
      this.showNotSupportedMsg.emit();
    } else {
      const { name, description } = this._addNewPlaylistForm.value;
      this._playlistsStore.setNewPlaylistData({ name, description });
      this._router.navigate(['/content/playlists/playlist/new/content']);
    }
  }

  private _createSilently(): void {
    const { name, description = '' } = this._addNewPlaylistForm.value;
    const playlist = new KalturaPlaylist({
      playlistType: KalturaPlaylistType.staticList,
      playlistContent: this.entries.map(({ id }) => id).join(','),
      name,
      description
    });

    this._kalturaClient.request(new PlaylistAddAction({ playlist }))
      .tag('block-shell')
      .subscribe(
        () => {
          if (this.parentPopupWidget) {
            this._showConfirmationOnClose = false;
            this.parentPopupWidget.close();
            this.actionPerformed.emit();
          }
        },
        (error) => {
          this._browserService.alert(
            {
              header: this._appLocalization.get('applications.content.addNewPlaylist.creationError.header'),
              message: error.message || this._appLocalization.get('applications.content.addNewPlaylist.creationError.body'),
              accept: () => {
                this._showConfirmationOnClose = false;
                this.parentPopupWidget.close()
                this.actionPerformed.emit();
              }
            }
          );
        }
      );
  }

  public _createPlaylist(): void {
    if (!this._addNewPlaylistForm.valid) {
      return;
    }

    if (this._silent) {
      this._createSilently();
    } else {
      this._create();
    }
  }
}

