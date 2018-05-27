import { Component,  QueryList, ViewChildren, ElementRef, Inject, ViewChild, AfterViewInit,OnInit, OnDestroy } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';

import { Subject } from 'rxjs/Subject';
import { SuggestionsProviderData } from '@kaltura-ng/kaltura-primeng-ui/auto-complete';
import { PopupWidgetComponent, PopupWidgetStates } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';

import { MenuItem } from 'primeng/primeng';
import { ISubscription } from 'rxjs/Subscription';
import { EntryMetadataWidget } from './entry-metadata-widget.service';
import { PageScrollService, PageScrollInstance } from 'ng2-page-scroll';
import { JumpToSection } from './jump-to-section.component';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';
import { CategoryTooltipPipe } from 'app-shared/content-shared/categories/category-tooltip.pipe';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { BrowserService } from 'app-shared/kmc-shell';
import { CategoriesStatusMonitorService, CategoriesStatus } from 'app-shared/content-shared/categories-status/categories-status-monitor.service';
import { KMCPermissions, KMCPermissionsService } from 'app-shared/kmc-shared/kmc-permissions';
import { subApplicationsConfig } from 'config/sub-applications';
import {
    EntriesManualExecutionModeToken,
    EntriesStore
} from 'app-shared/content-shared/entries/entries-store/entries-store.service';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';

@Component({
    selector: 'kEntryMetadata',
    templateUrl: './entry-metadata.component.html',
    styleUrls: ['./entry-metadata.component.scss'],
    providers: [
        EntriesStore,
        { provide: EntriesManualExecutionModeToken, useValue: false},
        KalturaLogger.createLogger('EntryMetadata')
    ]
})
export class EntryMetadata implements AfterViewInit, OnInit, OnDestroy {

    private _categoriesLocked = false;
    private _searchCategoriesSubscription : ISubscription;
    private _searchTagsSubscription : ISubscription;
    public _categoriesProvider = new Subject<SuggestionsProviderData>();
    public _tagsProvider = new Subject<SuggestionsProviderData>();
    public _kmcPermissions = KMCPermissions;
	public _jumpToMenu: MenuItem[] = [];
	@ViewChild('categoriesPopup') public categoriesPopup: PopupWidgetComponent;
	private _popupStateChangeSubscribe: ISubscription;
    @ViewChildren(JumpToSection) private _jumpToSectionQuery : QueryList<JumpToSection> = null;

	@ViewChild('metadataContainer')
	public _container: ElementRef;

    @ViewChild('nameField') private nameField: ElementRef;

    private _categoriesTooltipPipe: CategoryTooltipPipe;
    public _categoriesTooltipResolver = (value: any) => {
        return this._categoriesTooltipPipe.transform(value);
    };

    public get _categoriesErrorMessage(): string {
        const limit = this._permissionsService.hasPermission(KMCPermissions.FEATURE_DISABLE_CATEGORY_LIMIT)
            ? subApplicationsConfig.contentEntriesApp.maxLinkedCategories.extendedLimit
            : subApplicationsConfig.contentEntriesApp.maxLinkedCategories.defaultLimit;
        return this._appLocalization.get('applications.content.entryDetails.metadata.maxCategoriesLinked', [limit]);
    }

    constructor(public _widgetService: EntryMetadataWidget,
                private _pageScrollService: PageScrollService,
                private _appLocalization: AppLocalization,
                private _browserService: BrowserService,
                private _permissionsService: KMCPermissionsService,
                private _categoriesStatusMonitorService: CategoriesStatusMonitorService,
                private _logger: KalturaLogger,
                @Inject(DOCUMENT) private document: any) {
        this._categoriesTooltipPipe  = new CategoryTooltipPipe(this._appLocalization);
    }

    ngOnInit() {
        this._widgetService.attachForm();

        this._widgetService.data$.subscribe(
            data => {
                if (data) {
                    setTimeout(()=>{
                        if (this.nameField) {
                            this.nameField.nativeElement.focus(); // use timeout to allow data binding of ngIf to update the DOM
                        }
                    },0);

                }
            }
        );

        this._categoriesStatusMonitorService.status$
		    .cancelOnDestroy(this)
		    .subscribe((status: CategoriesStatus) => {
                this._categoriesLocked = status.lock;
            });
    }

