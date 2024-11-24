import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, OnChanges} from '@angular/core';
import {AppAuthentication} from 'app-shared/kmc-shell/auth';
import {getKalturaServerUri, serverConfig} from 'config/server';
import {KMCPermissions, KMCPermissionsService} from 'app-shared/kmc-shared/kmc-permissions';
import {UpdateClipsEvent} from 'app-shared/kmc-shared/events/update-clips-event';
import {AppEventsService} from 'app-shared/kmc-shared/app-events';
import {
    AdvertisementsAppViewService,
    ClipAndTrimAppViewService,
    QuizAppViewService,
    HotspotsAppViewService
} from 'app-shared/kmc-shared/kmc-views/component-views';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
import { KalturaMediaEntry } from 'kaltura-ngx-client';
import { ContentEntryViewService } from 'app-shared/kmc-shared/kmc-views/details-views';
import { ContentEntryViewSections } from 'app-shared/kmc-shared/kmc-views/details-views/content-entry-view.service';
import { BrowserService } from 'app-shared/kmc-shell/providers/browser.service';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { KalturaLiveEntry } from 'kaltura-ngx-client';
import { KalturaMediaType } from 'kaltura-ngx-client';


@Component({
  selector: 'kKeditHoster',
  templateUrl: './kedit-hoster.component.html',
  styleUrls: ['./kedit-hoster.component.scss'],
    providers: [
        KalturaLogger.createLogger('KeditHosterComponent')
    ]
})
export class KeditHosterComponent implements OnInit, OnDestroy, OnChanges {

  @Input() entry: KalturaMediaEntry | KalturaLiveEntry = null;
  @Input() tab: 'quiz' | 'editor' | 'advertisements' | 'hotspots' = null;
  @Input() entryHasSource = false;

  @Output() enteredDraftMode = new EventEmitter<void>();
  @Output() exitDraftMode = new EventEmitter<void>();
  @Output() closeEditor = new EventEmitter<void>();


  public keditUrl: string;
  public _windowEventListener = null;
  public _keditConfig: any = null;

  constructor(private _appAuthentication: AppAuthentication,
              private _contentEntryViewService: ContentEntryViewService,
              private _advertisementsAppViewService: AdvertisementsAppViewService,
              private _clipAndTrimAppViewService: ClipAndTrimAppViewService,
              private _quizAppViewService: QuizAppViewService,
              private _hotspotsAppViewService: HotspotsAppViewService,
              private _permissionService: KMCPermissionsService,
              private _browserService: BrowserService,
              private _appLocalization: AppLocalization,
              private _logger: KalturaLogger,
              private _appEvents: AppEventsService,
              ) {
  }

  ngOnChanges() {
      this._updateState();
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
              const displayName = this._appAuthentication.appUser.fullName;
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
              this.closeEditor.emit();
              this._contentEntryViewService.openById(postMessageData.data, ContentEntryViewSections.Metadata);
          }

