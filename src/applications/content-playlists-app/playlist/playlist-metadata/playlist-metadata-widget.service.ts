import { Injectable, OnDestroy } from '@angular/core';
import { KalturaMultiRequest } from 'kaltura-typescript-client';
import { PlaylistWidget } from '../playlist-widget';
import { PlaylistWidgetKeys } from '../playlist-widget-keys';
import { KalturaPlaylist } from 'kaltura-typescript-client/types/KalturaPlaylist';
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

  constructor(private _formBuilder: FormBuilder,
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

  protected onValidate(wasActivated: boolean): Observable<{ isValid: boolean }> {
    const name = wasActivated ? this.metadataForm.value.name : this.data.name;
    return Observable.of({
      isValid: !!name.trim()
    });
  }

  protected onDataSaving(newData: KalturaPlaylist, request: KalturaMultiRequest): void {
    if (this.wasActivated) {
      const metadataFormValue = this.metadataForm.value;
      newData.name = metadataFormValue.name;
      newData.description = metadataFormValue.description;
      newData.tags = (metadataFormValue.tags || []).join(',');
    } else {
      newData.name = this.data.name;
      newData.description = this.data.description;
      newData.tags = this.data.tags;
    }
  }

  /**
   * Do some cleanups if needed once the section is removed
   */
  protected onReset(): void {
    this.metadataForm.reset();
  }

  protected onActivate(firstTimeActivating: boolean): void {
    this.metadataForm.reset({
      name: this.data.name,
      description: this.data.description,
      tags: this.data.tags ? this.data.tags.split(', ') : null
    });

    if (firstTimeActivating) {
      this._monitorFormChanges();
    }
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
