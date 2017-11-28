import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Optional, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PopupWidgetComponent, PopupWidgetStates } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import { BrowserService } from 'app-shared/kmc-shell';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { PlaylistsStore } from 'app-shared/content-shared/playlists-store/playlists-store.service';

@Component({
  selector: 'kAddNewPlaylist',
  templateUrl: './add-new-playlist.component.html',
  styleUrls: ['./add-new-playlist.component.scss']
})
export class AddNewPlaylistComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() silent = false;
  @Input() parentPopupWidget: PopupWidgetComponent;
  @Output() showNotSupportedMsg = new EventEmitter<boolean>();

  private _showConfirmationOnClose = true;

  public addNewPlaylistForm: FormGroup;

  constructor(private _formBuilder: FormBuilder,
              private _router: Router,
              private _browserService: BrowserService,
              private _appLocalization: AppLocalization,
              @Optional() private _playlistsStore: PlaylistsStore) {
    // build FormControl group
    this.addNewPlaylistForm = _formBuilder.group({
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

  public _goNext(): void {
    if (this.addNewPlaylistForm.valid) {
      if (this.addNewPlaylistForm.controls['playlistType'].value === 'ruleBased') {
        this.showNotSupportedMsg.emit();
      } else {
        const { name, description } = this.addNewPlaylistForm.value;
        this._playlistsStore.setNewPlaylistData({ name, description });
        this._router.navigate(['/content/playlists/playlist/new/content']);
      }
    }
  }
}

