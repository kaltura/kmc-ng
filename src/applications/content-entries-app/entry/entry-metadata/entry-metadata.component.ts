import { Component,  QueryList, ViewChildren, ElementRef, Inject, ViewChild, AfterViewInit,OnInit, OnDestroy } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';

import { Subject } from 'rxjs/Subject';
import { SuggestionsProviderData } from '@kaltura-ng/kaltura-primeng-ui/auto-complete';
import { PopupWidgetComponent, PopupWidgetStates } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';

import { MenuItem } from 'primeng/primeng';
import { ISubscription } from 'rxjs/Subscription';
import { EntryMetadataWidget, EntryCategoryItem } from './entry-metadata-widget.service';
import { PageScrollService, PageScrollInstance } from 'ng2-page-scroll';
import { JumpToSection } from './jump-to-section.component';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';


@Component({
    selector: 'kEntryMetadata',
    templateUrl: './entry-metadata.component.html',
    styleUrls: ['./entry-metadata.component.scss']
})
export class EntryMetadata implements AfterViewInit, OnInit, OnDestroy {

    public _categoriesSelectorValue : EntryCategoryItem[] = [];
    private _searchCategoriesSubscription : ISubscription;
    private _searchTagsSubscription : ISubscription;
    public _categoriesProvider = new Subject<SuggestionsProviderData>();
    public _tagsProvider = new Subject<SuggestionsProviderData>();
	public _jumpToMenu: MenuItem[] = [];
	@ViewChild('categoriesPopup') public categoriesPopup: PopupWidgetComponent;
	private _popupStateChangeSubscribe: ISubscription;
    @ViewChildren(JumpToSection) private _jumpToSectionQuery : QueryList<JumpToSection> = null;

	@ViewChild('metadataContainer')
	public _container : ElementRef;

    @ViewChild('nameField') private nameField: ElementRef;

    constructor(public _widgetService: EntryMetadataWidget,
                private _pageScrollService: PageScrollService,
                @Inject(DOCUMENT) private document: any) {
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
    }

    _searchTags(event) : void {
        this._tagsProvider.next({ suggestions : [], isLoading : true});

        if (this._searchTagsSubscription)
        {
            // abort previous request
            this._searchTagsSubscription.unsubscribe();
            this._searchTagsSubscription = null;
        }

        this._searchTagsSubscription = this._widgetService.searchTags(event.query).subscribe(data => {
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
                this._tagsProvider.next({ suggestions : [], isLoading : false, errorMessage : <any>(err.message || err)});
            });
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
                    const label = suggestedCategory.fullNamePath.join(' > ') + (suggestedCategory.referenceId ? ` (${suggestedCategory.referenceId})` : '');

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
        }
    }

    private _jumpTo(element : HTMLElement){
        let pageScrollInstance: PageScrollInstance = PageScrollInstance.newInstance({
         document : this.document,
            scrollTarget : element,
            pageScrollOffset: 105
        });
        this._pageScrollService.start(pageScrollInstance);
    }


}

