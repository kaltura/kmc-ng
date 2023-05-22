import {Injectable, IterableChangeRecord, IterableDiffer, IterableDiffers, OnDestroy} from '@angular/core';
import {
    CategoryEntryAddAction, CategoryEntryDeleteAction,
    CategoryEntryListAction, KalturaCategoryEntry,
    KalturaCategoryEntryFilter, KalturaLiveStreamEntry,
    KalturaMediaEntry,
    KalturaMultiRequest,
    KalturaRoomEntry
} from 'kaltura-ngx-client';
import { RoomWidget } from '../room-widget';
import {Observable, asyncScheduler, merge, of, forkJoin} from 'rxjs';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import { TagSearchAction, KalturaTagFilter, KalturaTaggedObjectType, KalturaFilterPager, KalturaClient } from 'kaltura-ngx-client';
import { KMCPermissions, KMCPermissionsService } from 'app-shared/kmc-shared/kmc-permissions';
import { ContentRoomViewSections } from 'app-shared/kmc-shared/kmc-views/details-views';
import {KalturaLogger} from '@kaltura-ng/kaltura-logger';
import { cancelOnDestroy, tag } from '@kaltura-ng/kaltura-common';
import {catchError, flatMap, map, observeOn, tap} from 'rxjs/operators';
import {CategoriesSearchService, CategoryData} from "app-shared/content-shared/categories/categories-search.service";
import {subApplicationsConfig} from "config/sub-applications";

@Injectable()
export class RoomMetadataWidget extends RoomWidget implements OnDestroy {
  public metadataForm: FormGroup;
  private _entryCategoriesDiffers : IterableDiffer<CategoryData>;
  public _entryCategories: CategoryData[]  = [];

  constructor(private _formBuilder: FormBuilder,
              private _permissionsService: KMCPermissionsService,
              private _iterableDiffers : IterableDiffers,
              private _categoriesSearchService : CategoriesSearchService,
              private _kalturaServerClient: KalturaClient,
              logger: KalturaLogger) {
    super(ContentRoomViewSections.Metadata, logger);
    this._buildForm();
  }

  ngOnDestroy() {

  }