    _searchTags(event) : void {
        this._logger.info(`handle search tags action by user`, { query: event.query });
        this._tagsProvider.next({ suggestions : [], isLoading : true});

        if (this._searchTagsSubscription)
        {
            // abort previous request
            this._searchTagsSubscription.unsubscribe();
            this._searchTagsSubscription = null;
        }

        this._searchTagsSubscription = this._widgetService.searchTags(event.query).subscribe(data => {
                this._logger.info(`handle successful search tags action by user`);
                const suggestions = [];
                const entryTags = this._widgetService.metadataForm.value.tags || [];

                (data|| []).forEach(suggestedTag => {
                    const isSelectable = !entryTags.find(tag => {
                        return tag === suggestedTag;
                    });
                    suggestions.push({ item: suggestedTag, isSelectable: isSelectable});
                });
                this._tagsProvider.next({suggestions: suggestions, isLoading: false});
            },
            (err) => {
                this._logger.info(`handle failed search tags action by user`, { errorMessage: err.message });
                this._tagsProvider.next({ suggestions : [], isLoading : false, errorMessage : <any>(err.message || err)});
            });
    }

    _searchCategories(event) : void {
        this._logger.info(`handle search categories action by user`, { query: event.query });
        this._categoriesProvider.next({ suggestions : [], isLoading : true});

        if (this._searchCategoriesSubscription)
        {
            // abort previous request
            this._searchCategoriesSubscription.unsubscribe();
            this._searchCategoriesSubscription = null;
        }

        this._searchCategoriesSubscription = this._widgetService.searchCategories(event.query).subscribe(data => {
            this._logger.info(`handle successful search categories action`);
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
                this._logger.warn(`handle failed search categories action`, { errorMessage: err.message });
                this._categoriesProvider.next({ suggestions : [], isLoading : false, errorMessage : <any>(err.message || err)});
            });
    }

    ngOnDestroy() {
        this._tagsProvider.complete();
        this._categoriesProvider.complete();
        this._searchTagsSubscription && this._searchTagsSubscription.unsubscribe();
        this._searchCategoriesSubscription && this._searchCategoriesSubscription.unsubscribe();
	    this._popupStateChangeSubscribe && this._popupStateChangeSubscribe.unsubscribe();

        this._widgetService.detachForm();
    }

    private _updateJumpToSectionsMenu()
    {
        const jumpToItems: any[] = [];

        this._jumpToSectionQuery.forEach(section =>
        {
            const jumpToLabel = section.label;
            jumpToItems.push({
                label: jumpToLabel,
                command: (event) => {
                    this._jumpTo(section.htmlElement);
                }
            });

        });

        setTimeout(() =>{
            this._jumpToMenu = jumpToItems;
        });
    }

    ngAfterViewInit() {

	    if (this.categoriesPopup) {
		    this._popupStateChangeSubscribe = this.categoriesPopup.state$
			    .subscribe(event => {
				    if (event.state === PopupWidgetStates.Close) {
					    if (event.context && event.context.isDirty){
						   this._widgetService.setDirty();
					    }
				    }
			    });
	    }

        this._jumpToSectionQuery.changes
            .cancelOnDestroy(this)
            .subscribe((query) => {
                this._updateJumpToSectionsMenu();
        });

        this._updateJumpToSectionsMenu();
    }

    _updateEntryCategories($event : any) : void{
        if ($event && $event instanceof Array)
        {
            this._widgetService.metadataForm.patchValue({ categories : $event});
            this._widgetService.metadataForm.get('categories').markAsTouched();
        }
    }

    private _jumpTo(element : HTMLElement){
        this._logger.info(`handle jump to action by user`);
        let pageScrollInstance: PageScrollInstance = PageScrollInstance.newInstance({
         document : this.document,
            scrollTarget : element,
            pageScrollOffset: 105
        });
        this._pageScrollService.start(pageScrollInstance);
    }

    openCategoriesBrowser(){
        this._logger.info(`handle open categories browser action by user`);
        if (this._categoriesLocked){
            this._logger.info(`categories are locked for user, abort action, show alert`);
            this._browserService.alert({
                header: this._appLocalization.get('applications.content.categories.categoriesLockTitle'),
                message: this._appLocalization.get('applications.content.categories.categoriesLockMsg')
            });
        }else{
            this.categoriesPopup.open();
        }
    }


}

