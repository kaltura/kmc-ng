import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SelectItem, Menu, MenuItem } from 'primeng/primeng';
import { EntryHighlightsWidget } from './entry-highlights-widget.service';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { KalturaMediaEntry } from 'kaltura-ngx-client/api/types/KalturaMediaEntry';
import { AppAuthentication, BrowserService } from 'app-shared/kmc-shell';
import { environment } from 'app-environment';
import { Kea2HosterConfig } from 'app-shared/kmc-shared/kea2-hoster/kea2-hoster.component';
import { KalturaHighlightType } from 'kaltura-ngx-client/api/types/KalturaHighlightType';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';

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
    public _profiles = [
        {label: "Sports", value: KalturaHighlightType.sports, selected: false},
        {label: "Lecture", value: KalturaHighlightType.lecture, selected: false},
        {label: "Drama", value: KalturaHighlightType.drama, selected: false},
        {label: "Action", value: KalturaHighlightType.action, selected: false}];

    public _selectedHighlightsEntry: KalturaMediaEntry = null;

    constructor(public _widgetService: EntryHighlightsWidget, private _appLocalization: AppLocalization, private _browserService: BrowserService, private _appAuthentication: AppAuthentication)
    {
    }

    _convertSortValue(value: boolean): number {
        return value ? 1 : -1;

    }
    public _onSortChanged(event : any)
    {
        this._widgetService.sortAsc = event.order === 1;
        this._widgetService.sortBy = event.field;

        this._widgetService.reload();
    }

    public _onPaginationChanged(state : any) : void {
        if (state.page !== this._widgetService.pageIndex || state.rows !== this._widgetService.pageSize) {
            this._widgetService.pageIndex = state.page;
            this._widgetService.pageSize = state.rows;
            this._widgetService.reload();
        }
    }

    public _createAndClose(): void{
        const selectedProfiles = this._profiles.filter(profile => profile.selected);

        if (selectedProfiles.length > 0) {
            this.popup.close();
            this._widgetService._showLoader();
            this._widgetService.create(selectedProfiles.map(profile => profile.value))
                .cancelOnDestroy(this)
                .subscribe(() =>
                {
                    this._widgetService._hideLoader();
                    this._widgetService.reload();
                },
                    () =>
                    {
                        this._widgetService._hideLoader();

                        this._widgetService._showBlockerMessage(new AreaBlockerMessage(
                            {
                                message: this._appLocalization.get('applications.content.entryDetails.errors.clipsLoadError'),
                                buttons: [
                                    {
                                        label: this._appLocalization.get('applications.content.entryDetails.errors.retry'),
                                        action: () => {
                                            this._widgetService.reload();
                                        }
                                    }
                                ]
                            }
                        ), false);
                    });
        }else
        {
            this._browserService.alert({ message: 'Please select profile'});
        }
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
                    entryId: this._selectedHighlightsEntry.id,
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
                this._browserService.openLink(environment.modules.contentEntries.highlightsPreview + "?entryId="+this._selectedHighlightsEntry.id+"&uiconfId="+environment.core.kaltura.previewUIConf+"&pid="+this._appAuthentication.appUser.partnerId);
                break;
        }
    }

    save():void{

    }

    ngOnDestroy() {
        this._widgetService.detachForm();
    }
}

