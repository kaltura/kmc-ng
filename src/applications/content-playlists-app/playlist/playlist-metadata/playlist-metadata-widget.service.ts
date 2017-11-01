import { Injectable, OnDestroy } from '@angular/core';
import { KalturaRequest } from 'kaltura-typescript-client';

import 'rxjs/add/observable/forkJoin';
import { PlaylistWidget } from '../playlist-widget';
import { PlaylistWidgetKeys } from '../playlist-widget-keys';
import { KalturaPlaylist } from 'kaltura-typescript-client/types/KalturaPlaylist';
import { PlaylistStore } from '../playlist-store.service';
import { Observable } from 'rxjs/Observable';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TagSearchAction } from 'kaltura-typescript-client/types/TagSearchAction';
import { KalturaTagFilter } from 'kaltura-typescript-client/types/KalturaTagFilter';
import { KalturaTaggedObjectType } from 'kaltura-typescript-client/types/KalturaTaggedObjectType';
import { KalturaFilterPager } from 'kaltura-typescript-client/types/KalturaFilterPager';
import { KalturaClient } from '@kaltura-ng/kaltura-client';

@Injectable()
export class PlaylistMetadataWidget extends PlaylistWidget implements OnDestroy {
  public metadataForm: FormGroup;

  constructor(private _playlistStore: PlaylistStore,
              private _formBuilder: FormBuilder,
              private _kalturaServerClient: KalturaClient) {
    super(PlaylistWidgetKeys.Metadata);
    this._buildForm();
  }

  ngOnDestroy() {

  }

  private _buildForm(): void {
    this.metadataForm = this._formBuilder.group({
      name: ['', Validators.required],
      description: '',
      tags: null
    });
  }

  private _monitorFormChanges(): void {
    Observable.merge(this.metadataForm.valueChanges, this.metadataForm.statusChanges)
      .cancelOnDestroy(this)
      .subscribe(() => {
          super.updateState({
            isValid: this.metadataForm.status === 'VALID',
            isDirty: this.metadataForm.dirty
          });
        }
      );
  }

  protected onDataSaving(data: KalturaPlaylist, request: KalturaRequest<KalturaPlaylist>): void {
    const metadataFormValue = this.metadataForm.value;

    // save static metadata form
    data.name = metadataFormValue.name;
    data.description = metadataFormValue.description;
    data.tags = (metadataFormValue.tags || []).join(',');
  }

  /**
   * Do some cleanups if needed once the section is removed
   */
  protected onReset(): void {
    this.metadataForm.reset();
  }

  protected onActivate(): Observable<{ failed: boolean, error?: Error }> {
    super._showLoader();

    return this._playlistStore.playlist$
      .cancelOnDestroy(this, this.widgetReset$)
      .map(({ playlist }) => {
        this.metadataForm.reset({
          name: playlist.name,
          description: playlist.description,
          tags: playlist.tags ? playlist.tags.split(', ') : null
        });
        super._hideLoader();
        this._monitorFormChanges();
        return { failed: false };
      })
      .catch(error => {
        super._hideLoader();
        super._showActivationError();
        return Observable.of({ failed: true, error });
      });
  }

  public searchTags(text: string): Observable<string[]> {
    return Observable.create(
      observer => {
        const requestSubscription = this._kalturaServerClient.request(
          new TagSearchAction(
            {
              tagFilter: new KalturaTagFilter(
                {
                  tagStartsWith: text,
                  objectTypeEqual: KalturaTaggedObjectType.entry
                }
              ),
              pager: new KalturaFilterPager({
                pageIndex: 0,
                pageSize: 30
              })
            }
          )
        )
          .cancelOnDestroy(this)
          .monitor('search tags')
          .subscribe(
            result => {
              const tags = result.objects.map(item => item.tag);
              observer.next(tags);
              observer.complete();
            },
            err => {
              observer.error(err);
            }
          );

        return () => {
          console.log('entryMetadataHandler.searchTags(): cancelled');
          requestSubscription.unsubscribe();
        }
      });
  }

}
