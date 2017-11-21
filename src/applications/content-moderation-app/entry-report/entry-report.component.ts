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

export interface Tabs {
  name: string;
  isActive: boolean;
}

@Component({
	selector: 'kEntryReport',
	templateUrl: './entry-report.component.html',
	styleUrls: ['./entry-report.component.scss']
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
  isEntryPermissionApproved: boolean = false;
  isEntryPermissionRejected: boolean = false;
  EntryReportSections = EntryReportSections;

  @Input() parentPopupWidget: PopupWidgetComponent;
  @Input() entryId: string;
  ks = this.appAuthentication.appUser.ks || "";
  partnerID = this.appAuthentication.appUser.partnerId;
  flashVars = `flashvars[closedCaptions.plugin]=true&flashvars[EmbedPlayer.SimulateMobile]=true&&flashvars[ks]=${this.ks}&flashvars[EmbedPlayer.EnableMobileSkin]=true`;
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

  closePopup(): void {
    if (this.parentPopupWidget){
      this.parentPopupWidget.close();
    }
  }

  changeTab(index: number): void {
    this.tabs.forEach(tab => tab.isActive = false);
    this.tabs[index].isActive = true;
  }

  navigateToEntry(entryId): void {
    this._router.navigate(["content/entries/entry", entryId]);
  }

  banCreator(): void {
    this.showLoader = true;
    this._moderationStore.banCreator(this.userId)
      .cancelOnDestroy(this)
      .subscribe(
        () => {
          this.showLoader = false;
          this._browserService.alert(
            {
              message: this._appLocalization.get('applications.content.moderation.notificationHasBeenSent')
            }
          );
        },
        error => {
          this.showLoader = false;
          this.areaBlockerMessage = new AreaBlockerMessage(
            {
              message: error.message,
              buttons: [
                {
                  label: this._appLocalization.get('app.common.retry'),
                  action: () => {
                    this.areaBlockerMessage = null;
                    this.banCreator();
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

  approveEntry(): void {
    if(!this.isEntryPermissionApproved) { // TODO [kmcng] need to get such permissions from somewhere
      this._browserService.confirm(
        {
          header: this._appLocalization.get('applications.content.moderation.approveMedia'),
          message: this._appLocalization.get('applications.content.moderation.sureToApprove', {0: this.entry.name}),
          accept: () => {
            this.doApproveEntry();
          }
        }
      )
    } else {
      this.doApproveEntry();
    }
  }

  doApproveEntry(): void {
    this.showLoader = true;
    this._bulkService.approveEntry([this.entry.id])
      .cancelOnDestroy(this)
      .subscribe(
        () => {
          this.showLoader = false;
          this.closePopup();
          this._entriesStore.reload(true);
        },
        error => {
          this.showLoader = false;
          this.areaBlockerMessage = new AreaBlockerMessage(
            {
              message: error.message,
              buttons: [
                {
                  label: this._appLocalization.get('app.common.retry'),
                  action: () => {
                    this.areaBlockerMessage = null;
                    this.doApproveEntry();
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

  rejectEntry(): void {
    if(!this.isEntryPermissionRejected) { // TODO [kmcng] need to get such permissions from somewhere
      this._browserService.confirm(
        {
          header: this._appLocalization.get('applications.content.moderation.rejectMedia'),
          message: this._appLocalization.get('applications.content.moderation.sureToReject', {0: this.entry.name}),
          accept: () => {
            this.doRejectEntry();
          }
        }
      );
    } else {
      this.doRejectEntry();
    }
  }

  doRejectEntry(): void {
    this.showLoader = true;
    this._bulkService.rejectEntry([this.entry.id])
      .cancelOnDestroy(this)
      .subscribe(
        () => {
          this.showLoader = false;
          this.closePopup();
          this._entriesStore.reload(true);
        },
        error => {
          this.showLoader = false;
          this.areaBlockerMessage = new AreaBlockerMessage(
            {
              message: error.message,
              buttons: [
                {
                  label: this._appLocalization.get('app.common.retry'),
                  action: () => {
                    this.areaBlockerMessage = null;
                    this.doRejectEntry();
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
            this.isClip = !this.isRecordedLive && (response.entry.id !== response.entry.rootEntryId);
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
