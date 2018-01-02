import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SelectItem, Menu, MenuItem } from 'primeng/primeng';
import { EntryHighlightsWidget } from './entry-highlights-widget.service';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { KalturaMediaEntry } from 'kaltura-ngx-client/api/types/KalturaMediaEntry';
import { BrowserService } from 'app-shared/kmc-shell';
import { environment } from 'app-environment';
import { Kea2HosterConfig } from 'app-shared/kmc-shared/kea2-hoster/kea2-hoster.component';

@Component({
    selector: 'kEntryHighlights',
    templateUrl: './entry-highlights.component.html',
    styleUrls: ['./entry-highlights.component.scss']
})
export class EntryHighlights implements OnInit, OnDestroy {

    @ViewChild('highlightsPopup') popup: PopupWidgetComponent;
    @ViewChild('edit') editPopup: PopupWidgetComponent;
    @ViewChild('actionsmenu') private actionsMenu: Menu;

    public _keaConfig: Kea2HosterConfig;

    public _actions: MenuItem[] = [];
    public _loading = false;
    public _loadingError = null;
    public _profiles = [{label: "Sports", value: "Sports"}, {label: "Lecture", value: "Lecture"}, {label: "Drama", value: "Drama"}, {label: "Action", value: "Action"}, {label: "Other", value: "Other"}];
    public _selectedProfile = this._profiles[0].value;
    public _selectedHighlightsEntry: KalturaMediaEntry = null;

    constructor(public _widgetService: EntryHighlightsWidget, private _appLocalization: AppLocalization, private _browserService: BrowserService)
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
        this._widgetService.create(this._selectedHighlightsEntry, this._selectedProfile);
    }

    openActionsMenu(event: any, entry: KalturaMediaEntry): void{
        this._selectedHighlightsEntry = entry;
        if (this.actionsMenu){
            this.actionsMenu.toggle(event);
        }
    }

    ngOnInit() {
        this._widgetService.attachForm();

        this._actions = [
            {label: this._appLocalization.get('applications.content.entryDetails.related.edit'), command: (event) => {this.actionSelected("edit");}},
            {label: this._appLocalization.get('applications.content.entryDetails.related.delete'), command: (event) => {this.actionSelected("delete");}},
            {label: this._appLocalization.get('applications.content.entryDetails.highlights.preview'), command: (event) => {this.actionSelected("preview");}}
        ];

    }

    private actionSelected(action: string): void{
        switch (action){
            case "edit":
                this._keaConfig = {
                    entryId: '1_1c3q51nr', // TODO this._selectedHighlightsEntry.id,
                    tab: 'chopAndSlice'
                };
                this.editPopup.open();

                break;
            case "delete":
                this._browserService.confirm(
                    {
                        header: this._appLocalization.get('applications.content.entryDetails.highlights.deleteConfirmHeader'),
                        message: this._appLocalization.get('applications.content.entryDetails.highlights.deleteConfirm'),
                        accept: () => {
                            this._widgetService.deleteEntry(this._selectedHighlightsEntry);
                        }
                    }
                );
                break;
            case "preview":
                this._browserService.openLink(environment.modules.contentEntries.highlightsPreview + "?entryId="+this._selectedHighlightsEntry.id);
                break;
        }
    }

    save():void{

    }

    ngOnDestroy() {
        this._widgetService.detachForm();
    }
}

