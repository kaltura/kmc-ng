import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { RoomMetadataWidget } from './room-metadata-widget.service';
import { Subject } from 'rxjs';
import { SuggestionsProviderData } from '@kaltura-ng/kaltura-primeng-ui';
import { ISubscription } from 'rxjs/Subscription';
import {KMCPermissions, KMCPermissionsService} from "app-shared/kmc-shared/kmc-permissions";
import { cancelOnDestroy } from "@kaltura-ng/kaltura-common";
import { CategoriesStatus, CategoriesStatusMonitorService } from "app-shared/content-shared/categories-status/categories-status-monitor.service";
import { BrowserService } from "app-shared/kmc-shell";
import { AppLocalization } from "@kaltura-ng/mc-shared";
import { PopupWidgetComponent } from "@kaltura-ng/kaltura-ui";
import {CategoryTooltipPipe} from "app-shared/content-shared/categories/category-tooltip.pipe";
import {subApplicationsConfig} from "config/sub-applications";

@Component({
  selector: 'kRoomMetadata',
  templateUrl: './room-metadata.component.html',
  styleUrls: ['./room-metadata.component.scss']
})

export class RoomMetadataComponent implements AfterViewInit, OnInit, OnDestroy {
  private _searchTagsSubscription: ISubscription;
  private _categoriesLocked = false;
  private _searchCategoriesSubscription : ISubscription;

  public _tagsProvider = new Subject<SuggestionsProviderData>();
  public _categoriesProvider = new Subject<SuggestionsProviderData>();
  public _kmcPermissions = KMCPermissions;

  @ViewChild('metadataNameInput', { static: true }) public metadataNameInput;
  @ViewChild('categoriesPopup', { static: true }) public categoriesPopup: PopupWidgetComponent;


  private _categoriesTooltipPipe: CategoryTooltipPipe;
  public _categoriesTooltipResolver = (value: any) => {
    return this._categoriesTooltipPipe.transform(value);
  };

  constructor (
      public _widgetService: RoomMetadataWidget,
      private _browserService: BrowserService,
      private _appLocalization: AppLocalization,
      private _permissionsService: KMCPermissionsService,
      private _categoriesStatusMonitorService: CategoriesStatusMonitorService)
  {
      this._categoriesTooltipPipe  = new CategoryTooltipPipe(this._appLocalization);
  }

  ngOnInit() {
    this._widgetService.attachForm();

      this._categoriesStatusMonitorService.status$
          .pipe(cancelOnDestroy(this))
          .subscribe((status: CategoriesStatus) => {
              this._categoriesLocked = status.lock;
          });
  }

  ngOnDestroy() {
    this._widgetService.detachForm();
    this._tagsProvider.complete();
    this._categoriesProvider.complete();
    this._searchCategoriesSubscription && this._searchCategoriesSubscription.unsubscribe();

    if (this._searchTagsSubscription) {
      this._searchTagsSubscription.unsubscribe();
    }
  }

  ngAfterViewInit() {
    this.metadataNameInput.nativeElement.focus();
  }

  public _searchTags(event): void {
    this._tagsProvider.next({ suggestions: [], isLoading: true });

    if (this._searchTagsSubscription) {
      // abort previous request
      this._searchTagsSubscription.unsubscribe();
      this._searchTagsSubscription = null;
    }

    this._searchTagsSubscription = this._widgetService.searchTags(event.query).subscribe(data => {
        const suggestions = [];
        const entryTags = this._widgetService.metadataForm.value.tags || [];

        (data || []).forEach(suggestedTag => {
          const isSelectable = !entryTags.find(tag => {
            return tag === suggestedTag;
          });
          suggestions.push({ item: suggestedTag, isSelectable: isSelectable });
        });
        this._tagsProvider.next({ suggestions: suggestions, isLoading: false });
      },
      (err) => {
        this._tagsProvider.next({ suggestions: [], isLoading: false, errorMessage: <any>(err.message || err) });
      });
  }

  public _trimNameValue(): void {
    const name = (this._widgetService.metadataForm.controls['name'].value || '').trim();
    this._widgetService.metadataForm.controls['name'].setValue(name);
  }

    openCategoriesBrowser(){
        if (this._categoriesLocked){
            this._browserService.alert({
                header: this._appLocalization.get('applications.content.categories.categoriesLockTitle'),
                message: this._appLocalization.get('applications.content.categories.categoriesLockMsg')
            });
        }else{
            this.categoriesPopup.open();
        }
    }

    _updateEntryCategories($event : any) : void{
        if ($event && $event instanceof Array)
        {
            this._widgetService.metadataForm.patchValue({ categories : $event});
            this._widgetService.metadataForm.get('categories').markAsTouched();
            this._widgetService.metadataForm.markAsDirty();
        }
    }

    _searchCategories(event) : void {
        this._categoriesProvider.next({ suggestions : [], isLoading : true});

        if (this._searchCategoriesSubscription)
        {
            // abort previous request
            this._searchCategoriesSubscription.unsubscribe();
            this._searchCategoriesSubscription = null;
        }

        this._searchCategoriesSubscription = this._widgetService.searchCategories(event.query).subscribe(data => {
                const suggestions = [];
                const entryCategories = this._widgetService.metadataForm.value.categories || [];


                (data|| []).forEach(suggestedCategory => {
                    const label = suggestedCategory.fullName + (suggestedCategory.referenceId ? ` (${suggestedCategory.referenceId})` : '');

                    const isSelectable = !entryCategories.find(category => {
                        return category.id === suggestedCategory.id;
                    });


                    suggestions.push({ name: label, isSelectable: isSelectable, item : suggestedCategory});
                });
                this._categoriesProvider.next({suggestions: suggestions, isLoading: false});
            },
            (err) => {
                this._categoriesProvider.next({ suggestions : [], isLoading : false, errorMessage : <any>(err.message || err)});
            });
    }

    public get _categoriesErrorMessage(): string {
        const limit = this._permissionsService.hasPermission(KMCPermissions.FEATURE_DISABLE_CATEGORY_LIMIT)
            ? subApplicationsConfig.contentEntriesApp.maxLinkedCategories.extendedLimit
            : subApplicationsConfig.contentEntriesApp.maxLinkedCategories.defaultLimit;
        return this._appLocalization.get('applications.content.entryDetails.metadata.maxCategoriesLinked', [limit]);
    }
}

