import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { EntriesListComponent } from 'app-shared/content-shared/entries/entries-list/entries-list.component';
import {AppAnalytics, AppAuthentication, AppBootstrap, BrowserService, NewEntryUploadFile} from 'app-shared/kmc-shell';
import { EntriesStore } from 'app-shared/content-shared/entries/entries-store/entries-store.service';
import { AreaBlockerMessage, PopupWidgetComponent } from '@kaltura-ng/kaltura-ui';
import { EntriesTableColumns } from 'app-shared/content-shared/entries/entries-table/entries-table.component';
import { ContentEntriesAppService } from '../content-entries-app.service';
import { AppEventsService } from 'app-shared/kmc-shared';
import { PreviewAndEmbedEvent } from 'app-shared/kmc-shared/events';
import { cancelOnDestroy, tag, TrackedFileStatuses, UploadManagement } from '@kaltura-ng/kaltura-common';
import { UpdateEntriesListEvent } from 'app-shared/kmc-shared/events/update-entries-list-event';
import { KMCPermissions, KMCPermissionsService } from 'app-shared/kmc-shared/kmc-permissions';
import { EntriesListService } from './entries-list.service';
import { ContentEntryViewSections, ContentEntryViewService, ReachAppViewService, ReachPages } from 'app-shared/kmc-shared/kmc-views/details-views';
import { LiveDashboardAppViewService } from 'app-shared/kmc-shared/kmc-views/component-views';
import { AnalyticsNewMainViewService, ContentEntriesMainViewService } from 'app-shared/kmc-shared/kmc-views';
import { ClearEntriesSelectionEvent } from 'app-shared/kmc-shared/events/clear-entries-selection-event';
import { ColumnsResizeManagerService, ResizableColumnsTableName } from 'app-shared/kmc-shared/columns-resize-manager';
import { filter } from 'rxjs/operators';
import {KalturaClient, KalturaMediaEntry, KalturaPlaylist, KalturaQuizOutputType, QuizGetUrlAction} from 'kaltura-ngx-client';
import {PubSubServiceType} from '@unisphere/runtime';
import {Observable} from 'rxjs';
import {throwError as ObservableThrowError} from 'rxjs/internal/observable/throwError';
import {KalturaLogger} from '@kaltura-ng/kaltura-logger';

@Component({
  selector: 'kEntriesListHolder',
  templateUrl: './entries-list-holder.component.html',
    providers: [
        ColumnsResizeManagerService,
        KalturaLogger.createLogger('EntriesListComponent'),
        { provide: ResizableColumnsTableName, useValue: 'entries-table' }
    ]
})
export class EntriesListHolderComponent implements OnInit, OnDestroy {
  @ViewChild(EntriesListComponent, { static: true }) public _entriesList: EntriesListComponent;
  @ViewChild('liveDashboard', { static: true }) _liveDashboard: PopupWidgetComponent;
  @ViewChild('clipAndTrim', { static: true }) _clipAndTrimPopup: PopupWidgetComponent;

  public _entryId: string = null;
  public _blockerMessage: AreaBlockerMessage = null;
  public _contentLabAvailable = false;
  public _contentLabEntry: KalturaMediaEntry | null = null;

  public _columns: EntriesTableColumns = {
    thumbnailUrl: { width: '100px' },
    name: { width: '100%', sortable: true },
    id: { width: '100px' },
    mediaType: { sortable: true, width: '70px', align: 'center' },
    plays: { sortable: true, width: '70px' },
    createdAt: { sortable: true, width: '140px' },
    duration: { sortable: true, width: '80px' },
    status: { width: '100px' }
  };

  public _rowActions = [
    {
      label: this._appLocalization.get('applications.content.table.previewAndEmbed'),
      commandName: 'preview',
      styleClass: ''
    },
    {
      label: this._appLocalization.get('applications.content.table.view'),
      commandName: 'view',
      styleClass: ''
    },
      {
          label: this._appLocalization.get('applications.content.table.realTimeAnalytics'),
          commandName: 'realTimeAnalytics',
          styleClass: '',
          disabled: !this._analyticsNewMainViewService.isAvailable()
      },
      {
          label: this._appLocalization.get('applications.content.table.webcastAnalytics'),
          commandName: 'webcastAnalytics',
          styleClass: '',
          disabled: !this._analyticsNewMainViewService.isAvailable()
      },
      {
          label: this._appLocalization.get('applications.content.table.captionRequest'),
          commandName: 'captionRequest'
      },
    {
      label: this._appLocalization.get('applications.content.table.delete'),
      commandName: 'delete',
      styleClass: 'kDanger'
    }
  ];

    private unisphereRuntime: any = null;
    private unsubscribeToUnisphereEvents: () => void = null;

