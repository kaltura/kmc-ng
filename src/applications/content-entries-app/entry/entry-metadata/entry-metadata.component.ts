import { Component,  QueryList, ViewChildren, ElementRef, Inject, ViewChild, AfterViewInit,OnInit, OnDestroy } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';

import { Subject } from 'rxjs/Subject';
import { SuggestionsProviderData } from '@kaltura-ng2/kaltura-primeng-ui/auto-complete';

import { MenuItem, Menu } from 'primeng/primeng';
import { ISubscription } from 'rxjs/Subscription';
import { AppLocalization } from '@kaltura-ng2/kaltura-common';
import { EntryMetadataHandler } from './entry-metadata-handler';
import { EntryStore } from '../entry-store.service';
import { PageScrollService, PageScrollInstance } from 'ng2-page-scroll';
import { JumpToSection } from './jump-to-section.component';
import '@kaltura-ng2/kaltura-common/rxjs/add/operators';
import { LinkedEntriesPopup } from './entry-selector/linked-entries-popup.component';

@Component({
    selector: 'kEntryMetadata',
    templateUrl: './entry-metadata.component.html',
    styleUrls: ['./entry-metadata.component.scss']
})
export class EntryMetadata implements AfterViewInit, OnInit, OnDestroy {

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
                private _pageScrollService: PageScrollService,
                @Inject(DOCUMENT) private document: any) {
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
        this._jumpToSectionQuery.changes
            .cancelOnDestroy(this)
            .subscribe((query) => {
                this._updateJumpToSectionsMenu();
        });

        this._updateJumpToSectionsMenu();
    }


    private _jumpTo(element : HTMLElement){
        let pageScrollInstance: PageScrollInstance = PageScrollInstance.newInstance({
         document : document,
            scrollTarget : element,
            scrollingViews : [this._container.nativeElement]
        });
        this._pageScrollService.start(pageScrollInstance);
    }


}

