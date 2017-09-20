import { Injectable, OnDestroy } from '@angular/core';
import { KalturaClient } from '@kaltura-ng/kaltura-client';
import { Observable } from 'rxjs/Observable';
import { KalturaMediaType } from 'kaltura-typescript-client/types/KalturaMediaType';
import { TrackedFileStatuses, UploadManagement } from '@kaltura-ng/kaltura-common';
import { MediaDeleteAction } from 'kaltura-typescript-client/types/MediaDeleteAction';
import { NewEntryUploadFile } from 'app-shared/kmc-shell';

export interface KmcNewEntryUpload {
  file: File;
  mediaType: KalturaMediaType;
}

@Injectable()
export class NewEntryUploadService implements OnDestroy {


  constructor(private _kalturaServerClient: KalturaClient,
              private _uploadManagement: UploadManagement) {
    this._monitorTrackedFilesChanges();
  }

  ngOnDestroy() {

  }

  private _monitorTrackedFilesChanges(): void {
    this._uploadManagement.onFileStatusChanged$
      .cancelOnDestroy(this)
      .subscribe(
        trackedFile => {
          // TODO [kmcng]
          if (trackedFile.data instanceof NewEntryUploadFile) {

            // NOTE: this service handles only 'purged' and 'waitingUpload' statuses by design.
            switch (trackedFile.status) {
              case TrackedFileStatuses.purged:
                // try to (silently) delete entry and upload token.
                // if error happens write them using _log without doing anything else
                break;
              case TrackedFileStatuses.waitingUpload:

                // 1 - try to create entry and set content using upload token
                // 2 - if failed -> cancel upload while providing an error message to that upload using the following method
                //this._uploadManagement.cancelUploadWithError(trackedFile.id,'failed to create entry');
                // 3 - try to (silently) clean up entry and upload token as done in purge


                break;
              default:

                break;
            }

          }
        }
      );
  }

  private _removeMediaEntry(entryId: string): Observable<void> {
    return this._kalturaServerClient.request(new MediaDeleteAction({ entryId }))
  }

  public upload(files: KmcNewEntryUpload[], trancodingProfileId: number): void {
    this._uploadManagement.addFiles(
      files.map(file => new NewEntryUploadFile(file.file, file.mediaType, trancodingProfileId))
    );
  }
}
