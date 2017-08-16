import { Component, Input, OnInit, AfterViewInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { PopupWidgetComponent, PopupWidgetStates } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import { BrowserService } from 'app-shared/kmc-shell';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { PlaylistsStore } from '../playlists-store/playlists-store.service';

@Component({
  selector: 'kAddNewPlaylist',
  templateUrl: './add-new-playlist.component.html',
  styleUrls: ['./add-new-playlist.component.scss']
})
export class AddNewPlaylist implements  OnInit, AfterViewInit, OnDestroy{

  @Input() parentPopupWidget: PopupWidgetComponent;
  @Output() showNotSupportedMsg = new EventEmitter<boolean>();
  addNewPlaylistForm: FormGroup;
  private _showConfirmationOnClose: boolean = true;

  constructor(
    private _formBuilder : FormBuilder,
    public router: Router,
    private _browserService: BrowserService,
    private _appLocalization: AppLocalization,
    private _playlistsStore: PlaylistsStore
  ) {
    // build FormControl group
    this.addNewPlaylistForm = _formBuilder.group({
      name        : ['', Validators.required],
      description : '',
      playlistType: ['manual'],
      ruleBasedSub: false
    });
  }

  goNext() {
    if(this.addNewPlaylistForm.valid) {
      if (this.addNewPlaylistForm.controls['playlistType'].value === 'ruleBased') {
        this.showNotSupportedMsg.emit();
      } else {
        this._playlistsStore.setNewPlaylistData({
          name: this.addNewPlaylistForm.controls['name'].value,
          description: this.addNewPlaylistForm.controls['description'].value
        });
        this.router.navigate(['/content/playlists/playlist/new/content']);
      }
    }
  }

  ngOnInit(){}

  ngAfterViewInit() {
    if (this.parentPopupWidget) {
      this.parentPopupWidget.state$
        .cancelOnDestroy(this)
        .subscribe(event => {
          if (event.state === PopupWidgetStates.Open) {
            this._showConfirmationOnClose = true;
          }
          if (event.state === PopupWidgetStates.BeforeClose) {
            if (event.context && event.context.allowClose) {
              if (this.addNewPlaylistForm.dirty && this._showConfirmationOnClose) {
                event.context.allowClose = false;
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
            }
          }
        });
    }
  }

  ngOnDestroy(){}
}