  constructor(private _router: Router,
              private _entriesListService: EntriesListService,
              private _browserService: BrowserService,
              private _analytics: AppAnalytics,
              private _appEvents: AppEventsService,
              private _appLocalization: AppLocalization,
              private _uploadManagement: UploadManagement,
              private _permissionsService: KMCPermissionsService,
              public _entriesStore: EntriesStore,
              private _appAuthentication: AppAuthentication,
              private _logger: KalturaLogger,
              private _kalturaServerClient: KalturaClient,
              private _bootstrapService: AppBootstrap,
              private _contentEntryViewService: ContentEntryViewService,
              private _contentEntriesAppService: ContentEntriesAppService,
              private _contentEntriesMainViewService: ContentEntriesMainViewService,
              private _reachAppViewService: ReachAppViewService,
              private _analyticsNewMainViewService: AnalyticsNewMainViewService,
              private _liveDashboardAppViewService: LiveDashboardAppViewService) {
      _appEvents.event(ClearEntriesSelectionEvent)
          .pipe(cancelOnDestroy(this))
          .subscribe(() => {
              if (this._entriesList) {
                  this._entriesList.clearSelection();
              }
          });
  }

  ngOnInit() {
      if (this._contentEntriesMainViewService.viewEntered()) {
          this._prepare();
      }
  }

  ngOnDestroy() {
    if (this.unsubscribeToUnisphereEvents) {
        this.unsubscribeToUnisphereEvents();
        this.unsubscribeToUnisphereEvents = null;
    }
  }

  private _prepare(): void {
      this._contentLabAvailable = this._permissionsService.hasPermission(KMCPermissions.FEATURE_CONTENT_LAB);
      if (this._entriesListService.isViewAvailable) {
          this._entriesStore.reload();
      }

      this._uploadManagement.onTrackedFileChanged$
          .pipe(cancelOnDestroy(this))
          .pipe(filter(trackedFile => trackedFile.data instanceof NewEntryUploadFile && trackedFile.status === TrackedFileStatuses.uploadCompleted))
          .subscribe(() => {
              this._entriesStore.reload();
          });

      this._appEvents.event(UpdateEntriesListEvent)
          .pipe(cancelOnDestroy(this))
          .subscribe(() => this._entriesStore.reload());

      const hasEmbedPermission = this._permissionsService.hasPermission(KMCPermissions.CONTENT_MANAGE_EMBED_CODE);
      if (!hasEmbedPermission) {
          this._rowActions[0].label = this._appLocalization.get('applications.content.table.previewInPlayer');
      }

      if (this._contentLabAvailable) {
          this.registerToContentLabAction();
      }
  }

  private registerToContentLabAction(): void {
      this._bootstrapService.unisphereWorkspace$
          .pipe(cancelOnDestroy(this))
          .subscribe(unisphereWorkspace => {
              if (unisphereWorkspace) {
                  this.unisphereRuntime = unisphereWorkspace.getRuntime('unisphere.widget.content-lab', 'application');
                  if (this.unisphereRuntime) {
                      this.unsubscribeToUnisphereEvents = unisphereWorkspace.getService<PubSubServiceType>('unisphere.service.pub-sub')?.subscribe('unisphere.event.module.content-lab.message-host-app', (data) => {
                          const {action, entry} = data.payload;
                          switch (action) {
                              case 'entry':
                                  // navigate to entry
                                  this.unisphereRuntime?.closeWidget(); // close widget
                                  document.body.style.overflowY = "auto";
                                  this._router.navigateByUrl(`/content/entries/entry/${entry.id}/metadata`);
                                  // this._entryStore.openEntry(new KalturaMediaEntry(entry)); // TODO - handle in entry page
                                  break;
                              case 'playlist':
                                  // navigate to playlist metadata tab
                                  this.unisphereRuntime?.closeWidget(); // close widget
                                  document.body.style.overflowY = "auto";
                                  this._router.navigateByUrl(`/content/playlists/playlist/${entry.id}/metadata`);
                                  break;
                              case 'editPlaylist':
                                  // navigate to playlist content tb
                                  this.unisphereRuntime?.closeWidget(); // close widget
                                  document.body.style.overflowY = "auto";
                                  this._router.navigateByUrl(`/content/playlists/playlist/${entry.id}/content`);
                                  break;
                              case 'download':
                                  // download entry
                                  const downloadUrl = entry.downloadUrl.indexOf('/ks/') === -1 ? `${entry.downloadUrl}/ks/${this._appAuthentication.appUser.ks}` : entry.downloadUrl;
                                  this._browserService.openLink(downloadUrl);
                                  break;
                              case 'share':
                                  // open share & embed for entry
                                  this.unisphereRuntime?.closeWidget(); // close widget
                                  document.body.style.overflowY = "auto";
                                  this._appEvents.publish(new PreviewAndEmbedEvent(new KalturaMediaEntry(entry)));
                                  break;
                              case 'addCaptions':
                                  // open captions tab
                                  this.unisphereRuntime?.closeWidget(); // close widget
                                  document.body.style.overflowY = "auto";
                                  this._router.navigateByUrl(`/content/entries/entry/${entry.id}/captions`);
                                  break;
                              case 'sharePlaylist':
                                  // open share & embed for playlist
                                  this.unisphereRuntime?.closeWidget(); // close widget
                                  document.body.style.overflowY = "auto";
                                  this._appEvents.publish(new PreviewAndEmbedEvent(new KalturaPlaylist(entry)));
                                  break;
                              case 'editQuiz':
                                  // edit entry
                                  this._contentLabEntry = new KalturaMediaEntry(entry);
                                  this.unisphereRuntime?.closeWidget();
                                  document.body.style.overflowY = "auto";
                                  this._clipAndTrimPopup.open();
                                  break;
                              case 'downloadQuiz':
                                  // download questions list
                                  this._downloadPretest(entry.id)
                                  break;
                              case 'updateMetadata':
                                  // update metadata
                                  this._entriesStore.reload();
                                  // this._entryStore.reloadEntry(); todo: handle in entry page only
                                  break;
                              default:
                                  break;
                          }


                      })
                  }
              }
          });
  }

