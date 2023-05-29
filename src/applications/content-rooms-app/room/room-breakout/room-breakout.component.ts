import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { AppAuthentication } from 'app-shared/kmc-shell';
import { BrowserService } from 'app-shared/kmc-shell/providers';
import { RoomBreakoutWidget } from './room-breakout-widget.service';
import { KMCPermissions } from 'app-shared/kmc-shared/kmc-permissions';
import {AnalyticsNewMainViewService} from "app-shared/kmc-shared/kmc-views";
import {Router} from "@angular/router";

@Component({
    selector: 'kRoomBreakout',
    templateUrl: './room-breakout.component.html',
    styleUrls: ['./room-breakout.component.scss']
})
export class RoomBreakout implements OnInit, OnDestroy {

    public _loadingError = false;
	public _kmcPermissions = KMCPermissions;
    public _documentWidth: number;

  @HostListener('window:resize', [])
  onWindowResize() {
    this._documentWidth = document.body.clientWidth;
  }

	constructor(public _widgetService: RoomBreakoutWidget,
                private _analyticsNewMainViewService: AnalyticsNewMainViewService,
                private _router: Router,
                private _appLocalization: AppLocalization,
                private _browserService: BrowserService,
                private _appAuthentication: AppAuthentication) {
    }

    ngOnInit() {
      this._documentWidth = document.body.clientWidth;
      this._widgetService.attachForm();
    }

    public _openBreakoutAnalytics(id): void {
        if (this._analyticsNewMainViewService.isAvailable()) {
            this._router.navigate(['analytics/entry-ep'], { queryParams: { id } });
        }
    }

    ngOnDestroy() {
		this._widgetService.detachForm();
	}

}
