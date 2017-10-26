import { Component, AfterViewInit,OnInit, OnDestroy } from '@angular/core';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { BrowserService } from 'app-shared/kmc-shell';

import { EntryLiveWidget } from './entry-live-widget.service';


@Component({
    selector: 'kEntryLive',
    templateUrl: './entry-live.component.html',
    styleUrls: ['./entry-live.component.scss']
})
export class EntryLive implements AfterViewInit, OnInit, OnDestroy {

    public _loadingError = null;
	public _copyToClipboardEnabled: boolean = false;


	constructor(public _widgetService: EntryLiveWidget, private _appLocalization: AppLocalization, private _browserService: BrowserService) {
    }


    ngOnInit() {
		this._widgetService.attachForm();
		this._copyToClipboardEnabled = this._browserService.copyToClipboardEnabled();
    }

    ngOnDestroy() {
		this._widgetService.detachForm();

	}


    ngAfterViewInit() {

    }


    _onLoadingAction(actionKey: string) {
        if (actionKey === 'retry') {

        }
    }

	_copyToClipboard(text: string): void{
		let copied: boolean = this._browserService.copyToClipboard(text);
		if (copied){
      this._browserService.showGrowlMessage({severity: 'success', detail: this._appLocalization.get('app.common.copySuccess')});
		}else{
      this._browserService.showGrowlMessage({severity: 'error', detail: this._appLocalization.get('app.common.copyFailure')});
		}
	}

	/*
	_regenerateToken():void{
		this._browserService.confirm(
			{
				header: this._appLocalization.get('applications.content.entryDetails.live.regeneratePromptHeader'),
				message: this._appLocalization.get('applications.content.entryDetails.live.regeneratePrompt'),
				accept: () => {
					this._widgetService.regenerateStreamToken();
				}
			}
		);
	}
	*/

}

