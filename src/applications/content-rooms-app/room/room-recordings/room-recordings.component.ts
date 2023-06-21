import { Component, OnInit, OnDestroy, ViewChild, HostListener } from '@angular/core';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import {AppAnalytics, AppAuthentication} from 'app-shared/kmc-shell';
import { BrowserService } from 'app-shared/kmc-shell/providers';
import { RoomRecordingsWidget } from './room-recordings-widget.service';
import { Menu } from 'primeng/menu';
import { KMCPermissions } from 'app-shared/kmc-shared/kmc-permissions';
import { MenuItem } from 'primeng/api';
import {KalturaMediaEntry, KalturaSourceType} from "kaltura-ngx-client";
import {PreviewAndEmbedEvent} from "app-shared/kmc-shared/events";
import {AppEventsService} from "app-shared/kmc-shared";
import {Router} from "@angular/router";
import {ReachAppViewService, ReachPages} from "app-shared/kmc-shared/kmc-views/details-views";
import {AnalyticsNewMainViewService} from "app-shared/kmc-shared/kmc-views";
import {cancelOnDestroy, tag} from "@kaltura-ng/kaltura-common";
import {KalturaLogger} from "@kaltura-ng/kaltura-logger";
import {ContentRoomsAppService} from "../../content-rooms-app.service";

@Component({
    selector: 'kRoomRecordings',
    templateUrl: './room-recordings.component.html',
    styleUrls: ['./room-recordings.component.scss']
})
export class RoomRecordings implements OnInit, OnDestroy {

    public _loadingError = false;
	@ViewChild('actionsmenu', { static: true }) private actionsMenu: Menu;
	public _actions: MenuItem[] = [];
	public _kmcPermissions = KMCPermissions;
    public _documentWidth: number;

	private currentRecording: KalturaMediaEntry;

  @HostListener('window:resize', [])
  onWindowResize() {
    this._documentWidth = document.body.clientWidth;
  }

	constructor(public _widgetService: RoomRecordingsWidget,
                private _appLocalization: AppLocalization,
                private _browserService: BrowserService,
                private _analytics: AppAnalytics,
                private _router: Router,
                private _logger: KalturaLogger,
                private _appEvents: AppEventsService,
                private _contentRoomAppService: ContentRoomsAppService,
                private _analyticsNewMainViewService: AnalyticsNewMainViewService,
                private _reachAppViewService: ReachAppViewService,
                private _appAuthentication: AppAuthentication) {
    }

    ngOnInit() {
      this._documentWidth = document.body.clientWidth;
      this._widgetService.attachForm();

	    this._actions = [
		    {label: this._appLocalization.get('applications.embed.previewShare'), command: (event) => {this.actionSelected("embed");}},
		    {label: this._appLocalization.get('applications.upload.uploadMonitor.viewDetails'), command: (event) => {this.actionSelected("details");}},
		    {label: this._appLocalization.get('applications.reach.captionRequests'), command: (event) => {this.actionSelected("captions");}},
	    ];
        if (this._analyticsNewMainViewService.isAvailable()) {
            this._actions.push(
                {label: this._appLocalization.get('applications.content.entries.viewAnalytics'), command: (event) => {this.actionSelected("analytics");}},
            );
        }
        this._actions.push(
            {label: this._appLocalization.get('applications.content.entryDetails.thumbnails.delete'), styleClass: 'kDanger', command: (event) => {this.actionSelected("delete");}}
        );
    }

	openActionsMenu(event: any, recording: KalturaMediaEntry): void{
		if (this.actionsMenu){
			this.currentRecording = recording; // save the selected caption for usage in the actions menu
			this.actionsMenu.toggle(event);
		}
	}

	private actionSelected(action: string): void{
		switch (action){
			case "embed":
                this._analytics.trackClickEvent('Share_Embed');
                this._appEvents.publish(new PreviewAndEmbedEvent(this.currentRecording));
				break;
			case "details":
                this._router.navigate(['content/entries/entry/' + this.currentRecording.id]);
				break;
			case "captions":
                this._reachAppViewService.open({ entry: this.currentRecording, page: ReachPages.entry });
				break;
			case "analytics":
                this._analytics.trackClickEvent('View_analytics');
                this._router.navigate(['analytics/entry'], { queryParams: { id: this.currentRecording.id } });
				break;
			case "delete":
                this._analytics.trackClickEvent('Delete');
                this._browserService.confirm({
                    header: this._appLocalization.get('applications.content.entries.deleteEntry'),
                    message: this._appLocalization.get('applications.content.entries.confirmDeleteSingle', [this.currentRecording.id]),
                    accept: () => this._deleteRecording(this.currentRecording.id)
                });
				break;
		}
	}

    private _deleteRecording(recordingId: string): void {
        this._logger.info(`handle delete entry action by user`, { recordingId });
        if (!recordingId) {
            this._logger.info('recordingId is not defined. Abort action');
            return;
        }

        this._contentRoomAppService.deleteRecording(this._widgetService._roomStore.room.id, recordingId)
            .pipe(
                tag('block-shell'),
                cancelOnDestroy(this)
            )
            .subscribe(
                () => {
                    this._widgetService.reloadRecordings();
                },
                error => {
                    this._browserService.alert({
                        header: this._appLocalization.get('app.common.error'),
                        message: error.message,
                        accept: () => {
                            this._widgetService.reloadRecordings();
                        }
                    });
                }
            );
    }

    ngOnDestroy() {
	    this.actionsMenu.hide();
		this._widgetService.detachForm();
	}

    public _onThumbLoadError(event): void {
        event.target.style.display = 'none';
        this._loadingError = true;
    }
}
