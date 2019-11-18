import { Component, OnInit, OnDestroy, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';

import { KalturaClient } from 'kaltura-ngx-client';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { BrowserService } from 'app-shared/kmc-shell/providers';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { PopupWidgetComponent, PopupWidgetStates } from '@kaltura-ng/kaltura-ui';
import { KalturaMediaEntry } from 'kaltura-ngx-client';
import { KalturaFlavorParams } from 'kaltura-ngx-client';
import { FlavorParamsListAction } from 'kaltura-ngx-client';
import { KalturaFilterPager } from 'kaltura-ngx-client';

import {SelectItem} from 'primeng/api';

@Component({
	selector: 'kBulkDownload',
	templateUrl: './bulk-download.component.html',
	styleUrls: ['./bulk-download.component.scss']
})
export class BulkDownload implements OnInit, OnDestroy, AfterViewInit {

	@Input() selectedEntries: KalturaMediaEntry[];
	@Input() parentPopupWidget: PopupWidgetComponent;
	@Output() downloadChanged = new EventEmitter<number>();

	public _loading = false;
	public _sectionBlockerMessage: AreaBlockerMessage;

	public _flavors: SelectItem[] = [];
	public _selectedFlavor: number;


	private _parentPopupStateChangeSubscribe: ISubscription;
	private _confirmClose: boolean = true;
	private _downloadLabel = {};
	private _selectionChanged = false;

	constructor(private _kalturaServerClient: KalturaClient,
                private _appLocalization: AppLocalization,
                private _browserService: BrowserService) {
	}

	ngOnInit() {
		this._downloadLabel = {'0': this.selectedEntries.length};

		// load flavors
		this._loading = true;
		this._sectionBlockerMessage = null;

		let pager: KalturaFilterPager = new KalturaFilterPager();
		pager.pageSize = 500;
		pager.pageIndex = 1;
		this._kalturaServerClient.request(new FlavorParamsListAction({
			pager: pager
		})).subscribe(
			response => {
				this._loading = false;
				response.objects.forEach(flavor => {
					if (flavor instanceof KalturaFlavorParams){
						this._flavors.push({'label': flavor.name, 'value': flavor.id});
						if (flavor.id === 0){ // source
							this._selectedFlavor = flavor.id;
						}
					}
				});
			},
			error => {
				this._loading = false;
				this._sectionBlockerMessage = new AreaBlockerMessage(
					{
						message: error.message,
						buttons: [
							{
								label: this._appLocalization.get('app.common.close'),
								action: () => {
									this._confirmClose = false;
									this.parentPopupWidget.close();
								}
							}
						]
					}
				);

			}
		);
	}

	ngAfterViewInit() {
		if (this.parentPopupWidget) {
			this._parentPopupStateChangeSubscribe = this.parentPopupWidget.state$
				.subscribe(event => {
					if (event.state === PopupWidgetStates.Open) {
						this._confirmClose = true;
					}
					if (event.state === PopupWidgetStates.BeforeClose) {
						if (event.context && event.context.allowClose) {
							if (this._selectionChanged && this._confirmClose) {
								event.context.allowClose = false;
								this._browserService.confirm(
									{
										header: this._appLocalization.get('app.common.cancel'),
										message: this._appLocalization.get('applications.content.entryDetails.captions.discard'),
										accept: () => {
											this._confirmClose = false;
											this.parentPopupWidget.close();
										}
									}
								);
							}
						}
					}
				});
		}
	}

	public _onSelectionChanged():void{
		this._selectionChanged = true;
	}

	ngOnDestroy() {
		this._parentPopupStateChangeSubscribe.unsubscribe();
	}


	public _apply() {
		this.downloadChanged.emit(this._selectedFlavor);
		this._confirmClose = false;
		this.parentPopupWidget.close();
	}
}

