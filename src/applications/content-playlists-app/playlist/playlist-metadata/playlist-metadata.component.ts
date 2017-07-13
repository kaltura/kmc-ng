import { Component, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
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
      .cancelOnDestroy(this)
      .subscribe(
        response => {
          if(response.playlist) {
            this.metadataForm.reset({
              name: response.playlist.name,
              description: response.playlist.description,
              tags: response.playlist.tags ? response.playlist.tags.split(', ') : null
            });
          } else {
            // TODO [kmc] missing implementation
          }
        }
      );

    this.metadataForm.statusChanges
      .cancelOnDestroy(this)
      .subscribe(
        status => {
          this._playlistStore.updateSectionState(PlaylistSections.Metadata, {isValid : status === 'VALID'});
        }
      );

    this.metadataForm.valueChanges
      .cancelOnDestroy(this)
      .subscribe(
        form => {
          this._playlistStore.updateSectionState(PlaylistSections.Metadata, {isDirty: this.metadataForm.dirty});
          this._playlistStore.playlist.name = form.name;
          this._playlistStore.playlist.description = form.description;
          if(form.tags) {
            this._playlistStore.playlist.tags = form.tags.join(', ');
          }
        }
      );
  }

  _searchTags(event) : void {
    this._tagsProvider.next({ suggestions : [], isLoading : true});

    if (this._searchTagsSubscription)
    {
      // abort previous request
      this._searchTagsSubscription.unsubscribe();
      this._searchTagsSubscription = null;
    }

    this._searchTagsSubscription = this._playlistStore.searchTags(event.query).subscribe(data => {
        const suggestions = [];
        const entryTags = this.metadataForm.value.tags || [];

        (data|| []).forEach(suggestedTag => {
          const isSelectable = !entryTags.find(tag => {
            return tag === suggestedTag;
          });
          suggestions.push({ item: suggestedTag, isSelectable: isSelectable});
        });
        this._tagsProvider.next({suggestions: suggestions, isLoading: false});
        this._playlistStore.updateSectionState(PlaylistSections.Metadata, {isDirty: this.metadataForm.dirty});
      },
      (err) => {
        this._tagsProvider.next({ suggestions : [], isLoading : false, errorMessage : <any>(err.message || err)});
      });
  }

  ngOnDestroy() {
    this._tagsProvider.complete();
    this._searchTagsSubscription && this._searchTagsSubscription.unsubscribe();
  }

  ngAfterViewInit() {}

}

