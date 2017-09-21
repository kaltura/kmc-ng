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
  isLive: boolean = false;
  isEntryReady: boolean = false;
  isRecordedLive: boolean = false;
  isClip: boolean = false;
  flagsAmount: string = '';
  userId: string = '';

  @Input() parentPopupWidget: PopupWidgetComponent;
  iframeSrc : string = "http://cdnapi.kaltura.com/p/2288171/sp/228817100/embedIframeJs/uiconf_id/38524931/partner_id/2288171?iframeembed=true&flashvars[closedCaptions.plugin]=true&flashvars[EmbedPlayer.SimulateMobile]=true&&flashvars[ks]=djJ8MjI4ODE3MXy7ZEOeJZ6JI-Whlij2xzVaW8D8Nn9J_ji-FECxBz9iLIeh1cclSKl85YvbTTUW2nfmVRcTjkKrpLR3VVFLajvqH2atyVu_mXzrhpvjrj049HWICvOroFnhh8NCF_7PI2hgyyAHj-tMJmYLCPglFCZq&flashvars[EmbedPlayer.EnableMobileSkin]=true&entry_id=1_yskuq0ef";

	constructor(
	  private _moderationStore: ModerationStore,
    private _appLocalization: AppLocalization,
    private _router: Router
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
          alert(this._appLocalization.get('applications.content.moderation.notificationHasBeenSent'));
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

  ngOnInit() {
    this._moderationStore.loadEntryModerationDetails("1_mxclxdmq"); /* TODO temporary hardcoded for testing, should be removed */

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
            const sourceType = response.entry.sourceType.toString();
            this.isLive = (sourceType === KalturaSourceType.liveStream.toString() ||
                           sourceType === KalturaSourceType.akamaiLive.toString() ||
                           sourceType === KalturaSourceType.akamaiUniversalLive.toString() ||
                           sourceType === KalturaSourceType.manualLiveStream.toString());
            this.hasDuration = (response.entry.status !== KalturaEntryStatus.noContent && !this.isLive && response.entry.mediaType.toString() !== KalturaMediaType.image.toString());
            this.isEntryReady = response.entry.status.toString() === KalturaEntryStatus.ready.toString();
            this.isRecordedLive = (sourceType === KalturaSourceType.recordedLive.toString());
            this.isClip = !this.isRecordedLive && (response.entry.id !== response.entry.rootEntryId);
            let moderationCount = response.entry.moderationCount;
            this.flagsAmount = moderationCount === 1 ? this._appLocalization.get('applications.content.moderation.flagSingular', {0: moderationCount}) : this._appLocalization.get('applications.content.moderation.flagPlural', {0: moderationCount});
            this.userId = response.entry.userId;
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
                      this._moderationStore.loadEntryModerationDetails("1_mxclxdmq");
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
