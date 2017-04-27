import { Component,  QueryList, ViewChildren, ElementRef, Inject, ViewChild, AfterViewInit,OnInit, OnDestroy } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';

import { Subject } from 'rxjs/Subject';
import { SuggestionsProviderData } from '@kaltura-ng2/kaltura-primeng-ui/auto-complete';

import { MenuItem, Menu } from 'primeng/primeng';
import { ISubscription } from 'rxjs/Subscription';
import { AppLocalization } from '@kaltura-ng2/kaltura-common';
import { EntryMetadataHandler } from './entry-metadata-handler';
import { EntryStore } from '../../entry-store/entry-store.service';
import { PageScrollService, PageScrollInstance } from 'ng2-page-scroll';
import { JumpToSection } from './jump-to-section.component';
import '@kaltura-ng2/kaltura-common/rxjs/add/operators';

@Component({
    selector: 'kEntryMetadata',
    templateUrl: './entry-metadata.component.html',
    styleUrls: ['./entry-metadata.component.scss']
})
export class EntryMetadata implements AfterViewInit, OnInit, OnDestroy {

	// temp arrays for custom metadata [TODO] - remove
	textItems = ["item 1", "item 2", "item 3"];
	dateItems = ["item", "item", "item"];
	groups = ["group"];
	listItems = [{"label": "list item 1", "value" : 1}, {"label": "list item 2", "value" : 2}, {"label": "list item 3", "value" : 3}];
	entries = ["Entry 1", "Entry 2", "Entry 3"];
	selectedEntries = [];

    private _searchCategoriesSubscription : ISubscription;
    private _searchTagsSubscription : ISubscription;
    public _categoriesProvider = new Subject<SuggestionsProviderData>();
    public _tagsProvider = new Subject<SuggestionsProviderData>();
	public _jumpToMenu: MenuItem[] = [];
   @ViewChildren(JumpToSection) private _jumpToSectionQuery : QueryList<JumpToSection> = null;

	@ViewChild('metadataContainer')
	public _container : ElementRef;


    constructor(private _appLocalization: AppLocalization,
                public _handler : EntryMetadataHandler,
                private _thisElement : ElementRef,
                private _pageScrollService: PageScrollService,
                @Inject(DOCUMENT) private document: any,
                private _entryStore : EntryStore) {
    }



    ngOnInit() {

    }



    _searchTags(event) : void {
        this._tagsProvider.next({ suggestions : [], isLoading : true});

        if (this._searchTagsSubscription)
        {
            // abort previous request
            this._searchTagsSubscription.unsubscribe();
            this._searchTagsSubscription = null;
        }

        this._searchTagsSubscription = this._handler.searchTags(event.query).subscribe(data => {
                const suggestions = [];
                const entryTags = this._handler.metadataForm.value.tags || [];

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

        this._searchCategoriesSubscription = this._handler.searchCategories(event.query).subscribe(data => {
                const suggestions = [];
                const entryCategories = this._handler.metadataForm.value.categories || [];


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
    }


    ngAfterViewInit() {
        this._jumpToSectionQuery.changes
            .cancelOnDestroy(this)
            .subscribe((query) => {
            const jumpToItems: any[] = [];

            if (query) {
                query.forEach((section) => {
                    const jumpToLabel = section.label;
                    jumpToItems.push({
                        label: jumpToLabel,
                        command: (event) => {
                            this._jumpTo(section);
                        }
                    });

                });
            }

            setTimeout(() =>{
                this._jumpToMenu = jumpToItems;
            });

        });
    }

    private _jumpTo(element : HTMLElement){
        let pageScrollInstance: PageScrollInstance = PageScrollInstance.newInstance({
         document : document,
            scrollTarget : element,
            scrollingViews : [this._container.nativeElement]
        });
        this._pageScrollService.start(pageScrollInstance);
    }

    _onLoadingAction(actionKey: string) {
        if (actionKey === 'retry') {

        }
    }
}

