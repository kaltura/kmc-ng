import {EventEmitter, Injectable} from '@angular/core';
import {LocalStorageService, SessionStorageService} from 'ng2-webstorage';
import {AppLocalization, IAppStorage} from '@kaltura-ng/kaltura-common';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
import { Router, ActivatedRoute, NavigationExtras, NavigationEnd } from '@angular/router';
import { kmcAppConfig } from '../../../kmc-app/kmc-app-config';
import { AppEventsService } from 'app-shared/kmc-shared/app-events/app-events.service';
import { OpenEmailEvent } from 'app-shared/kmc-shared/events';

export enum HeaderTypes {
    error = 1,
    attention = 2,
    cancel = 3,
    retry = 4
}

export interface Confirmation {
	message: string;
	key?: string;
	icon?: string;
	header?: string;
	headerType?: HeaderTypes,
	accept?: Function;
	reject?: Function;
	acceptVisible?: boolean;
	rejectVisible?: boolean;
	acceptEvent?: EventEmitter<any>;
	rejectEvent?: EventEmitter<any>;
	alignMessage?: 'left' | 'center' | 'byContent';
}

export interface GrowlMessage {
  severity : 'success' | 'info' | 'error' | 'warn';
  summary?: string;
  detail?: string;
}

export type OnShowConfirmationFn = (confirmation : Confirmation) => void;

export type AppStatus = {
  errorMessage : string;
};

@Injectable()
export class BrowserService implements IAppStorage {

    private _initialQueryParams: { [key: string]: any; } = {};
    private _growlMessage = new Subject<GrowlMessage>();
    private _sessionStartedAt: Date = new Date();
    public growlMessage$ = this._growlMessage.asObservable();
    private _currentUrl: string;
    private _previousUrl: string;

    public get previousUrl(): string {
        return this._previousUrl;
    }

    private _onConfirmationFn: OnShowConfirmationFn = (confirmation: Confirmation) => {
        // this is the default confirmation dialog provided by the browser.
        if (confirm(confirmation.message)) {
            if (confirmation.accept) {
                confirmation.accept.apply(null);
            }

            if (confirmation.acceptEvent) {
                confirmation.acceptEvent.next();
            }
        } else {
            if (confirmation.reject) {
                confirmation.reject.apply(null);
            }

            if (confirmation.rejectEvent) {
                confirmation.rejectEvent.next();
            }
        }
    };

    public get sessionStartedAt(): Date {
        return this._sessionStartedAt;
    }

    constructor(private localStorage: LocalStorageService,
                private sessionStorage: SessionStorageService,
                private _router: Router,
                private _logger: KalturaLogger,
                private _appEvents: AppEventsService,
                private _appLocalization: AppLocalization) {
        this._recordInitialQueryParams();
        this._recordRoutingActions();
    }

    private _recordRoutingActions(): void {
        this._currentUrl = this._router.url;
        this._router.events
            .filter(event => event instanceof NavigationEnd)
            .subscribe((event: NavigationEnd) => {
                this._previousUrl = this._currentUrl;
                this._currentUrl = event.url;
            });
    }
    private _downloadContent(url: string): void {
        return Observable.create(observer => {
            const xhr = new XMLHttpRequest();
            xhr.onload = () => {
                observer.next(xhr.response);
                observer.complete();
            };
            xhr.open('GET', url);
            xhr.responseType = 'blob';
            xhr.send();
        });
    }

    public getInitialQueryParam(key: string): any {
        return this._initialQueryParams[key];
    }

    private _recordInitialQueryParams(): void {
        try {
            const search = location.search.substring(1);
            this._initialQueryParams = JSON.parse('{"' + search.replace(/&/g, '","').replace(/=/g, '":"') + '"}', function (key, value) {
                return key === '' ? value : decodeURIComponent(value)
            });
        } catch (e) {
            console.warn('failed to extract initial query params, ignoring any existing parameters. error ' + (e ? e.message : ''));
        }
    }

    public registerOnShowConfirmation(fn: OnShowConfirmationFn) {
        if (fn) {
            this._onConfirmationFn = fn;
        }
    }

    private _fixConfirmation(confirmation: Confirmation): void {
        if (!confirmation) {
            return;
        }

        if (confirmation.headerType) {
            switch (confirmation.headerType) {
                case HeaderTypes.attention:
                    confirmation.header = this._appLocalization.get('app.common.attention');
                    break;
                case HeaderTypes.error:
                    confirmation.header = this._appLocalization.get('app.common.error');
                    break;
                case HeaderTypes.retry:
                    confirmation.header = this._appLocalization.get('app.common.retry');
                    break;
                case HeaderTypes.cancel:
                    confirmation.header = this._appLocalization.get('app.common.cancel');
                    break;
                default:
                    break;
            }
        }

        if (!(confirmation.header || '').trim()) {
            confirmation.header = this._appLocalization.get('app.common.attention');
        }
    }

    public confirm(confirmation: Confirmation) {
        confirmation.key = "confirm";
        this._fixConfirmation(confirmation);
        this._onConfirmationFn(confirmation);
    }

