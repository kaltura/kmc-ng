import { Injectable, OnDestroy } from '@angular/core';
import { AppLocalization, TrackedFileStatus, TrackedFileStatuses, UploadManagement } from '@kaltura-ng/kaltura-common';
import { PageExitVerificationService } from 'app-shared/kmc-shell/page-exit-verification/page-exit-verification.service';
import { NewEntryUploadFile } from 'app-shared/kmc-shell';
import { NewEntryFlavourFile } from 'app-shared/kmc-shell/new-entry-flavour-file';

@Injectable()
export class UploadPageExitVerificationService implements OnDestroy {
  private _pageExitVerificationToken: string;
  private _pageExitVerificationMessage = this._appLocalizations.get('app.pageExitVerification.fileUploadMessage');

  constructor(private _appLocalizations: AppLocalization,
              private _pageExitVerificationService: PageExitVerificationService,
              private _uploadManagement: UploadManagement) {
  }

  ngOnDestroy() {

  }

  private _syncPageExitVerificationState(status: TrackedFileStatus): void {
    if ([TrackedFileStatuses.purged, TrackedFileStatuses.uploadCompleted].indexOf(status) !== -1) {
      // run checkout on the next tick to make sure file was removed from trackedFiles list
      setTimeout(() => {
        if (!this._uploadManagement.getTrackedFiles().length) {
          this._pageExitVerificationService.disablePageExitVerification(this._pageExitVerificationToken);
        }
      }, 0);
    } else {
      if (!this._pageExitVerificationToken) {
        this._pageExitVerificationToken = this._pageExitVerificationService.enablePageExitVerification(this._pageExitVerificationMessage);
      }
    }
  }

  public init(): void {
    this._uploadManagement.onTrackedFileChanged$
      .cancelOnDestroy(this)
      .filter(({ data }) => data instanceof NewEntryUploadFile || data instanceof NewEntryFlavourFile)
      .filter(({ status, progress }) => !(status === TrackedFileStatuses.uploading && progress > 0))
      .subscribe(({ status }) => {
        this._syncPageExitVerificationState(status);
      });
  }
}
