import { Component, OnInit, AfterViewInit, OnDestroy, Input } from '@angular/core';
import { AppAuthentication, BrowserService } from 'app-shared/kmc-shell';
import { environment } from 'app-config';

export interface Kea2HosterConfig
{
    entryId: string,
    tab: 'quiz' | 'chopAndSlice'

}
@Component({
    selector: 'kea2-hoster',
    templateUrl: './kea2-hoster.component.html',
    styleUrls: ['./kea2-hoster.component.scss']
})
export class Kea2HosterComponent implements OnInit, AfterViewInit, OnDestroy {

    private _windowEventListener = null;
    private _keaConfig: any = null;
    @Input()
    public set config(value: Kea2HosterConfig) {
        this._updateState(value);
    }

    public keaUrl: string;

    constructor(private appAuthentication: AppAuthentication, private _browserService: BrowserService) {
    }

    ngOnInit() {

        this.keaUrl =  `${this._browserService.getRootUrl()}${environment.integrations.keaUri}`;

        this._windowEventListener = (e) => {
            var postMessageData;
            try {
                postMessageData = e.data;
            }
            catch(ex) {
                return;
            }

            /* request for init params,
            * should return a message where messageType = kea-config */
            if(postMessageData.messageType === 'kea-bootstrap') {
                e.source.postMessage(this._keaConfig, e.origin);
            }


            /* request for user display name.
            * message.data = {userId}
            * should return a message {messageType:kea-display-name, data: display name}
            */
            if (postMessageData.messageType === 'kea-get-display-name') {
                // send the user's display name based on the user ID
                const displayName = this.appAuthentication.appUser.fullName;
                e.source.postMessage({
                    'messageType': 'kea-display-name',
                    'data': displayName
                }, e.origin);
            }


            /* received when user clicks the "go to media" button after quiz was created/edited
            * message.data = entryId
            * host should navigate to a page displaying the relevant media */
            else if (postMessageData.messageType === 'kea-go-to-media') {
                console.log ("I will now go to media: " + postMessageData.data);
            }
        };

        window.addEventListener('message', this._windowEventListener);
    }

    private _updateState(config: Kea2HosterConfig): void
    {
        if (!config)
        {
            this._keaConfig = null;
            return;
        }

        const serviceUrl = (environment.core.kaltura.useHttpsProtocol ? 'https' : 'http') + `://${environment.core.kaltura.serverEndpoint}`;

        const tabs = {};

        switch (config.tab) {
            case 'quiz':
                tabs['quiz'] = { name: 'quiz', permissions: ['quiz'], userPermissions: ['quiz'] };
                break;
            case 'chopAndSlice':
                tabs['edit'] = { name: 'edit', permissions: ['clip', 'trim'], userPermissions: ['clip', 'trim'] };
                tabs['chopAndSlice'] = { name: 'chopAndSlice', permissions: [], userPermissions: [] };
                break;
        }

        this._keaConfig = {
            'messageType': 'kea-config',
            'data': {
                /* URL of the Kaltura Server to use */
                'service_url': serviceUrl,

                /* the partner ID to use */
                'partner_id': this.appAuthentication.appUser.partnerId,

                /* Kaltura session key to use */
                'ks': this.appAuthentication.appUser.ks,

                /* language - used by priority:
                * 1. Custom locale (locale_url)
                *       full url of a json file with translations
                * 2. Locale code (language_code
                *       there should be a matching json file under src\assets\i18n)
                * 3. English default locale (fallback). */
                'language_code': 'en',
                'locale_url': '',

                /* URL to be used for "Go to User Manual" in KEdit help component */
                'help_link': 'https://knowledge.kaltura.com/node/1912',

                /* tabs to show in navigation */
                'tabs': tabs,

                /* tab to start current session with, should match one of the keys above  */
                'tab': config.tab,

                /* URL of an additional css file to load */
                'css_url': '',

                /* id of the entry to start with */
                'entry_id': config.entryId,

                /* id of uiconf to be used for internal player,
                * if left empty the default deployed player will be used */
                'player_uiconf_id': environment.core.kaltura.previewUIConf,

                /* id of uiconf to be used for preview. if not passed, main player is used */
                'preview_player_uiconf_id': environment.core.kaltura.previewUIConf,

                /* should a KS be appended to the thumbnails url, for access control issues */
                'load_thumbnail_with_ks': false
            }
        };
    }

    ngAfterViewInit() {
    }


    ngOnDestroy() {
        window.removeEventListener('message', this._windowEventListener);
    }

}
