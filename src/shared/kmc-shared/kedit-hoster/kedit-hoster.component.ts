import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {AppAuthentication} from 'app-shared/kmc-shell';
import {getKalturaServerUri, serverConfig} from 'config/server';
import {KMCPermissions, KMCPermissionsService} from 'app-shared/kmc-shared/kmc-permissions';
import {UpdateClipsEvent} from 'app-shared/kmc-shared/events/update-clips-event';
import {AppEventsService} from 'app-shared/kmc-shared';


@Component({
  selector: 'kKeditHoster',
  templateUrl: './kedit-hoster.component.html',
  styleUrls: ['./kedit-hoster.component.scss']
})
export class KeditHosterComponent implements OnInit, OnDestroy {

  @Input() entryId: string = null;
  @Input() tab: 'quiz' | 'editor' | 'advertisements' = null;

  @Output() enteredDraftMode = new EventEmitter<void>();
  @Output() exitDraftMode = new EventEmitter<void>();


  public keditUrl: string;
  public _windowEventListener = null;
  public _keditConfig: any = null;

  constructor(private appAuthentication: AppAuthentication,
              private _permissionService: KMCPermissionsService,
              private _appEvents: AppEventsService,
              ) {
  }

  ngOnInit() {
    if (!this.entryId || !this.tab) {
      this._keditConfig = null;
      return;
    }
    this._updateState();

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
        this._appEvents.publish(new UpdateClipsEvent());

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
        this.enteredDraftMode.emit();
      }

      /*
       * Fired when saving advertisements
       * message.data = {entryId}
       */
      if (postMessageData.messageType === 'kea-advertisements-saved') {
        this.exitDraftMode.emit();
      } else if (postMessageData.messageType === 'kea-go-to-media') {
        console.log('I will now go to media: ' + postMessageData.data);
      }
    };

    window.addEventListener('message', this._windowEventListener);
  }

  private _updateState(): void {

    if (!this.entryId || !this.tab) {
      this._keditConfig = null;
      return;
    }

    const serviceUrl = getKalturaServerUri();
    const tabs = {
      'quiz': {name: 'quiz', permissions: ['quiz'], userPermissions: ['quiz']},
      'edit': {name: 'edit', permissions: ['clip', 'trim'], userPermissions: ['clip', 'trim']},
      'advertisements': {
        name: 'advertisements',
        permissions: ['FEATURE_ALLOW_VAST_CUE_POINT_NO_URL', 'CUEPOINT_MANAGE', 'FEATURE_DISABLE_KMC_KDP_ALERTS']
          .filter(permission => this._permissionService.hasAnyPermissions([KMCPermissions[permission]])),
        userPermissions: []
      }
    };

    let playerUiConfId: string;
    let previewPlayerUiConfId: string;

    switch (this.tab) {
      case 'quiz':
      case 'editor':
        this.keditUrl = serverConfig.externalApps.clipAndTrim.uri;
        playerUiConfId = serverConfig.externalApps.clipAndTrim.uiConfId;
        previewPlayerUiConfId = serverConfig.externalApps.clipAndTrim.uiConfId;
        break;
      case 'advertisements':
        this.keditUrl = serverConfig.externalApps.advertisements.uri;
        playerUiConfId = serverConfig.externalApps.advertisements.uiConfId;
        previewPlayerUiConfId = serverConfig.externalApps.advertisements.uiConfId;
        break;
    }


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
        'tab': this.tab,

        /* URL of an additional css file to load */
        'css_url': '',

        /* id of the entry to start with */
        'entry_id': this.entryId,

        /* id of uiconf to be used for internal player,
        * if left empty the default deployed player will be used */
        'player_uiconf_id': playerUiConfId,

        /* id of uiconf to be used for preview. if not passed, main player is used */
        'preview_player_uiconf_id': previewPlayerUiConfId,

        /* should a KS be appended to the thumbnails url, for access control issues */
        'load_thumbnail_with_ks': false,

        /* should hide the navigation bar (sidebar holding the tabs) */
        'hide_navigation_bar': false
      }
    };

  }


  ngOnDestroy() {
    window.removeEventListener('message', this._windowEventListener);
  }

}
