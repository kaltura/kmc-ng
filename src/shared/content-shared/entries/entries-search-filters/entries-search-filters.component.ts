import {AfterViewInit, Component, EventEmitter, Input, OnDestroy, Output} from '@angular/core';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { PopupWidgetComponent, PopupWidgetStates } from '@kaltura-ng/kaltura-ui';
import { TreeNode } from "primeng/api";
import {cancelOnDestroy} from "@kaltura-ng/kaltura-common";
import {BrowserService} from "app-shared/kmc-shell";
import {serverConfig} from "config/server";

@Component({
  selector: 'k-entries-search-filters',
  templateUrl: './entries-search-filters.component.html',
  styleUrls: ['./entries-search-filters.component.scss']
})
export class EntriesSearchFiltersComponent implements  AfterViewInit, OnDestroy{
    @Input() selectedSearchField = 'all';
    @Input() includeCaptions = false;
    @Input() parentPopupWidget: PopupWidgetComponent;
    @Output() searchFieldSelected = new EventEmitter<{selectedSearchField: string, includeCaptions: boolean}>();

  constructor(private _appLocalization: AppLocalization, private _browserService: BrowserService,) {
  }

    ngAfterViewInit() {
        if (this.parentPopupWidget) {
            this.parentPopupWidget.state$
                .pipe(cancelOnDestroy(this))
                .subscribe(event => {
                    if (event.state === PopupWidgetStates.BeforeClose) {
                        this.searchFieldSelected.emit({selectedSearchField: this.selectedSearchField, includeCaptions: this.includeCaptions});
                    }
                });
        }
    }
    public applySearchFields(): void {
        this.parentPopupWidget.close();
    }

    public reset(): void {
      this.selectedSearchField = 'all';
      this.includeCaptions = false;
    }

    public openHelp() {
        if (serverConfig.externalLinks.kaltura.search) {
            this._browserService.openLink(serverConfig.externalLinks.kaltura.search);
        }
    }

    ngOnDestroy(): void {
    }

}
