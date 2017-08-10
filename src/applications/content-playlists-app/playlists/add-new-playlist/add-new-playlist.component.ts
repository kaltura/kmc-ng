import { Component, Input, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { KalturaPlaylist } from 'kaltura-typescript-client/types/KalturaPlaylist';
import { KalturaPlaylistType } from 'kaltura-typescript-client/types/KalturaPlaylistType';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';

@Component({
  selector: 'kAddNewPlaylist',
  templateUrl: './add-new-playlist.component.html',
  styleUrls: ['./add-new-playlist.component.scss']
})
export class AddNewPlaylist implements  OnInit, AfterViewInit, OnDestroy{

  @Input() parentPopupWidget: PopupWidgetComponent;
  addNewPlaylistForm: FormGroup;
  newPlaylist: KalturaPlaylist;

  constructor(
    private _formBuilder : FormBuilder,
    public router: Router
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
    this.router.navigate(['/content/playlists/playlist/new/content'], this.newPlaylist);
  }

  ngOnInit(){
    this.addNewPlaylistForm.valueChanges
      .cancelOnDestroy(this)
      .subscribe(
        form => {
          let playlistType = form.playlistType === 'manual' ? KalturaPlaylistType.staticList : KalturaPlaylistType.dynamic;
          this.newPlaylist = new KalturaPlaylist({
            name: form.name,
            description: form.description,
            playlistType: playlistType
          });
          /* ToDo have to figure out how to send the "ruleBasedSub" value */
        }
      );
  }

  ngAfterViewInit(){}

  ngOnDestroy(){}
}

