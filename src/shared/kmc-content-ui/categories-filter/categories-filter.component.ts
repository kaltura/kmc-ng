import { Component, OnInit, OnDestroy, EventEmitter, Output, ViewChild, Input, AfterViewInit, ElementRef} from '@angular/core';
import { Tree, TreeNode } from 'primeng/primeng';
import { PopupWidgetComponent, PopupWidgetStates } from '@kaltura-ng2/kaltura-ui/popup-widget/popup-widget.component';

import { Subscription} from 'rxjs/Subscription';
import * as R from 'ramda';

import { ContentCategoriesStore, Category } from 'kmc-content-ui/providers/content-categories-store.service';
import {BrowserService} from "../../kmc-shell/providers/browser.service";

@Component({
    selector: 'kCategoriesFilter',
    templateUrl: './categories-filter.component.html',
    styleUrls: ['./categories-filter.component.scss']
})
export class CategoriesFilterComponent implements OnInit, AfterViewInit, OnDestroy{

    loading = false;
    categories: any;
    categoriesSubscribe : Subscription;
    parentPopupStateChangeSubscribe : Subscription;
    selectedCategories: Category[] = [];
    categoriesMap: any = {};

    searchCategories = [];
    filteredSearchCategories = [];
    currentSearch: any;

    autoSelectChildren:string = 'false';
    lazyLoading: boolean = false;

    @Output()
    categoriesChanged = new EventEmitter<any>();

    @ViewChild(Tree) categoriesTree: Tree;

    @Input() parentPopupWidget: PopupWidgetComponent;

    constructor(public filtersRef: ElementRef, public contentCategoriesStore: ContentCategoriesStore, public browserService: BrowserService) {
    }

    ngOnInit() {
        this.categoriesSubscribe = this.contentCategoriesStore.categories$.subscribe(
            (categoriesRoot: any) => {
                this.categories = categoriesRoot.items ? categoriesRoot.items : [];
                this.categoriesMap = categoriesRoot.map ? categoriesRoot.map : {};
                this.createSearchCategories();
            },
            (error) => {
                // TODO [KMC] - handle error
            });
        this.reloadCategories(-1);

        const savedAutoSelectChildren: any = this.browserService.getFromLocalStorage("categoriesTree.autoSelectChildren");
        this.autoSelectChildren = savedAutoSelectChildren === null ? 'false' : savedAutoSelectChildren;
    }

    ngAfterViewInit(){
        if (this.parentPopupWidget){
            this.parentPopupStateChangeSubscribe = this.parentPopupWidget.state$.subscribe(event => {
                if (event === PopupWidgetStates.Open){
                    const inputFields: any[] = this.filtersRef.nativeElement.getElementsByTagName("input");
                    if (inputFields.length && inputFields[0].focus){
                        setTimeout(() => {
                            inputFields[0].focus();
                        },0);
                    }
                }
            });
        }
    }

    reloadCategories(parentNodeId: number){
        this.loading = true;
        this.contentCategoriesStore.reloadCategories(false, parentNodeId).subscribe(
            () => {
                this.loading = false;
            },
            (error) => {
                // TODO [KMC] - handle error
                this.loading = false;
            });
    }

    // create a flat array for all categories to be used by auto-complete search field
    createSearchCategories(){
        this.searchCategories = [];
        for (let id in this.categoriesMap){
            let category: Category = this.categoriesMap[id];
            let label = category.label;
            while (category.parentId !== 0 && this.categoriesMap[category.parentId]){
                category = this.categoriesMap[category.parentId];
                label = category.label + " > "+ label;
            }
            this.searchCategories.push({'label': label, 'id': id});
        }
    }

    categorySearch(event) {
        let query = event.query;
        this.filteredSearchCategories = [];
        this.searchCategories.forEach((category: Category) => {
            if(category.label.toLowerCase().indexOf(query.toLowerCase()) !== -1) {
                this.filteredSearchCategories.push(category);
            }
        });
    }

    categorySelected(event){
        this.categoriesTree.expandToNode(this.categoriesMap[event.id]);

        if (R.findIndex(R.propEq('id', parseInt(event.id)))(this.selectedCategories) === -1){
            if (this.autoSelectChildren === 'true'){
                this.categoriesTree.propagateSelectionDown(this.categoriesMap[event.id], true);
                if(this.categoriesMap[event.id].parent) {
                    this.categoriesTree.propagateSelectionUp(this.categoriesMap[event.id].parent, true);
                }
            }else{
                this.selectedCategories.push(this.categoriesMap[event.id]);
            }
            this.onCategorySelectionChange(null);
        }
        this.currentSearch = null;
    }

    onCategorySelectionChange(event){
        let selectedCategories: any[] = [];
        this.selectedCategories.forEach((category: Category) => {
            selectedCategories.push(category.id);
        });
        this.categoriesChanged.emit(selectedCategories);
    }

    clearAll(){
        this.selectedCategories = [];
        // clear all partial selections
        for (let key in this.categoriesMap){
            if (this.categoriesMap[key] && this.categoriesMap[key]['partialSelected']) {
                this.categoriesMap[key]['partialSelected'] = false;
            }
        }
        this.onCategorySelectionChange(null);
    }

    close(){
        if (this.parentPopupWidget){
            this.parentPopupWidget.close();
        }
    }
    ngOnDestroy(){
        if (this.parentPopupStateChangeSubscribe) {
            this.parentPopupStateChangeSubscribe.unsubscribe();
        }
        if (this.categoriesSubscribe) {
            this.categoriesSubscribe.unsubscribe();
        }
    }

}