          /* request for user ks.
		  * message.data = {userKS}
		  * should return a message {messageType:kea-ks, data: ks}
		  */
          if (postMessageData.messageType === 'kea-get-ks') {
              // send the user's display name based on the user ID
              const ks = this._appAuthentication.appUser.ks;
              e.source.postMessage({
                  'messageType': 'kea-ks',
                  'data': ks
              }, e.origin);
          }
      };
  }

  private _removePostMessagesListener(): void {
      window.removeEventListener('message', this._windowEventListener);
  }

  private _addPostMessagesListener() {
      this._removePostMessagesListener();
      window.addEventListener('message', this._windowEventListener);
  }

  private _updateState(): void {
      if (!this.entry || !this.tab) {
          this._logger.info('remove kedit application since some required data is missing', {
              hasEntry: !!this.entry,
              hasTab: !!this.tab
          });
          this.keditUrl = null;
          this._keditConfig = null;
          this._removePostMessagesListener();
          return;
      }

      setTimeout(() => {
          this._logger.info('initialize kedit application', {tab: this.tab});

          this.keditUrl = null;
          this._keditConfig = null;

          const serviceUrl = getKalturaServerUri();
          const tabs = {};
          const clipAndTrimAvailable = this._clipAndTrimAppViewService.isAvailable({
              entry: this.entry,
              hasSource: this.entryHasSource
          });
          const advertismentsAvailable = this._advertisementsAppViewService.isAvailable({
              entry: this.entry,
              hasSource: this.entryHasSource
          });
          const quizAvailable = this._quizAppViewService.isAvailable({
              entry: this.entry,
              hasSource: this.entryHasSource
          });
          const hotspotsAvailable = this._hotspotsAppViewService.isAvailable({
              entry: this.entry,
              hasSource: this.entryHasSource
          });

          if (clipAndTrimAvailable) {
              this._logger.debug('clip&trim views are available, add configuration for tabs: edit, quiz');
              const clipAndTrimPermissions = [];
              if (this._permissionService.hasAnyPermissions([
                  KMCPermissions.CONTENT_INGEST_INTO_READY,
                  KMCPermissions.CONTENT_INGEST_REPLACE])
              ) {
                  clipAndTrimPermissions.push('trim');
              }

              if (this._permissionService.hasPermission(KMCPermissions.CONTENT_INGEST_CLIP_MEDIA)) {
                  clipAndTrimPermissions.push('clip');
              }

              Object.assign(tabs, {
                  'edit': {
                      name: 'edit',
                      permissions: clipAndTrimPermissions,
                      userPermissions: clipAndTrimPermissions
                  }
              });
          }

          if (advertismentsAvailable) {
              this._logger.debug('advertisements view is available, add configuration for tabs: advertisements');
              tabs['advertisements'] = {
                  name: 'advertisements',
                  permissions: ['FEATURE_ALLOW_VAST_CUE_POINT_NO_URL', 'CUEPOINT_MANAGE', 'FEATURE_DISABLE_KMC_KDP_ALERTS']
                      .filter(permission => this._permissionService.hasPermission(KMCPermissions[permission])),
                  userPermissions: []
              };
          }

          if (quizAvailable) {
              this._logger.debug('quiz view is available, add configuration for tabs: quiz');
              tabs['quiz'] = {
                  name: 'quiz',
                  permissions: ['quiz'],
                  userPermissions: ['quiz']
              };
          }

          if (hotspotsAvailable) {
              this._logger.debug('hotspots view is available, add configuration for tabs: hotspots');
              tabs['hotspots'] = {
                  name: 'hotspots',
              };
          }

          let requestedTabIsNotAvailable = false;
          let keditUrl = null;
          switch (this.tab) {
              case 'quiz':
                  if (quizAvailable) {
                      keditUrl = serverConfig.externalApps.editor.uri;
                  } else {
                      requestedTabIsNotAvailable = true;
                  }
                  break;
              case 'editor':
                  if (clipAndTrimAvailable) {
                      keditUrl = serverConfig.externalApps.editor.uri;
                  } else {
                      requestedTabIsNotAvailable = true;
                  }
                  break;
              case 'advertisements':
                  if (advertismentsAvailable) {
                      keditUrl = serverConfig.externalApps.editor.uri;
                  } else {
                      requestedTabIsNotAvailable = true;
                  }
                  break;
              case 'hotspots':
                  if (hotspotsAvailable) {
                      keditUrl = serverConfig.externalApps.editor.uri;
                  } else {
                      requestedTabIsNotAvailable = true;
                  }
                  break;
              default:
                  keditUrl = null;
                  break;
          }

keditUrl = "https://kmc.kaltura.com/apps/kea/v2.29.34/index.html";
          if (keditUrl) {
              this._logger.debug('show kedit application', {keditUrl: keditUrl, tab: this.tab});
              const isLiveEntry = [
                  KalturaMediaType.liveStreamFlash,
                  KalturaMediaType.liveStreamWindowsMedia,
                  KalturaMediaType.liveStreamRealMedia,
                  KalturaMediaType.liveStreamQuicktime
              ].indexOf(this.entry.mediaType) !== -1;
              const entryId = isLiveEntry ? (<KalturaLiveEntry>this.entry).recordedEntryId : this.entry.id;
              this.keditUrl = keditUrl;
              this._keditConfig = {
                  'messageType': 'kea-config',
                  'data': {
                      /* URL of the Kaltura Server to use */
                      'service_url': serviceUrl,

                      /* the partner ID to use */
                      'partner_id': this._appAuthentication.appUser.partnerId,

                      /* Kaltura session key to use */
                      'ks': this._appAuthentication.appUser.ks,

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
                      'entry_id': entryId,

                      /* should a KS be appended to the thumbnails url, for access control issues */
                      'load_thumbnail_with_ks': false,

                      /* should hide the navigation bar (sidebar holding the tabs) */
                      'hide_navigation_bar': false
                  }
              };
              this._addPostMessagesListener();
          } else {
              this._logger.warn('abort initialization of kedit application, missing required parameters', {
                  requestedTabIsNotAvailable,
                  tab: this.tab
              });
          }
      });
  }


  ngOnDestroy() {
    this._removePostMessagesListener();
  }

}
