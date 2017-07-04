import { Component, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { PlaylistStore } from '../playlist-store.service';
import { PlaylistSections } from '../playlist-sections';
import { SuggestionsProviderData } from '@kaltura-ng/kaltura-primeng-ui/auto-complete';
import { Subject } from 'rxjs/Subject';
import { ISubscription } from 'rxjs/Subscription';

@Component({
  selector: 'kPlaylistMetadata',
  templateUrl: './playlist-metadata.component.html',
  styleUrls: ['./playlist-metadata.component.scss']
})

export class PlaylistMetadataComponent implements AfterViewInit, OnInit, OnDestroy {
  metadataForm : FormGroup;
  _tagsProvider = new Subject<SuggestionsProviderData>();
  private _searchTagsSubscription : ISubscription;

  constructor(
    private _formBuilder : FormBuilder,
    private _playlistStore: PlaylistStore
  ) {
    // build FormControl group
    this.metadataForm = _formBuilder.group({
      name        : ['', Validators.required],
      description : '',
      tags        : null
    });
  }

  ngOnInit() {
    this._playlistStore.playlist$
      .subscribe(
        response => {
          // this.metadataForm.controls["name"].updateValueAndValidity({ onlySelf: true, emitEvent: true });
          // this.metadataForm.updateValueAndValidity();
          if(response.playlist) {
            this.metadataForm.reset({
              name: response.playlist.name,
              description: response.playlist.description,
              tags: response.playlist.tags
            });
          } else {
            // TODO [kmc] missing implementation
          }
        }
      );

    this.metadataForm.statusChanges
      .subscribe(
        status => {
          this._playlistStore.updateSectionState(
            PlaylistSections.Metadata,
            status === 'VALID',
            this._playlistStore.sectionsState.metadata.isDirty
          );
        }
      );

    this.metadataForm.valueChanges.subscribe(
      form => {
        if( form.name !== this._playlistStore.playlist.name ||
            form.description !== this._playlistStore.playlist.description) {
          this._playlistStore.updateSectionState(
            PlaylistSections.Metadata,
            this._playlistStore.sectionsState.metadata.isValid,
            true
          );
        }
        this._playlistStore.playlist.name = form.name;
        this._playlistStore.playlist.description = form.description;
      });
  }

  ngOnDestroy() {
    this._tagsProvider.complete();
    this._searchTagsSubscription && this._searchTagsSubscription.unsubscribe();
  }

  ngAfterViewInit() {}

}

