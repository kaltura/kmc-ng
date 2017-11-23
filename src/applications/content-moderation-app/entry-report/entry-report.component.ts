import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { ModerationStore } from '../moderation-store/moderation-store.service';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { KalturaMediaEntry } from 'kaltura-typescript-client/types/KalturaMediaEntry';
import { KalturaEntryStatus } from 'kaltura-typescript-client/types/KalturaEntryStatus';
import { KalturaSourceType } from 'kaltura-typescript-client/types/KalturaSourceType';
import { KalturaMediaType } from 'kaltura-typescript-client/types/KalturaMediaType';
import { Router } from '@angular/router';
import { KalturaModerationFlag } from 'kaltura-typescript-client/types/KalturaModerationFlag';
import { AppAuthentication, BrowserService } from 'app-shared/kmc-shell';
import { BulkService } from '../bulk-service/bulk.service';
import { environment } from 'app-environment';
import { EntriesStore } from 'app-shared/content-shared/entries-store/entries-store.service';
import { EntryReportSections } from './entry-report-sections';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';

export interface Tabs {
  name: string;
  isActive: boolean;
}

@Component({
	selector: 'kEntryReport',
	templateUrl: './entry-report.component.html',
	styleUrls: ['./entry-report.component.scss'],
  providers: [ ModerationStore ]
})

export class EntryReportComponent implements OnInit, OnDestroy {
  showLoader = false;
  areaBlockerMessage: AreaBlockerMessage = null;
  tabs: Tabs[] = [];
  flags: KalturaModerationFlag[] = null;
  entry: KalturaMediaEntry = null;
  hasDuration: boolean = false;
  isEntryReady: boolean = false;
  isRecordedLive: boolean = false;
  isClip: boolean = false;
  flagsAmount: string = '';
  userId: string = '';
  shouldConfirmEntryApproval: boolean = false; // TODO [kmcng] need to get such permissions from somewhere
  shouldConfirmEntryRejection: boolean = false; // TODO [kmcng] need to get such permissions from somewhere
  EntryReportSections = EntryReportSections;

  @Input() parentPopupWidget: PopupWidgetComponent;
  @Input() entryId: string;
  partnerID = this.appAuthentication.appUser.partnerId;
  flashVars = `flashvars[closedCaptions.plugin]=true&flashvars[EmbedPlayer.SimulateMobile]=true&flashvars[EmbedPlayer.EnableMobileSkin]=true`;
  UIConfID = environment.core.kaltura.previewUIConf;
  iframeSrc: string = '';

	constructor(
	  public _moderationStore: ModerationStore,
    private _appLocalization: AppLocalization,
    private _router: Router,
    private _browserService: BrowserService,
    private _bulkService: BulkService,
    private appAuthentication: AppAuthentication,
    private _entriesStore: EntriesStore
  ) {}

  private _closePopup(): void {
    if (this.parentPopupWidget){
      this.parentPopupWidget.close();
    }
  }

  private _changeTab(index: number): void {
    this.tabs.forEach(tab => tab.isActive = false);
    this.tabs[index].isActive = true;
  }

  private _navigateToEntry(entryId): void {
    this._router.navigate(["content/entries/entry", entryId]);
  }

  private _banCreator(): void {
    this._moderationStore.banCreator(this.userId)
      .cancelOnDestroy(this)
      .tag('block-shell')
      .subscribe(
        () => {
          this._browserService.alert(
            {
              message: this._appLocalization.get('applications.content.moderation.notificationHasBeenSent')
            }
          );
        },
        error => {
          this.areaBlockerMessage = new AreaBlockerMessage(
            {
              message: error.message,
              buttons: [
                {
                  label: this._appLocalization.get('app.common.retry'),
                  action: () => {
                    this.areaBlockerMessage = null;
                    this._banCreator();
                  }
                },
                {
                  label: this._appLocalization.get('app.common.cancel'),
                  action: () => {
                    this.areaBlockerMessage = null;
                  }
                }
              ]
            }
          )
        }
      );
  }

  private _approveEntry(): void {
    if(!this.shouldConfirmEntryApproval) { // TODO [kmcng] need to get such permissions from somewhere
      this._browserService.confirm(
        {
          header: this._appLocalization.get('applications.content.moderation.approveMedia'),
          message: this._appLocalization.get('applications.content.moderation.sureToApprove', {0: this.entry.name}),
          accept: () => {
            this._doApproveEntry();
          }
        }
      )
    } else {
      this._doApproveEntry();
    }
  }