  private _buildForm(): void {
      const categoriesValidator = (input: FormControl) => {
          const categoriesCount = (Array.isArray(input.value) ? input.value : []).length;
          const isCategoriesValid = this._permissionsService.hasPermission(KMCPermissions.FEATURE_DISABLE_CATEGORY_LIMIT)
              ? categoriesCount <= subApplicationsConfig.contentEntriesApp.maxLinkedCategories.extendedLimit
              : categoriesCount <= subApplicationsConfig.contentEntriesApp.maxLinkedCategories.defaultLimit;

          return isCategoriesValid ? null : { maxLinkedCategoriesExceed: true };
      };

    this.metadataForm = this._formBuilder.group({
      name: ['', Validators.required],
      description: '',
      tags: null,
      categories: [null, categoriesValidator]
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

      const metadataFormValue = this.metadataForm.value;
      newData.name = metadataFormValue.name;
      newData.description = metadataFormValue.description;
      newData.tags = (metadataFormValue.tags || []).join(',');

      // save changes in entry categories
      if (this._entryCategoriesDiffers) {
          const changes = this._entryCategoriesDiffers.diff(metadataFormValue.categories);

          if (changes)
          {
              changes.forEachAddedItem((change : IterableChangeRecord<CategoryData>) =>
              {
                  request.requests.push(new CategoryEntryAddAction({
                      categoryEntry : new KalturaCategoryEntry({
                          entryId : this.data.id,
                          categoryId : Number(change.item.id)
                      })
                  }));
              });

              changes.forEachRemovedItem((change : IterableChangeRecord<CategoryData>) =>
              {
                  request.requests.push(new CategoryEntryDeleteAction({
                      entryId : this.data.id,
                      categoryId : Number(change.item.id)
                  }));
              });
          }
      }
  }

  /**
   * Do some cleanups if needed once the section is removed
   */
  protected onReset(): void {
    this.metadataForm.reset();
  }

  protected onActivate(firstTimeActivating: boolean) : Observable<{failed : boolean}> {

      super._showLoader();
      super._removeBlockerMessage();

      if (!this._permissionsService.hasPermission(KMCPermissions.CONTENT_MANAGE_ASSIGN_CATEGORIES)) {
          this.metadataForm.get('categories').disable({ onlySelf: true });
      }

    this.metadataForm.reset({
      name: this.data.name,
      description: this.data.description,
      tags: this.data.tags ? this.data.tags.split(', ') : null,
      categories: this._entryCategories,
    });

    if (firstTimeActivating) {
      this._monitorFormChanges();
    }

      const actions: Observable<boolean>[] = [
          this._loadEntryCategories(this.data),
      ];

      return forkJoin(actions)
          .pipe(catchError(() => {
              return of([false]);
          }))
          .pipe(map(responses => {
              super._hideLoader();

              const isValid = responses.reduce(((acc, response) => (acc && response)), true);

              if (!isValid) {
                  super._showActivationError();
                  return {failed: true};
              } else {
                  try {
                      // the sync function is dealing with dynamically created forms so mistakes can happen
                      // as result of undesired metadata schema.
                      this._syncHandlerContent();
                      return {failed: false};
                  } catch (e) {
                      super._showActivationError();
                      return {failed: true, error: e};
                  }
              }
          }));

    // TODO [KMC] consider update permissions once available
    // if (!this._permissionsService.hasPermission(KMCPermissions.ROOM_UPDATE) {
    //   this.metadataForm.disable({ emitEvent: false, onlySelf: true });
    // }
  }

    private _syncHandlerContent()
    {
        this.metadataForm.reset(
            {
                name: this.data.name,
                description: this.data.description || null,
                tags: (this.data.tags ? this.data.tags.split(',').map(item => item.trim()) : null), // for backward compatibility we handle values separated with ',{space}'
                categories: this._entryCategories,
                offlineMessage: this.data instanceof KalturaLiveStreamEntry ? (this.data.offlineMessage || null) : '',
                referenceId: this.data.referenceId || null
            }
        );

        this._entryCategoriesDiffers = this._iterableDiffers.find([]).create<CategoryData>((index, item) =>
        {
            // use track by function to identify category by its' id. this will prevent sending add/remove of the same item once
            // a user remove a category and then re-select it before he clicks the save button.
            return item ? item.id : null;
        });
        this._entryCategoriesDiffers.diff(this._entryCategories);

        this._monitorFormChanges();
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

    private _loadEntryCategories(entry : KalturaRoomEntry) : Observable<boolean> {

        // update entry categories
        this._entryCategories = [];

        return this._kalturaServerClient.request(
            new CategoryEntryListAction(
                {
                    filter: new KalturaCategoryEntryFilter({
                        entryIdEqual: entry.id
                    }),
                    pager: new KalturaFilterPager({
                        pageSize: 500
                    })
                }
            ))
            .pipe(flatMap(response => {
                const categoriesList = response.objects.map(category => category.categoryId);

                if (categoriesList.length) {
                    return this._categoriesSearchService.getCategories(categoriesList);
                } else {
                    return of({items: []});
                }
            }))
            .pipe(cancelOnDestroy(this, this.widgetReset$))
            .pipe(tap(
                categories =>
                {
                    this._entryCategories = categories.items;
                }
            ))
            .pipe(map(response => true))
            .pipe(catchError((error) => {
                this._logger.error('failed to load entry categories', error);
                return of(false);
            }));
    }

    public searchCategories(text : string)
    {
        return Observable.create(
            observer => {

                const requestSubscription = this._categoriesSearchService.getSuggestions(text)
                    .pipe(cancelOnDestroy(this, this.widgetReset$))
                    .subscribe(
                        result =>
                        {
                            observer.next(result);
                            observer.complete();
                        },
                        err =>
                        {
                            observer.error(err);
                        }
                    );

                return () =>
                {
                    console.log("entryMetadataHandler.searchTags(): cancelled");
                    requestSubscription.unsubscribe();
                }
            });
    }

}
