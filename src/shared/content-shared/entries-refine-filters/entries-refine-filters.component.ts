import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, Self, ViewChild } from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';

import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { PrimeTreeDataProvider, PrimeTreeNode } from '@kaltura-ng/kaltura-primeng-ui';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { environment } from 'app-environment';

import { PopupWidgetComponent, PopupWidgetStates } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';

// TODO sakal remove
import * as R from 'ramda';

import { EntriesRefineFiltersService } from './entries-refine-filters.service';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';
import { EntriesStore } from 'app-shared/content-shared/entries-store/entries-store.service';
import { TimeSchedulingFilter } from 'app-shared/content-shared/entries-store/filters/time-scheduling-filter';
import {
    EntriesFiltersStore
} from 'app-shared/content-shared/entries-store/entries-filters.service';
import { ScrollToTopContainerComponent } from '@kaltura-ng/kaltura-ui/components/scroll-to-top-container.component';

export interface FiltersGroupList {
  items: PrimeTreeNode[];
  selections: PrimeTreeNode[];
}

export interface FiltersGroup {
  label: string;
  lists: FiltersGroupList[];
}

@Component({
  selector: 'k-entries-refine-filters',
  templateUrl: './entries-refine-filters.component.html',
  styleUrls: ['./entries-refine-filters.component.scss']
})
export class EntriesRefineFiltersComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() parentPopupWidget: PopupWidgetComponent;
  @ViewChild(ScrollToTopContainerComponent) _treeContainer: ScrollToTopContainerComponent;


  private _filtersGroupListMapping: { [key: string]: FiltersGroupList } = {};

  // properties that are exposed to the template
  public _filtersGroupList: FiltersGroup[] = [];

  public _showLoader = false;
  public _blockerMessage: AreaBlockerMessage = null;
  public _createdFilterError: string = null;
  public _scheduledAfter: Date;
  public _scheduledBefore: Date;
  public _scheduledFilterError: string = null;
  public _createdAtDateRange: string = environment.modules.contentEntries.createdAtDateRange;
  public _createdAfter: Date;
  public _createdBefore: Date;


  constructor(private _entriesRefineFilters: EntriesRefineFiltersService,
              private _store: EntriesFiltersStore,
              private _primeTreeDataProvider: PrimeTreeDataProvider,
              private _entriesStore: EntriesStore,
              private _appLocalization: AppLocalization) {
  }

  ngOnInit() {
      this._registerToRefineFiltersService();
      this._restoreFiltersState();
      this._registerToFilterStoreDataChanges();
  }

  ngAfterViewInit() {
    if (this.parentPopupWidget) {
      this.parentPopupWidget.state$
          .cancelOnDestroy(this).subscribe(event => {
        if (event.state === PopupWidgetStates.Close && this._treeContainer) {
          this._treeContainer.scrollToTop();
        }
      });
    }
  }

  ngOnDestroy() {

  }

    private _registerToFilterStoreDataChanges(): void {
        this._store.dataChanges$
            .cancelOnDestroy(this)
            .subscribe(
                changes => {

                    if (typeof changes.createdAt !== 'undefined') {
                        this._createdAfter = changes.createdAt.currentValue ? changes.createdAt.currentValue.fromDate : null;
                        this._createdBefore = changes.createdAt.currentValue ? changes.createdAt.currentValue.toDate : null;
                    }
                    // TODO sakal split to smaller functions
                    if (typeof changes.mediaTypes !== 'undefined') {
                        // TODO sakal
                        const treeData = this._filtersGroupListMapping['Media Types'];
                        const currentValue = this._store.getFilterData('mediaTypes');

                        // TODO remove <any>
                        const diff = this._store.getDiff(treeData.selections, 'data', currentValue, 'value');

                        diff.added.forEach(addedItem => {
                            // TODO remove <any>
                            const matchingItem = treeData.items.find(item => item.data === (<any>addedItem).value);
                            treeData.selections.push(matchingItem);
                        });

                        diff.deleted.forEach(removedItem => {
                            treeData.selections.splice(
                                treeData.selections.indexOf(removedItem),
                                1
                            );
                        });
                    }
                }
            );
    }

    private _restoreFiltersState(): void{
        const createdAt = this._store.getFilterData('createdAt');
        if (createdAt) {
            this._createdAfter = createdAt.fromDate;
            this._createdBefore = createdAt.toDate;
        }

        // TODO sakal get filter data of mediatypes

    }

    private _registerToRefineFiltersService(): void {
    this._entriesRefineFilters.status$
      .cancelOnDestroy(this)
      .subscribe(
        result => {
          this._showLoader = result.loading;

          if (result.errorMessage) {
            this._blockerMessage = new AreaBlockerMessage({
              message: result.errorMessage || 'Error loading filters',
              buttons: [{
                label: 'Retry',
                action: () => {
                  this._entriesRefineFilters.load();
                }
              }
              ]
            })
          } else {
            this._blockerMessage = null;
          }
        },
        error => {
          console.warn('[kmcng] -> could not load entries'); // navigate to error page
          throw error;
        });

    this._entriesRefineFilters.groups$
      .cancelOnDestroy(this)
      .subscribe(
        (groups) => {
          this._filtersGroupListMapping = {};
          this._filtersGroupList = [];

          // create root nodes
          groups.forEach(group => {
            const filtersGroup = { label: group.label, lists: [] };
            this._filtersGroupList.push(filtersGroup);

            group.lists.forEach(groupList => {

              if (groupList.items.length > 0) {
                const treeData = { items: [], selections: []};

                this._filtersGroupListMapping[groupList.name] = treeData;
                filtersGroup.lists.push(treeData);

                const listRootNode = new PrimeTreeNode(null, groupList.label, [], null, { filterName: groupList.name });

                this._primeTreeDataProvider.create(
                  {
                    items: groupList.items,
                    idProperty: 'value',
                    rootParent: listRootNode,
                    nameProperty: 'label',
                    payload: { filterName: groupList.name },
                    preventSort: true
                  }
                );

                treeData.items.push(listRootNode);
              }
            });

          });
        },
        (error) => {
          // TODO [kmc] navigate to error page
          throw error;
        });
  }

  /**
   * Update content created components when filters are modified somewhere outside of this component
   * @private
   */
  private syncScheduledComponents(): void {
    // TODO sakal
    // const scheduledFilterItem = this._getScheduledFilter();
    //
    // if (scheduledFilterItem !== null) {
    //   this._scheduledSelected = true;
    //   this._scheduledAfter = scheduledFilterItem.scheduledAfter;
    //   this._scheduledBefore = scheduledFilterItem.scheduledBefore;
    // } else {
    //   this._scheduledBefore = null;
    //   this._scheduledAfter = null;
    //   this._scheduledSelected = false;
    // }
  }


  /**
   * Update entries store filters with changes in the content scheduling components
   * @private
   */
  private syncSchedulingFilters(): boolean {
      // TODO sakal scheduling
    // this._scheduledFilterError = null;
    // if (this._scheduledBefore && this._scheduledAfter) {
    //   const isValid = this._scheduledAfter <= this._scheduledBefore;
    //
    //   if (!isValid) {
    //     setTimeout(this.syncScheduledComponents.bind(this), 0);
    //
    //     this._scheduledFilterError = this.appLocalization.get('applications.content.entryDetails.errors.schedulingError');
    //     return false;
    //   }
    // }
    //
    // const previousFilter = <TimeSchedulingFilter>this.entriesStore.getFiltersByType(TimeSchedulingFilter)
    //   .find(filter => filter.value === 'scheduled');
    //
    // if (previousFilter) {
    //   // make sure the filter is already set for 'schedule', otherwise ignore update
    //   this.entriesStore.removeFilters(previousFilter);
    //   this.entriesStore.addFilters(
    //     new TimeSchedulingFilter(
    //       previousFilter.value,
    //       previousFilter.label,
    //       KalturaUtils.getEndDateValue(this._scheduledBefore),
    //       KalturaUtils.getStartDateValue(this._scheduledAfter)
    //     )
    //   );
    // }

    return true;
  }



  /**
   * Clear content of created components and sync filters accordingly.
   *
   * Not part of the API, don't use it from outside this component
   */
  public _clearCreatedComponents(): void {
      this._store.update({
          createdAt: {
              fromDate: null,
              toDate: null
          }
      });
  }

  /**
   * Clear all content components and sync filters accordingly.
   *
   * Not part of the API, don't use it from outside this component
   */
  public _clearAllComponents(): void {
    this._scheduledFilterError = null;

    const handledFilterTypeList = [];
    Object.keys(this._filtersGroupListMapping).forEach(filterName => {
      const treeData = this._filtersGroupListMapping[filterName];

      // TODO sakal
      // if (handledFilterTypeList.indexOf(treeData.refineFilter.entriesFilterType) === -1) {
      //   handledFilterTypeList.push(treeData.refineFilter.entriesFilterType);
      //   this.entriesStore.removeFiltersByType(treeData.refineFilter.entriesFilterType);
      // }
    });

    this._clearCreatedComponents();
  }

  /**
   * Get current scheduled filter is found in entries store.
   */
  private _getScheduledFilter(): TimeSchedulingFilter {
    let result: TimeSchedulingFilter = null;
    const timeFilters = this._entriesStore.getFiltersByType(TimeSchedulingFilter);

    if (timeFilters && timeFilters.length > 0) {
      result = R.find(R.propEq('value', 'scheduled'), timeFilters);
    }

    return result || null;
  }

  public _onCreatedChanged(): void {
      const updateResult = this._store.update({
          createdAt: {
              fromDate: this._createdAfter,
              toDate: this._createdBefore
          }
      });

      if (updateResult.createdAt && updateResult.createdAt.failed) {
          this._createdFilterError = this._appLocalization.get('applications.content.entryDetails.errors.schedulingError');

          setTimeout(() => {
              const createdAt = this._store.getFilterData('createdAt');
              this._createdAfter = createdAt ? createdAt.fromDate : null;
              this._createdBefore = createdAt ? createdAt.toDate : null;

          }, 0);
      } else {
          this._createdFilterError = null;
      }
  }

  /**
   * Create or update scheduled components filter once the component data was changed by the user
   *
   * Not part of the API, don't use it from outside this component
   */
  public _onSchedulingChanged(calendarRef: any): void {
    this.syncSchedulingFilters();

    if (calendarRef && calendarRef.overlayVisible) {
      calendarRef.overlayVisible = false;
    }

  }

  public _onTreeNodeSelect({ node }: { node: PrimeTreeNode }, treeSection: FiltersGroupList) {
    if (node instanceof PrimeTreeNode && node.payload.filterName) {
      const treeData = this._filtersGroupListMapping[node.payload.filterName];

      if (treeData) {
        // TODO sakal
          switch (node.payload.filterName)
          {
              case "Media Types":
                  const newValue = this._store.getFilterData('mediaTypes') || [];
                if (!newValue.find(item => item.value === node.data)) {
                    newValue.push({value: node.data + '', label: node.label});
                    this._store.update({ mediaTypes: newValue});
                }
                break;
          }
      }
    }
  }

  public _onTreeNodeUnselect({ node }: { node: PrimeTreeNode }, treeSection: FiltersGroupList) {
      if (node instanceof PrimeTreeNode && node.payload.filterName) {
          const treeData = this._filtersGroupListMapping[node.payload.filterName];

          if (treeData) {
              // TODO sakal
              switch (node.payload.filterName) {
                  case "Media Types":
                      const newValue = this._store.getFilterData('mediaTypes') || [];
                      const itemIndex = newValue.findIndex(item => item.value === node.data);
                      if (itemIndex > -1) {
                          newValue.splice(itemIndex, 1);
                          this._store.update({mediaTypes: newValue});
                      }
                      break;
              }
          }
      }
  }

  /**
   * Stop propagating clicks of the provided event.
   *
   * Not part of the API, don't use it from outside this component
   */
  public _blockScheduleToggle(event) {
    event.stopPropagation();
  }

  /**
   * Invoke a request to the popup widget container to close the popup widget.
   *
   * Not part of the API, don't use it from outside this component
   */
  public _close() {
    if (this.parentPopupWidget) {
      this.parentPopupWidget.close();
    }
  }


}
