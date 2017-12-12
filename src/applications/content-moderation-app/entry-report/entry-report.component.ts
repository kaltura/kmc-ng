import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { ModerationStore } from '../moderation-store/moderation-store.service';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { Router } from '@angular/router';
import { AppAuthentication, BrowserService } from 'app-shared/kmc-shell';
import { BulkService } from '../bulk-service/bulk.service';
import { environment } from 'app-environment';
import { EntriesStore } from 'app-shared/content-shared/entries-store/entries-store.service';
import { EntryReportSections } from './entry-report-sections';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';
import { KalturaModerationFlag } from 'kaltura-ngx-client/api/types/KalturaModerationFlag';
import { KalturaMediaEntry } from 'kaltura-ngx-client/api/types/KalturaMediaEntry';
import { KalturaSourceType } from 'kaltura-ngx-client/api/types/KalturaSourceType';
import { KalturaEntryStatus } from 'kaltura-ngx-client/api/types/KalturaEntryStatus';
import { KalturaMediaType } from 'kaltura-ngx-client/api/types/KalturaMediaType';
import { Observer } from 'rxjs/Observer';

export interface Tabs {
  name: string;
  isActive: boolean;
}

@Component({
  selector: 'kEntryReport',
  templateUrl: './entry-report.component.html',
  styleUrls: ['./entry-report.component.scss'],
  providers: [ModerationStore]
})

export class EntryReportComponent implements OnInit, OnDestroy {
  @Input() parentPopupWidget: PopupWidgetComponent;
  @Input() entryId: string;

  private _isRecordedLive = false;
  private _userId = '';
  private _partnerID = this.appAuthentication.appUser.partnerId;
  private _flashVars = `flashvars[closedCaptions.plugin]=true&flashvars[EmbedPlayer.SimulateMobile]=true&flashvars[EmbedPlayer.EnableMobileSkin]=true`;
  private _UIConfID = environment.core.kaltura.previewUIConf;
  private _shouldConfirmEntryApproval = false; // TODO [kmcng] need to get such permissions from somewhere
  private _shouldConfirmEntryRejection = false; // TODO [kmcng] need to get such permissions from somewhere

  public _areaBlockerMessage: AreaBlockerMessage = null;
  public _tabs: Tabs[] = [
    { name: this._appLocalization.get('applications.content.moderation.report'), isActive: true },
    { name: this._appLocalization.get('applications.content.moderation.details'), isActive: false }
  ];
  public _flags: KalturaModerationFlag[] = null;
  public _entry: KalturaMediaEntry = null;
  public _hasDuration = false;
  public _isEntryReady = false;
  public _isClip = false;
  public _flagsAmount = '';
  public EntryReportSections = EntryReportSections;
  public _iframeSrc = '';

  constructor(public _moderationStore: ModerationStore,
              private _appLocalization: AppLocalization,
              private _router: Router,
              private _browserService: BrowserService,
              private _bulkService: BulkService,
              private appAuthentication: AppAuthentication,
              private _entriesStore: EntriesStore) {
  }

  ngOnInit() {
    this._loadEntryModerationDetails();
  }

  ngOnDestroy() {
  }

  private _getObserver(retryFn: () => void): Observer<any> {
    return {
      next: () => {
        this._closePopup();
        this._entriesStore.reload(true);
        this._areaBlockerMessage = null;
      },
      error: (error) => {
        this._areaBlockerMessage = new AreaBlockerMessage({
          message: error.message,
          buttons: [
            {
              label: this._appLocalization.get('app.common.retry'),
              action: () => {
                this._areaBlockerMessage = null;
                retryFn();
              }
            },
            {
              label: this._appLocalization.get('app.common.cancel'),
              action: () => {
                this._areaBlockerMessage = null;
              }
            }
          ]
        });
      },
      complete: () => {
        // empty by design
      }
    };
  }

  private _doApproveEntry(): void {
    const retryFn = () => this._doApproveEntry();
    this._areaBlockerMessage = null;
    this._bulkService.approveEntry([this._entry.id])
      .cancelOnDestroy(this)
      .tag('block-shell')
      .subscribe(this._getObserver(retryFn));
  }

  private _doRejectEntry(): void {
    const retryFn = () => this._doRejectEntry();
    this._areaBlockerMessage = null;
    this._bulkService.rejectEntry([this._entry.id])
      .cancelOnDestroy(this)
      .tag('block-shell')
      .subscribe(this._getObserver(retryFn));
  }