    public alert(confirmation: Confirmation) {
        confirmation.key = "alert";
        this._fixConfirmation(confirmation);
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

    public openEmail(email: string, force: boolean = false, title: string = "", message: string = ""): void {
        if (force){
            const windowRef = window.open('mailto:' + email, '_blank');
            windowRef.focus();

            setTimeout(function () {
                if (!windowRef.document.hasFocus()) {
                    windowRef.close();
                }
            }, 500);
        }else {
            this._appEvents.publish(new OpenEmailEvent(email, force, title, message));
        }
    }

    public isSafari(): boolean {
        const isChrome = !!window['chrome'] && !!window['chrome'].webstore;
        return Object.prototype.toString.call(window['HTMLElement']).indexOf('Constructor') > 0 || !isChrome && window['webkitAudioContext'] !== undefined;
    }

    public isIE11(): boolean {
        return !!window['MSInputMethodContext'] && !!document['documentMode'];
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

    public copyElementToClipboard(el: any): void {
        if (document.body['createTextRange']) {
            // IE
            let textRange = document.body['createTextRange']();
            textRange.moveToElementText(el);
            textRange.select();
            textRange.execCommand("Copy");
        }
        else if (window.getSelection && document.createRange) {
            // non-IE
            let editable = el.contentEditable; // Record contentEditable status of element
            let readOnly = el.readOnly; // Record readOnly status of element
            el.contentEditable = true; // iOS will only select text on non-form elements if contentEditable = true;
            el.readOnly = false; // iOS will not select in a read only form element
            let range = document.createRange();
            range.selectNodeContents(el);
            let sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range); // Does not work for Firefox if a textarea or input
            if (el.nodeName == "TEXTAREA" || el.nodeName == "INPUT")
                el.select(); // Firefox will only select a form element with select()
            if (el.setSelectionRange && navigator.userAgent.match(/ipad|ipod|iphone/i))
                el.setSelectionRange(0, 999999); // iOS only selects "form" elements with SelectionRange
            el.contentEditable = editable; // Restore previous contentEditable status
            el.readOnly = readOnly; // Restore previous readOnly status
            if (document.queryCommandSupported("copy")) {
                document.execCommand('copy');
            }
        }
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
        let file;
        if (typeof data === 'string' && /^(?:\w+:)?\/\/([^\s\.]+\.\S{2}|localhost[\:?\d]*)\S*$/.test(data)) { // if data is url
            if (this.isIE11()) {
                this.openLink(data);
                return;
            }
            file = this._downloadContent(data);
        } else {
            file = Observable.of(new Blob([data], {type: type}));
        }

        file.subscribe(content => {
            if (window.navigator.msSaveOrOpenBlob) {// IE10+
                window.navigator.msSaveOrOpenBlob(content, filename);
            } else { // Others
                const a = document.createElement('a');
                const url = URL.createObjectURL(content);
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                setTimeout(function () {
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                }, 0);
            }
        });
    }

    private scrolling = false;

    public scrollToTop(duration: number = 500): void {
        if (!this.scrolling) {
            this.scrolling = true;
            const cosParameter = window.pageYOffset / 2;
            let scrollCount: number = 0;
            let oldTimestamp: number = performance.now();
            const step = newTimestamp => {
                scrollCount += Math.PI / (duration / (newTimestamp - oldTimestamp));
                if (scrollCount >= Math.PI) window.scrollTo(0, 0);
                if (window.pageYOffset === 0) {
                    this.scrolling = false;
                    return;
                }
                window.scrollTo(0, Math.round(cosParameter + cosParameter * Math.cos(scrollCount)));
                oldTimestamp = newTimestamp;
                window.requestAnimationFrame(step);
            };
            window.requestAnimationFrame(step);
        }
    }

    public showGrowlMessage(message: GrowlMessage): void {
        if (message.detail || message.summary) {
            this._growlMessage.next(message);
        }
    }

    public handleUnpermittedAction(navigateToDefault: boolean): void {

        if (navigateToDefault) {
            this.alert(
                {
                    header: this._appLocalization.get('app.UnpermittedActionReasons.header'),
                    message: this._appLocalization.get('app.UnpermittedActionReasons.messageNav'),
                    accept: () => {
                        this.navigateToDefault();
                    }
                }
            );
        } else {
            this.alert(
                {
                    header: this._appLocalization.get('app.UnpermittedActionReasons.header'),
                    message: this._appLocalization.get('app.UnpermittedActionReasons.message'),
                    accept: () => {
                    }
                }
            );
        }
    }

    public navigateToLogin(): void {
        this._logger.info(`navigate to login view`);
        this._router.navigateByUrl(kmcAppConfig.routing.loginRoute, { replaceUrl: true });
    }

    public navigateToDefault(removeCurrentFromBrowserHistory: boolean = true): void {
        let extras: NavigationExtras = null;
        if (removeCurrentFromBrowserHistory) {
            extras = { replaceUrl: true };
        }
        this._logger.info(`navigate to default view`, {removeCurrentFromBrowserHistory});
        this._router.navigate([kmcAppConfig.routing.defaultRoute], extras);
    }

    public navigateToError(): void {
        this._logger.info(`navigate to error view`);
        this._router.navigateByUrl(kmcAppConfig.routing.errorRoute, { replaceUrl: true });
    }

    public navigate(path: string): void {
        this._router.navigateByUrl(path);
    }
}