  public _onActionSelected({ action, entry }) {
    switch (action) {
      case 'preview':
        this._analytics.trackClickEvent('Share_Embed');
        this._entriesList.clearSelection();
        this._appEvents.publish(new PreviewAndEmbedEvent(entry));
        break;
      case 'view':
          this._entriesList.clearSelection();
          this._contentEntryViewService.open({ entry, section: ContentEntryViewSections.Metadata });
        break;
      case 'delete':
        this._analytics.trackClickEvent('Delete');
        this._browserService.confirm(
            {
              header: this._appLocalization.get('applications.content.entries.deleteEntry'),
              message: this._appLocalization.get('applications.content.entries.confirmDeleteSingle', { 0: entry.id }),
              accept: () => this._deleteEntry(entry.id)
            }
        );
        break;
      case 'liveDashboard':
        if (entry && entry.id) {
            this._entriesList.clearSelection();
            this._entryId = entry.id;
            this._liveDashboard.open();
        }
        break;
      case 'realTimeAnalytics':
        if (entry && entry.id) {
          this._analytics.trackClickEvent('Real-time_analytics');
          this._entriesList.clearSelection();
          this._entryId = entry.id;
            if (this._analyticsNewMainViewService.isAvailable()) {
                this._router.navigate(['analytics/entry-live'], { queryParams: { id: this._entryId }});
            }
        }
        break;
      case 'webcastAnalytics':
        if (entry && entry.id) {
          this._analytics.trackClickEvent('Webcast_analytics');
          this._entriesList.clearSelection();
          this._entryId = entry.id;
            if (this._analyticsNewMainViewService.isAvailable()) {
                this._router.navigate(['analytics/entry-webcast'], { queryParams: { id: this._entryId }});
            }
        }
        break;
        case 'captionRequest':
            this._analytics.trackClickEvent('Captions_enrich');
            this._reachAppViewService.open({ entry, page: ReachPages.entry });
            break;
      default:
        break;
    }
  }
    private downloadPretest(entryId: string): Observable<string> {
        if (!entryId) {
            return ObservableThrowError('missing entryId argument');
        }
        return this._kalturaServerClient
            .request(new QuizGetUrlAction({ entryId, quizOutputType: KalturaQuizOutputType.pdf }))
    }

    private _downloadPretest(entryId: string): void {
        if (!entryId) {
            this._logger.info('EntryId is not defined. Abort action');
            return;
        }
        this.downloadPretest(entryId)
            .pipe(
                tag('block-shell'),
                cancelOnDestroy(this)
            )
            .subscribe(
                (url) => {
                    this._browserService.openLink(url);
                },
                error => {
                    this._browserService.alert({
                        header: this._appLocalization.get('app.common.error'),
                        message: error.message
                    });
                }
            );
    }

  private _deleteEntry(entryId: string): void {
    if (!entryId) {
      console.error('EntryId is not defined');
      return;
    }

    this._blockerMessage = null;
    this._contentEntriesAppService.deleteEntry(entryId)
      .pipe(tag('block-shell'))
      .subscribe(
        () => {
            this._entriesList.clearSelection();
            this._entriesStore.reload();
        },
        error => {
          this._blockerMessage = new AreaBlockerMessage({
            message: error.message,
            buttons: [
              {
                label: this._appLocalization.get('app.common.retry'),
                action: () => this._deleteEntry(entryId)
              },
              {
                label: this._appLocalization.get('app.common.cancel'),
                action: () => this._blockerMessage = null
              }
            ]
          });
        }
      );
  }
}
