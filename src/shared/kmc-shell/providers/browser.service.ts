import { Injectable, EventEmitter } from '@angular/core';
import { LocalStorageService, SessionStorageService } from 'ng2-webstorage';
import { IAppStorage } from '@kaltura-ng/kaltura-common';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

export interface Confirmation {
	message: string;
	key?: string;
	icon?: string;
	header?: string;
	accept?: Function;
	reject?: Function;
	acceptVisible?: boolean;
	rejectVisible?: boolean;
	acceptEvent?: EventEmitter<any>;
	rejectEvent?: EventEmitter<any>;
}

export type OnShowConfirmationFn = (confirmation : Confirmation) => void;

export type AppStatus = {
  isBusy : boolean;
  errorMessage : string;
};

@Injectable()
export class BrowserService implements IAppStorage {

  private _appStatus = new BehaviorSubject<{isBusy : boolean, errorMessage : string}>({ isBusy : false, errorMessage : null});
  public appStatus$ = this._appStatus.asObservable();

	private _onConfirmationFn : OnShowConfirmationFn = (confirmation : Confirmation) => {
		// this is the default confirmation dialog provided by the browser.
		if (confirm(confirmation.message))
		{
			if (confirmation.accept)
			{
				confirmation.accept.apply(null);
			}

			if (confirmation.acceptEvent)
			{
				confirmation.acceptEvent.next();
			}
		}else
		{
			if (confirmation.reject)
			{
				confirmation.reject.apply(null);
			}

			if (confirmation.rejectEvent)
			{
				confirmation.rejectEvent.next();
			}
		}
	};

	constructor(private localStorage: LocalStorageService, private sessionStorage: SessionStorageService) {
	}


	public registerOnShowConfirmation(fn : OnShowConfirmationFn)
	{
		if (fn) {
			this._onConfirmationFn = fn;
		}
	}

	public setAppStatus(status: AppStatus): void{
    this._appStatus.next(status);
  }

	public confirm(confirmation : Confirmation) {
		confirmation.key = "confirm";
		this._onConfirmationFn(confirmation);
	}

	public alert(confirmation : Confirmation) {
		confirmation.key = "alert";
		this._onConfirmationFn(confirmation);
	}

	public setInLocalStorage(key: string, value: any): void {
		this.localStorage.store(key, value);
	}

	public getFromLocalStorage(key: string): any {
		return this.localStorage.retrieve(key);
	}

	public removeFromLocalStorage(key: string): any {
		this.localStorage.clear(key);
	}

	public setInSessionStorage(key: string, value: any): void {
		this.sessionStorage.store(key, value);
	}

	public getFromSessionStorage(key: string): any {
		return this.sessionStorage.retrieve(key);
	}

	public removeFromSessionStorage(key: string): any {
		this.sessionStorage.clear(key);
	}

	public openLink(baseUrl: string, params: any = {}, target: string = "_blank") {
		// if we got params, append to the base URL using query string
		if (baseUrl && baseUrl.length) {
			if (Object.keys(params).length > 0) {
				baseUrl += "?";
				for (var key of Object.keys(params)) {
					baseUrl += key + "=" + params[key] + "&";
				}
				baseUrl = baseUrl.slice(0, -1); // remove last &
			}
		}
		window.open(baseUrl, target);
	}

	public isSafari(): boolean{
		const isChrome = !!window['chrome'] && !!window['chrome'].webstore;
		return Object.prototype.toString.call(window['HTMLElement']).indexOf('Constructor') > 0 || !isChrome && window['webkitAudioContext'] !== undefined;
	}

	public copyToClipboardEnabled(): boolean {
		let enabled = true;

		if (this.isSafari()) {
			let nAgt = navigator.userAgent;
			let verOffset = nAgt.indexOf("Version");
			let fullVersion = nAgt.substring(verOffset + 8);
			let ix;
			if ((ix = fullVersion.indexOf(";")) != -1) {
				fullVersion = fullVersion.substring(0, ix);
			}
			if ((ix = fullVersion.indexOf(" ")) != -1) {
				fullVersion = fullVersion.substring(0, ix);
			}
			let majorVersion = parseInt('' + fullVersion, 10);
			enabled = majorVersion < 10;
		}
		return enabled;
	}

	public copyToClipboard(text: string): boolean {
		let copied = false;
		let textArea = document.createElement("textarea");
		textArea.style.position = 'fixed';
		textArea.style.top = -1000 + 'px';
		textArea.value = text;
		document.body.appendChild(textArea);
		textArea.select();
		try {
			copied = document.execCommand('copy');
		} catch (err) {
			console.log('Copy to clipboard operation failed');
		}
		document.body.removeChild(textArea);
		return copied;
	}

	public download(data, filename, type): void {
		let	file = new Blob([data], {type: type});
		if (window.navigator.msSaveOrOpenBlob) // IE10+
			window.navigator.msSaveOrOpenBlob(file, filename);
		else { // Others
			let a = document.createElement("a");
			let url = URL.createObjectURL(file);
			a.href = url;
			a.download = filename;
			document.body.appendChild(a);
			a.click();
			setTimeout(function() {
				document.body.removeChild(a);
				window.URL.revokeObjectURL(url);
			}, 0);
		}
	}

	public enablePageExitVerification(verificationMsg: string = null): void{
		window.onbeforeunload = (e) => {
			const confirmationMessage = verificationMsg ? verificationMsg : "Are you sure you want to leave this page?";
			(e || window.event).returnValue = confirmationMessage; // Gecko + IE
			return confirmationMessage;                            // Webkit, Safari, Chrome
		};
	}

	public disablePageExitVerification(): void{
		window.onbeforeunload = (e) => {};
	}

}
