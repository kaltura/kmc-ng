import { Injectable, OnDestroy } from '@angular/core';
import { KalturaClient } from '@kaltura-ng/kaltura-client';
import { Observable } from 'rxjs/Observable';
import { ISubscription, Subscription } from 'rxjs/Subscription';
import { KalturaMediaType } from 'kaltura-typescript-client/types/KalturaMediaType';
import { TrackedFile, TrackedFileStatuses, UploadManagement } from '@kaltura-ng/kaltura-common';
import { MediaDeleteAction } from 'kaltura-typescript-client/types/MediaDeleteAction';
import { NewEntryUploadFile } from 'app-shared/kmc-shell';
import { MediaAddAction } from 'kaltura-typescript-client/types/MediaAddAction';
import { KalturaMediaEntry } from 'kaltura-typescript-client/types/KalturaMediaEntry';
import { KalturaUploadedFileTokenResource } from 'kaltura-typescript-client/types/KalturaUploadedFileTokenResource';
import { KalturaAssetParamsResourceContainer } from 'kaltura-typescript-client/types/KalturaAssetParamsResourceContainer';
import { KalturaAssetsParamsResourceContainers } from 'kaltura-typescript-client/types/KalturaAssetsParamsResourceContainers';
import { MediaUpdateContentAction } from 'kaltura-typescript-client/types/MediaUpdateContentAction';
import { UploadTokenDeleteAction } from 'kaltura-typescript-client/types/UploadTokenDeleteAction';

export interface KmcNewEntryUpload {
  file: File;
  mediaType: KalturaMediaType;
}

@Injectable()
export class NewEntryUploadService implements OnDestroy {
  private _linkEntryWithFileSub: ISubscription;

  constructor(private _kalturaServerClient: KalturaClient,
              private _uploadManagement: UploadManagement) {
    this._monitorTrackedFilesChanges();
  }

  ngOnDestroy() {

  }

  private _monitorTrackedFilesChanges(): void {
    this._uploadManagement.onFileStatusChanged$
      .cancelOnDestroy(this)
      .filter(trackedFile => trackedFile.data instanceof NewEntryUploadFile)
      .subscribe(
        trackedFile => {
          // NOTE: this service handles only 'purged' and 'waitingUpload' statuses by design.
          switch (trackedFile.status) {
            case TrackedFileStatuses.purged:
              // try to (silently) delete entry and upload token.
              // if error happens write them using _log without doing anything else
              this._cleanUpUpload(trackedFile);
              break;
            case TrackedFileStatuses.waitingUpload:
              // 0 - check if file has already have entryId
              // 1 - try to create entry and set content using upload token
              // 2 - if failed -> cancel upload while providing an error message to that upload using the following method
              // 3 - try to (silently) clean up entry and upload token as done in purge
              if (!trackedFile.entryId) {
                this._linkEntryWithFile(trackedFile);
              }
              break;
            default:
              break;
          }
        }
      );
  }

  private _cleanUpUpload(trackedFile: TrackedFile): void {
    const uploadToken = (<NewEntryUploadFile>trackedFile.data).serverUploadToken;
    const entryId = trackedFile.entryId;

    // TODO [kmcng] [question] if we cancel creating of mediaEntry it's still created. How to handle?
    if (this._linkEntryWithFileSub instanceof Subscription) {
      this._linkEntryWithFileSub.unsubscribe();
      this._linkEntryWithFileSub = null;
    }

    if (uploadToken) {
      this._removeUploadToken(uploadToken)
        .subscribe(
          () => {},
          (error) => {
            console.warn(this._formatError('Failed to remove upload token', error));
          }
        );
    }

    if (entryId) {
      this._removeMediaEntry(entryId)
        .subscribe(
          () => {},
          (error) => {
            console.warn(this._formatError('Failed to remove media entry', error));
          }
        );
    }
  }

  private _linkEntryWithFile(trackedFile: TrackedFile): void {
    this._linkEntryWithFileSub = this._createMediaEntry(<NewEntryUploadFile>trackedFile.data)
      .do(entry => this._uploadManagement.setMediaEntryId(trackedFile, entry.id))
      .switchMap((entry: KalturaMediaEntry) => this._updateMediaContent(entry, <NewEntryUploadFile>trackedFile.data))
      .subscribe(
        () => {
        },
        (error) => {
          this._uploadManagement.cancelUploadWithError(trackedFile.id, this._formatError('Failed to create entry', error));
        }
      );
  }

  private _updateMediaContent(entry: KalturaMediaEntry, file: NewEntryUploadFile): Observable<KalturaMediaEntry> {
    const entryId = entry.id;
    const conversionProfileId = file.transcodingProfileId;
    const subSubResource = new KalturaUploadedFileTokenResource({ token: file.serverUploadToken });
    let resource = null;

    if (file.mediaType === KalturaMediaType.image) {
      resource = subSubResource;
    } else {
      const subResource = new KalturaAssetParamsResourceContainer({ resource: subSubResource, assetParamsId: 0 });
      resource = new KalturaAssetsParamsResourceContainers({ resources: [subResource] });
    }

    return this._kalturaServerClient.request(new MediaUpdateContentAction({ entryId, resource, conversionProfileId }));
  }

  private _createMediaEntry(file: NewEntryUploadFile): Observable<KalturaMediaEntry> {
    return this._kalturaServerClient.request(new MediaAddAction({
      entry: new KalturaMediaEntry({
        mediaType: file.mediaType,
        name: file.getFileName(),
        conversionProfileId: file.transcodingProfileId
      })
    }));
  }

  private _removeMediaEntry(entryId: string): Observable<void> {
    return this._kalturaServerClient.request(new MediaDeleteAction({ entryId }));
  }

  private _removeUploadToken(uploadTokenId: string): Observable<void> {
    return this._kalturaServerClient.request(new UploadTokenDeleteAction({ uploadTokenId }))
  }

  private _formatError(message: string, error: string | { message: string }): string {
    const errorMessage = typeof error === 'string' ? error : error && error.message ? error.message : 'unknown reason';
    return `${message}: ${errorMessage}`;
  }

  public upload(files: KmcNewEntryUpload[], trancodingProfileId: number): void {
    this._uploadManagement.addFiles(
      files.map(file => new NewEntryUploadFile(file.file, file.mediaType, trancodingProfileId))
    );
  }
}