  private _loadEntryModerationDetails(): void {
    this._moderationStore.loadEntryModerationDetails(this.entryId)
      .cancelOnDestroy(this)
      .subscribe(
        response => {
          this._areaBlockerMessage = null;
          if (response.entry && response.flag) {
            this._entry = response.entry;
            this._flags = response.flag.objects;
            const moderationCount = response.entry.moderationCount;
            this._flagsAmount = moderationCount === 1
              ? this._appLocalization.get('applications.content.moderation.flagSingular', { 0: moderationCount })
              : this._appLocalization.get('applications.content.moderation.flagPlural', { 0: moderationCount });
            this._userId = response.entry.userId;

            if (response.entry.sourceType) {
              const sourceType = response.entry.sourceType.toString();
              const isLive = (sourceType === KalturaSourceType.liveStream.toString() ||
                sourceType === KalturaSourceType.akamaiLive.toString() ||
                sourceType === KalturaSourceType.akamaiUniversalLive.toString() ||
                sourceType === KalturaSourceType.manualLiveStream.toString());
              this._hasDuration = response.entry.status !== KalturaEntryStatus.noContent
                && !isLive
                && response.entry.mediaType.toString() !== KalturaMediaType.image.toString();
              this._isEntryReady = response.entry.status.toString() === KalturaEntryStatus.ready.toString();
              if (isLive) {
                this._flashVars += '&flashvars[disableEntryRedirect]=true';
              }
              this._isRecordedLive = (sourceType === KalturaSourceType.recordedLive.toString());
              this._isClip = !this._isRecordedLive && (response.entry.id !== response.entry.rootEntryId);
            }
            this._iframeSrc = `${environment.core.kaltura.cdnUrl}/p/${this._partnerID}/sp/${this._partnerID}00/embedIframeJs/uiconf_id/${this._UIConfID}/partner_id/${this._partnerID}?iframeembed=true&${this._flashVars}&entry_id=${this.entryId}`;
          }
        },
        error => {
          this._areaBlockerMessage = new AreaBlockerMessage({
            message: error.message,
            buttons: [
              {
                label: this._appLocalization.get('app.common.retry'),
                action: () => {
                  this._areaBlockerMessage = null;
                  this._loadEntryModerationDetails();
                }
              },
              {
                label: this._appLocalization.get('app.common.cancel'),
                action: () => {
                  this._closePopup();
                  this._areaBlockerMessage = null;
                }
              }
            ]
          });
        }
      );
  }

  public _closePopup(): void {
    if (this.parentPopupWidget) {
      this.parentPopupWidget.close();
    }
  }

  public _changeTab(index: number): void {
    this._tabs.forEach(tab => tab.isActive = false);
    this._tabs[index].isActive = true;
  }

  public _navigateToEntry(entryId): void {
    this._router.navigate(['content/entries/entry', entryId]);
  }

  public _banCreator(): void {
    this._moderationStore.banCreator(this._userId)
      .cancelOnDestroy(this)
      .tag('block-shell')
      .subscribe(
        () => {
          this._browserService.alert({
            message: this._appLocalization.get('applications.content.moderation.notificationHasBeenSent')
          });
        },
        error => {
          this._areaBlockerMessage = new AreaBlockerMessage({
            message: error.message,
            buttons: [
              {
                label: this._appLocalization.get('app.common.retry'),
                action: () => {
                  this._areaBlockerMessage = null;
                  this._banCreator();
                }
              },
              {
                label: this._appLocalization.get('app.common.cancel'),
                action: () => {
                  this._areaBlockerMessage = null;
                }
              }
            ]
          });
        }
      );
  }

  public _approveEntry(): void {
    if (!this._shouldConfirmEntryApproval) { // TODO [kmcng] need to get such permissions from somewhere
      this._browserService.confirm({
        header: this._appLocalization.get('applications.content.moderation.approveMedia'),
        message: this._appLocalization.get('applications.content.moderation.sureToApprove', { 0: this._entry.name }),
        accept: () => this._doApproveEntry()
      });
    } else {
      this._doApproveEntry();
    }
  }

  public _rejectEntry(): void {
    if (!this._shouldConfirmEntryRejection) { // TODO [kmcng] need to get such permissions from somewhere
      this._browserService.confirm({
        header: this._appLocalization.get('applications.content.moderation.rejectMedia'),
        message: this._appLocalization.get('applications.content.moderation.sureToReject', { 0: this._entry.name }),
        accept: () => this._doRejectEntry()
      });
    } else {
      this._doRejectEntry();
    }
  }
}
