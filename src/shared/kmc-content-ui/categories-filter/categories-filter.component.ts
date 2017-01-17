import { Component, OnInit, OnDestroy, EventEmitter, Output, ViewChild, Input, IterableDiffer, IterableDiffers, AfterViewInit, ElementRef} from '@angular/core';
import { Tree } from 'primeng/primeng';
import {PrimeTreeNode, TreeDataHandler} from '@kaltura-ng2/kaltura-primeng-ui';
import { PopupWidgetComponent, PopupWidgetStates } from '@kaltura-ng2/kaltura-ui/popup-widget/popup-widget.component';

import { Subscription} from 'rxjs/Subscription';
import * as R from 'ramda';

import { CategoriesStore, Category } from '../categories-store.service';
import {BrowserService} from "../../kmc-shell/providers/browser.service";

@Component({
    selector: 'kCategoriesFilter',
    templateUrl: './categories-filter.component.html',
    styleUrls: ['./categories-filter.component.scss']
})
export class CategoriesFilterComponent implements OnInit, AfterViewInit, OnDestroy{

    private loading = false;
    private categories: PrimeTreeNode[] = [];
    private categoriesSubscription : Subscription;
    private filterUpdateSubscription : Subscription;
    private parentPopupStateChangeSubscription : Subscription;
    private selectedNodes: PrimeTreeNode[] = [];

    private currentSearch: any;

    private autoSelectChildren:string = 'false';
    private lazyLoading: boolean = false;

    private treeSelectionsDiffer : IterableDiffer = null;

    @ViewChild(Tree)
    private categoriesTree: Tree;

    @Input() parentPopupWidget: PopupWidgetComponent;

    constructor(public filtersRef: ElementRef, public categoriesStore: CategoriesStore, public browserService: BrowserService,
                private treeDataHandler : TreeDataHandler, private differs: IterableDiffers) {
    }

    ngOnInit() {
        // manage differences of selections
        this.treeSelectionsDiffer = this.differs.find([]).create(null);

        // update components when the active filter list is updated
        this.filterUpdateSubscription = this.entriesStore.runQuery$.subscribe(
            filter => {
                if (filter.removedFilters && filter.removedFilters.length > 0) {
                    // only removedFilters items should be handled (because relevant addedFilters filters are originated from this component)
                    this.syncTreeComponents(filter.removedFilters);
                }
            }
        );

        this.categoriesSubscription = this.categoriesStore.categories$.subscribe(
            (result: any) => {
                this.categories = this.treeDataHandler.create(
                    {
                        data: result.categories,
                        idProperty: 'id',
                        nameProperty: 'name'
                    }
                );
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
            this.parentPopupStateChangeSubscription = this.parentPopupWidget.state$.subscribe(event => {
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

    private syncTreeComponents(removedFilters : FilterItem[]) : void
    {
        // traverse on removed filters and update tree selection accordingly
        if (removedFilters)
        {
            const nodesToRemove : PrimeTreeNode[] = [];

            removedFilters.forEach(filter =>
            {
                if (filter instanceof ValueFilter && this.isFilterOriginatedByTreeComponent(filter))
                {
                    let nodeToRemove = R.find(R.propEq('data',filter.value),this.selectedNodes);

                    if (nodeToRemove && nodeToRemove.data === 'scheduled' && this.getScheduledFilter() !== null)
                    {
                        // 'scheduled' filter item has a special behavior. when a user modify the scheduled To/From dates
                        // a filter is being re-created. in such a scenario we don't want to remove the selection
                        nodeToRemove = null;
                    }

                    if (nodeToRemove)
                    {
                        nodesToRemove.push(nodeToRemove);
                    }
                }
            });

            if (nodesToRemove.length > 0)
            {
                this.selectedNodes = R.without(nodesToRemove,this.selectedNodes);
            }
        }
    }

    reloadCategories(parentNodeId: number){
        this.loading = true;
        this.categoriesStore.reloadCategories(false, parentNodeId).subscribe(
            () => {
                this.loading = false;
            },
            (error) => {
                // TODO [KMC] - handle error
                this.loading = false;
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
        if (this.parentPopupStateChangeSubscription) {
            this.parentPopupStateChangeSubscription.unsubscribe();
        }
        if (this.categoriesSubscription) {
            this.categoriesSubscription.unsubscribe();
        }
    }

}

