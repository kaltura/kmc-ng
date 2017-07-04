import { Component, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { PlaylistStore, SectionState } from '../playlist-store.service';
import { PlaylistSections } from '../playlist-sections';

@Component({
  selector: 'kPlaylistMetadata',
  templateUrl: './playlist-metadata.component.html',
  styleUrls: ['./playlist-metadata.component.scss']
})


export class PlaylistMetadataComponent implements AfterViewInit, OnInit, OnDestroy {
  name : FormControl;
  description : FormControl;
  metadataForm: FormGroup;
  sectionState: SectionState[] = [];

  constructor(
    private _formBuilder : FormBuilder,
    private _playlistStore: PlaylistStore
  ) {
    // init form input fields
    this.name         = new FormControl('', Validators.required);
    this.description  = new FormControl('');

    // build FormControl group
    this.metadataForm = _formBuilder.group({
      name        : this.name,
      description : this.description
    });
  }

  ngOnInit() {
    this.sectionState = [
      new SectionState(PlaylistSections.Metadata, true, false),
      new SectionState(PlaylistSections.Content, true, false)
    ];

    this._playlistStore.playlist$
      .subscribe(
        response => {
          // this.metadataForm.controls["name"].updateValueAndValidity({ onlySelf: true, emitEvent: true });
          // this.metadataForm.updateValueAndValidity();
          if(response.playlist) {
            this.metadataForm.reset({
              name: response.playlist.name,
              description: response.playlist.description
            });
          } else {
            // TODO [kmc] missing implementaion
          }
        }
      );

    this.metadataForm.statusChanges
      .subscribe(
        status => {
          this.sectionState[0].isValid = status === 'VALID';
          this._playlistStore.updateSectionState(this.sectionState);
        }
      );

    this.metadataForm.valueChanges.subscribe(
      form => {
        this._playlistStore.playlist.name = form.name;
        this._playlistStore.playlist.description = form.description;
        /*
        if(this._playlistStore.metadataFlag) {
          this._playlistStore.metadataIsDirty = true;
          this._playlistStore._sectionsState.next({
            metadata: {
              isValid: this._playlistStore.metadataIsValid,
              isDirty: this._playlistStore.metadataIsDirty
            }
          });*/
        });
  }

  ngOnDestroy() {

  }

  ngAfterViewInit() {}

}

