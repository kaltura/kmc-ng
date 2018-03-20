import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {AppAuthentication} from 'app-shared/kmc-shell';
import {getKalturaServerUri} from 'config/server';

export interface KeditHosterConfig {
  entryId: string;
  keditUrl: string;
  tab: {name: 'quiz' | 'editor' | 'advertisements',
    permissions: string[],
    userPermissions: string[],
    preActivateMessage?: string,
    preSaveMessage?: string,
    preSaveAsMessage?: string};
    playerUiConfId: string;
    previewPlayerUiConfId: string;
    callbackActions?: {
      clipCreated?: (data: {originalEntryId: string, newEntryId: string, newEntryName: string}) => void,
      advertisementsModified?: (data: {entryId: string}) => void,
      advertisementsSaved?: (data: {entryId: string}) => void,
    };
}

@Component({
  selector: 'kKeditHoster',
  templateUrl: './kedit-hoster.component.html',
  styleUrls: ['./kedit-hoster.component.scss']
})
export class KeditHosterComponent implements OnInit, OnDestroy {


  @Input()
  public set config(value: KeditHosterConfig) {
    this._keditHosterConfig = value;
    this._updateState(this._keditHosterConfig);
  }

  public keditUrl: string;
  private _windowEventListener = null;
  private _keditConfig: any = null;
  private _keditHosterConfig: KeditHosterConfig = null;

  constructor(private appAuthentication: AppAuthentication) {
  }

  ngOnInit() {
    this._windowEventListener = (e) => {
      let postMessageData;
      try {
        postMessageData = e.data;
      } catch (ex) {
        return;
      }

      /* request for init params,
      * should return a message where messageType = kea-config */
      if (postMessageData.messageType === 'kea-bootstrap') {
        e.source.postMessage(this._keditConfig, e.origin);
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

      /* received when a clip was created.
            * postMessageData.data: {
            *  originalEntryId,
            *  newEntryId,
            *  newEntryName
            * }
            * should return a message where message.messageType = kea-clip-message,
            * and message.data is the (localized) text to show the user.
            * */
      if (postMessageData.messageType === 'kea-clip-created') {
        if (this._keditHosterConfig.callbackActions && this._keditHosterConfig.callbackActions.clipCreated) {
          this._keditHosterConfig.callbackActions.clipCreated(postMessageData.data);
        }

        // send a message to KEA which will show up after clip has been created.
        const message = 'Clip was successfully created.';
        e.source.postMessage({
          'messageType': 'kea-clip-message',
          'data': message
        }, e.origin);
      }


      /*
      * Fired when modifying advertisements (save not performed yet).
      * message.data = {entryId}
      */
      if (postMessageData.messageType === 'kea-advertisements-modified') {
        if (this._keditHosterConfig.callbackActions && this._keditHosterConfig.callbackActions.advertisementsModified) {
          this._keditHosterConfig.callbackActions.advertisementsModified(postMessageData.data);
        }
      }

      /*
       * Fired when saving advertisements
       * message.data = {entryId}
       */
      if (postMessageData.messageType === 'kea-advertisements-saved') {
        if (this._keditHosterConfig.callbackActions && this._keditHosterConfig.callbackActions.advertisementsSaved) {
          this._keditHosterConfig.callbackActions.advertisementsSaved(postMessageData.data);
        }
      }


      /* received when user clicks the "go to media" button after quiz was created/edited
      * message.data = entryId
      * host should navigate to a page displaying the relevant media */
      else if (postMessageData.messageType === 'kea-go-to-media') {
        console.log('I will now go to media: ' + postMessageData.data);
      }
    };

    window.addEventListener('message', this._windowEventListener);
  }

  private _updateState(config: KeditHosterConfig): void {
    if (!config) {
      this._keditConfig = null;
      return;
    }

    const serviceUrl = getKalturaServerUri();

    const tabs = {};
    switch (config.tab.name) {
      case 'quiz':
        tabs['quiz'] = {name: 'quiz', permissions: config.tab.permissions, userPermissions: config.tab.userPermissions};
        break;
      case 'editor':
        tabs['edit'] = {name: 'edit', permissions: config.tab.permissions, userPermissions: config.tab.userPermissions};
        break;
      case 'advertisements':
        tabs['advertisements'] = {name: 'advertisements', permissions: config.tab.permissions, userPermissions: config.tab.userPermissions};
        break;
    }

    this.keditUrl = config.keditUrl;

    this._keditConfig = {
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
        'tab': config.tab.name,

        /* URL of an additional css file to load */
        'css_url': '',

        /* id of the entry to start with */
        'entry_id': config.entryId,

        /* id of uiconf to be used for internal player,
        * if left empty the default deployed player will be used */
        'player_uiconf_id': config.playerUiConfId,

        /* id of uiconf to be used for preview. if not passed, main player is used */
        'preview_player_uiconf_id': config.previewPlayerUiConfId,

        /* should a KS be appended to the thumbnails url, for access control issues */
        'load_thumbnail_with_ks': false,

        /* should hide the navigation bar (sidebar holding the tabs) */
        'hide_navigation_bar': true
      }
    };
  }


  ngOnDestroy() {
    window.removeEventListener('message', this._windowEventListener);
  }

}