  private _doApproveEntry(): void {
    this._bulkService.approveEntry([this.entry.id])
      .cancelOnDestroy(this)
      .tag('block-shell')
      .subscribe(
        () => {
          this._closePopup();
          this._entriesStore.reload(true);
        },
        error => {
          this.areaBlockerMessage = new AreaBlockerMessage(
            {
              message: error.message,
              buttons: [
                {
                  label: this._appLocalization.get('app.common.retry'),
                  action: () => {
                    this.areaBlockerMessage = null;
                    this._doApproveEntry();
                  }
                },
                {
                  label: this._appLocalization.get('app.common.cancel'),
                  action: () => {
                    this.areaBlockerMessage = null;
                  }
                }
              ]
            }
          )
        }
      );
  }

  private _rejectEntry(): void {
    if(!this.shouldConfirmEntryRejection) { // TODO [kmcng] need to get such permissions from somewhere
      this._browserService.confirm(
        {
          header: this._appLocalization.get('applications.content.moderation.rejectMedia'),
          message: this._appLocalization.get('applications.content.moderation.sureToReject', {0: this.entry.name}),
          accept: () => {
            this._doRejectEntry();
          }
        }
      );
    } else {
      this._doRejectEntry();
    }
  }

  private _doRejectEntry(): void {
    this._bulkService.rejectEntry([this.entry.id])
      .cancelOnDestroy(this)
      .tag('block-shell')
      .subscribe(
        () => {
          this._closePopup();
          this._entriesStore.reload(true);
        },
        error => {
          this.areaBlockerMessage = new AreaBlockerMessage(
            {
              message: error.message,
              buttons: [
                {
                  label: this._appLocalization.get('app.common.retry'),
                  action: () => {
                    this.areaBlockerMessage = null;
                    this._doRejectEntry();
                  }
                },
                {
                  label: this._appLocalization.get('app.common.cancel'),
                  action: () => {
                    this.areaBlockerMessage = null;
                  }
                }
              ]
            }
          )
        }
      );
  }

  ngOnInit() {
    this._moderationStore.loadEntryModerationDetails(this.entryId);

    this.tabs = [
      { name: this._appLocalization.get('applications.content.moderation.report'), isActive: true },
      { name: this._appLocalization.get('applications.content.moderation.details'), isActive: false }
    ];

    this._moderationStore.moderationData$
      .cancelOnDestroy(this)
      .subscribe(
        response => {
          this.showLoader = false;
          this.areaBlockerMessage = null;
          if(response.entry && response.flag) {
            this.entry = response.entry;
            this.flags = response.flag.objects;
            let moderationCount = response.entry.moderationCount;
            this.flagsAmount = moderationCount === 1 ? this._appLocalization.get('applications.content.moderation.flagSingular', {0: moderationCount}) : this._appLocalization.get('applications.content.moderation.flagPlural', {0: moderationCount});
            this.userId = response.entry.userId;

            if(response.entry.sourceType) {
              const sourceType = response.entry.sourceType.toString();
              const isLive = (sourceType === KalturaSourceType.liveStream.toString() ||
              sourceType === KalturaSourceType.akamaiLive.toString() ||
              sourceType === KalturaSourceType.akamaiUniversalLive.toString() ||
              sourceType === KalturaSourceType.manualLiveStream.toString());
              this.hasDuration = (response.entry.status !== KalturaEntryStatus.noContent && !isLive && response.entry.mediaType.toString() !== KalturaMediaType.image.toString());
              this.isEntryReady = response.entry.status.toString() === KalturaEntryStatus.ready.toString();
                if (isLive){
                this.flashVars += '&flashvars[disableEntryRedirect]=true';
              }
              this.isRecordedLive = (sourceType === KalturaSourceType.recordedLive.toString());
              this.isClip = !this.isRecordedLive && (response.entry.id !== response.entry.rootEntryId);
            }
            this.iframeSrc = `${environment.core.kaltura.cdnUrl}/p/${this.partnerID}/sp/${this.partnerID}00/embedIframeJs/uiconf_id/${this.UIConfID}/partner_id/${this.partnerID}?iframeembed=true&${this.flashVars}&entry_id=${this.entryId}`;
          }
        }
      );

    this._moderationStore.moderationState$
      .cancelOnDestroy(this)
      .subscribe(
        response => {
          this.showLoader = response.isBusy;
          this.areaBlockerMessage = null;

          if(response.error) {
            this.areaBlockerMessage = new AreaBlockerMessage(
              {
                message: response.error.message,
                buttons: [
                  {
                    label: this._appLocalization.get('app.common.retry'),
                    action: () => {
                      this._moderationStore.loadEntryModerationDetails(this.entryId);
                    }
                  },
                  {
                    label: this._appLocalization.get('app.common.cancel'),
                    action: () => {
                      this.areaBlockerMessage = null;
                    }
                  }
                ]
              }
            );
          } else {
            this.areaBlockerMessage = null;
          }
        }
      );
  }

	ngOnDestroy() {}
}
