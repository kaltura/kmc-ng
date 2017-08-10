import { Component, Input, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { ISubscription } from 'rxjs/Subscription';
import { Router } from '@angular/router';
import { KalturaPlaylist } from 'kaltura-typescript-client/types/KalturaPlaylist';
import { PopupWidgetComponent, PopupWidgetStates } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import { BrowserService } from 'app-shared/kmc-shell';
import { AppLocalization } from '@kaltura-ng/kaltura-common';

@Component({
  selector: 'kAddNewPlaylist',
  templateUrl: './add-new-playlist.component.html',
  styleUrls: ['./add-new-playlist.component.scss']
})
export class AddNewPlaylist implements  OnInit, AfterViewInit, OnDestroy{

  @Input() parentPopupWidget: PopupWidgetComponent;
  addNewPlaylistForm: FormGroup;
  private _parentPopupStateChangeSubscribe: ISubscription;
  private _confirmClose: boolean = true;

  constructor(
    private _formBuilder : FormBuilder,
    public router: Router,
    private _browserService: BrowserService,
    private _appLocalization: AppLocalization
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
    this.router.navigate(['/content/playlists/playlist/new/content']);
  }

  ngOnInit(){}

  ngAfterViewInit() {
    if (this.parentPopupWidget) {
      this._parentPopupStateChangeSubscribe = this.parentPopupWidget.state$
        .subscribe(event => {
          if (event.state === PopupWidgetStates.Open) {
            this._confirmClose = true;
          }
          if (event.state === PopupWidgetStates.BeforeClose) {
            if (event.context && event.context.allowClose) {
              if (this.addNewPlaylistForm.dirty && this._confirmClose) {
                event.context.allowClose = false;
                this._browserService.confirm(
                  {
                    header: this._appLocalization.get('applications.content.addNewPlaylist.cancelEdit'),
                    message: this._appLocalization.get('applications.content.addNewPlaylist.discard'),
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

  ngOnDestroy(){
    this._parentPopupStateChangeSubscribe.unsubscribe();
  }
}

