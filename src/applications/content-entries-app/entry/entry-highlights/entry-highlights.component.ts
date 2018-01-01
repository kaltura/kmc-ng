import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';

import { EntryHighlightsWidget } from './entry-highlights-widget.service';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';


@Component({
    selector: 'kEntryHighlights',
    templateUrl: './entry-highlights.component.html',
    styleUrls: ['./entry-highlights.component.scss']
})
export class EntryHighlights implements OnInit, OnDestroy {

    @ViewChild('highlightsPopup') popup: PopupWidgetComponent;

    public _loading = false;
    public _loadingError = null;
    public _profiles = [{label: "Sports", value: "Sports"}, {label: "Lecture", value: "Lecture"}, {label: "Drama", value: "Drama"}, {label: "Action", value: "Action"}];
    public _selectedProfile = this._profiles[0].value;

    constructor(public _widgetService: EntryHighlightsWidget)
    {
    }

    _convertSortValue(value: boolean): number {
        return value ? 1 : -1;

    }
    public _onSortChanged(event : any)
    {
        this._widgetService.sortAsc = event.order === 1;
        this._widgetService.sortBy = event.field;

        this._widgetService.updateClips();
    }

    public _onPaginationChanged(state : any) : void {
        if (state.page !== this._widgetService.pageIndex || state.rows !== this._widgetService.pageSize) {
            this._widgetService.pageIndex = state.page;
            this._widgetService.pageSize = state.rows;
            this._widgetService.updateClips();
        }
    }

    public _createAndClose():void{
        this.popup.close();
        console.log("create new highlights for "+this._selectedProfile); // TODO - implement server call
    }

    ngOnInit() {
        this._widgetService.attachForm();
    }

    ngOnDestroy() {
        this._widgetService.detachForm();
    }
}

