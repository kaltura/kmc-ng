import { Component, Input, Output, EventEmitter, ViewChild, AfterViewInit,OnInit, OnDestroy } from '@angular/core';
import { AppLocalization } from '@kaltura-ng2/kaltura-common';
import { BrowserService } from 'kmc-shell';
import { ConfirmationService } from 'primeng/primeng';
import { EntryLiveHandler } from './entry-live-handler';

@Component({
    selector: 'kEntryLive',
    templateUrl: './entry-live.component.html',
    styleUrls: ['./entry-live.component.scss']
})
export class EntryLive implements AfterViewInit, OnInit, OnDestroy {

    public _loadingError = null;
	public _copyToClipboardEnabled: boolean = false;


    constructor(public _handler : EntryLiveHandler, private _appLocalization: AppLocalization, private _browserService: BrowserService, private _confirmationService: ConfirmationService) {
    }


    ngOnInit() {
		this._copyToClipboardEnabled = this._browserService.copyToClipboardEnabled();
    }

    ngOnDestroy() {
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
			this._handler._msgs.push({severity: 'success', summary: '', detail: this._appLocalization.get('app.common.copySuccess')});
		}else{
			this._handler._msgs.push({severity: 'error', summary: '', detail: this._appLocalization.get('app.common.copyFailure')});
		}
	}

	_regenerateToken():void{
		this._confirmationService.confirm({
			message: this._appLocalization.get('applications.content.entryDetails.live.regeneratePrompt'),
			accept: () => {
				this._handler.regenerateStreamToken();
			}
		});
	}

}

