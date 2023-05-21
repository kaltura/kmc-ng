import { Injectable, OnDestroy } from '@angular/core';
import {KalturaMultiRequest, KalturaRoomEntry} from 'kaltura-ngx-client';
import { RoomWidget } from '../room-widget';
import { Observable, asyncScheduler, merge, of } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TagSearchAction, KalturaTagFilter, KalturaTaggedObjectType, KalturaFilterPager, KalturaClient } from 'kaltura-ngx-client';
import { KMCPermissions, KMCPermissionsService } from 'app-shared/kmc-shared/kmc-permissions';
import { ContentRoomViewSections } from 'app-shared/kmc-shared/kmc-views/details-views';
import {KalturaLogger} from '@kaltura-ng/kaltura-logger';
import { cancelOnDestroy, tag } from '@kaltura-ng/kaltura-common';
import { observeOn } from 'rxjs/operators';

@Injectable()
export class RoomMetadataWidget extends RoomWidget implements OnDestroy {
  public metadataForm: FormGroup;

  constructor(private _formBuilder: FormBuilder,
              private _permissionsService: KMCPermissionsService,
              private _kalturaServerClient: KalturaClient,
              logger: KalturaLogger) {
    super(ContentRoomViewSections.Metadata, logger);
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
    merge(this.metadataForm.valueChanges, this.metadataForm.statusChanges)
      .pipe(cancelOnDestroy(this))
        .pipe(observeOn(asyncScheduler)) // using async scheduler so the form group status/dirty mode will be synchornized
      .subscribe(() => {
          super.updateState({
            isValid: this.metadataForm.status !== 'INVALID',
            isDirty: this.metadataForm.dirty
          });
        }
      );
  }

  protected onValidate(wasActivated: boolean): Observable<{ isValid: boolean }> {
      const name = wasActivated ? this.metadataForm.value.name : this.data.name;
      const hasValue = (name || '').trim() !== '';
      return of({
          isValid: hasValue
      });
  }

  protected onDataSaving(newData: KalturaRoomEntry, request: KalturaMultiRequest): void {
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

    // TODO [KMC] consider update permissions once available
    // if (!this._permissionsService.hasPermission(KMCPermissions.ROOM_UPDATE) {
    //   this.metadataForm.disable({ emitEvent: false, onlySelf: true });
    // }
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
          .pipe(cancelOnDestroy(this))
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
