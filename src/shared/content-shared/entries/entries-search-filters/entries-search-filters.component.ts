import {AfterViewInit, Component, EventEmitter, Input, OnDestroy, Output} from '@angular/core';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { PopupWidgetComponent, PopupWidgetStates } from '@kaltura-ng/kaltura-ui';
import { TreeNode } from "primeng/api";
import {cancelOnDestroy} from "@kaltura-ng/kaltura-common";

@Component({
  selector: 'k-entries-search-filters',
  templateUrl: './entries-search-filters.component.html',
  styleUrls: ['./entries-search-filters.component.scss']
})
export class EntriesSearchFiltersComponent implements  AfterViewInit, OnDestroy{
    public selectedSearchFields: TreeNode;
    @Input() parentPopupWidget: PopupWidgetComponent;
    @Output() searchFieldsSelected = new EventEmitter<TreeNode>();

    public searchFields: TreeNode[] = [
        {
        "label": "Title",
        "data": "title"
        },
        {
        "label": "Description",
        "data": "description"
        },
        {
        "label": "Tags",
        "data": "tags"
        },
        {
        "label": "Captions",
        "data": "caprions"
        }
    ];


  constructor(private _appLocalization: AppLocalization) {
  }

    ngAfterViewInit() {
        if (this.parentPopupWidget) {
            this.parentPopupWidget.state$
                .pipe(cancelOnDestroy(this))
                .subscribe(event => {
                    if (event.state === PopupWidgetStates.BeforeClose) {
                        this.searchFieldsSelected.emit(this.selectedSearchFields);
                    }
                });
        }
    }
    public applySearchFields(): void {
        this.parentPopupWidget.close();
    }

    ngOnDestroy(): void {
    }

}
