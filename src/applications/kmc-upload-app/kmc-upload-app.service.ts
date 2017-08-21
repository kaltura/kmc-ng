import { Injectable } from '@angular/core';
import { KalturaClient } from '@kaltura-ng/kaltura-client';
import { Observable } from 'rxjs/Observable';
import { KalturaMediaType } from 'kaltura-typescript-client/types/KalturaMediaType';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { TrackedFile, UploadManagement } from '@kaltura-ng/kaltura-common';
import { KalturaMediaEntry } from 'kaltura-typescript-client/types/KalturaMediaEntry';
import { MediaAddAction } from 'kaltura-typescript-client/types/MediaAddAction';
import { KalturaMultiRequest, KalturaRequest } from 'kaltura-typescript-client';
import { KalturaUploadFile } from '@kaltura-ng/kaltura-server-utils';
import { KalturaAssetsParamsResourceContainers } from 'kaltura-typescript-client/types/KalturaAssetsParamsResourceContainers';
import { KalturaUploadedFileTokenResource } from 'kaltura-typescript-client/types/KalturaUploadedFileTokenResource';
import { KalturaAssetParamsResourceContainer } from 'kaltura-typescript-client/types/KalturaAssetParamsResourceContainer';
import { MediaUpdateContentAction } from 'kaltura-typescript-client/types/MediaUpdateContentAction';
import { UploadSettingsFile } from './upload-settings/upload-settings.service';
import { KalturaConversionProfile } from 'kaltura-typescript-client/types/KalturaConversionProfile';
import { KalturaConversionProfileType } from 'kaltura-typescript-client/types/KalturaConversionProfileType';
import { KalturaConversionProfileListResponse } from 'kaltura-typescript-client/types/KalturaConversionProfileListResponse';
import { KalturaFilterPager } from 'kaltura-typescript-client/types/KalturaFilterPager';
import { KalturaConversionProfileFilter } from 'kaltura-typescript-client/types/KalturaConversionProfileFilter';
import { ConversionProfileListAction } from 'kaltura-typescript-client/types/ConversionProfileListAction';
import { environment } from 'app-environment'
import { FriendlyHashId } from '@kaltura-ng/kaltura-common/friendly-hash-id';
import * as R from 'ramda';
import { MediaDeleteAction } from 'kaltura-typescript-client/types/MediaDeleteAction';
import { UploadTokenDeleteAction } from 'kaltura-typescript-client/types/UploadTokenDeleteAction';

export type UploadStatus = 'uploading' | 'uploaded' | 'uploadFailure' | 'pending';

export interface NewUploadFile {
  uploadToken: string;
  entryId: string;
  uploadedOn: Date;
  fileName: string;
  fileSize: number;
  status: UploadStatus;
  progress: number;
  mediaType: KalturaMediaType;
  uploading: boolean;
  uploadFailure: boolean;
  tempId?: string;
  statusWeight?: number;
  removing?: boolean;
}

@Injectable()
export class KmcUploadAppService {
  private _allowedExtensions = `
    .flv,.asf,.qt,.mov,.mpg,.avi,.wmv,.mp4,.3gp,.f4v,.m4v,.mpeg,.mxf,.rm,.rv,.rmvb,.ts,.ogg,.ogv,.vob,.webm,.mts,.arf,.mkv,
    .flv,.asf,.qt,.mov,.mpg,.avi,.wmv,.mp3,.wav,.ra,.rm,.wma,.aif,.m4a,
    .jpg,.jpeg,.gif,.png
  `;

  private _trancodingProfileCache$: Observable<Array<KalturaConversionProfile>>;
  private _selectedFiles = new BehaviorSubject<FileList>(null);
  private _newUploadFiles = new BehaviorSubject<Array<NewUploadFile>>([]);

  public selectedFiles$ = this._selectedFiles.asObservable();
  public newUploadFiles$ = this._newUploadFiles.asObservable();

  public get allowedExtensions(): string {
    return this._allowedExtensions;
  }

  constructor(private _kalturaServerClient: KalturaClient, private _uploadManagement: UploadManagement) {
    this._trackUploadFiles();
  }

  private _getFiles(): Array<NewUploadFile> {
    return this._newUploadFiles.getValue();
  }

  private _removeUploadedFile(file: NewUploadFile) {
    setTimeout(() => this._removeFile(file), 5000);
  }

  private _updateFiles(items: Array<NewUploadFile>): void {
    this._newUploadFiles.next(items);
  }

  private _addFile(file: NewUploadFile): void {
    this._updateFiles([...this._getFiles(), file]);
  }

  private _removeFile(file: NewUploadFile): void {
    this._updateFiles(R.without([file], this._getFiles()));
  }

  private _updateUploadFile(file: UploadSettingsFile): void {
    const relevantFile = R.find(R.propEq('tempId', file.tempId))(this._getFiles());

    if (relevantFile) {
      relevantFile.entryId = file.entryId;
      relevantFile.uploadToken = file.uploadToken;
    }
  }

  private _convertFile(file: UploadSettingsFile): NewUploadFile {
    const { entryId, name: fileName, size: fileSize, mediaType, uploadedOn, uploadToken, tempId } = file;

    return {
      fileName,
      fileSize,
      mediaType,
      tempId,
      entryId: entryId || '',
      uploadedOn: uploadedOn || new Date(),
      uploadToken: uploadToken || '',
      status: 'pending',
      progress: 0,
      uploading: false,
      uploadFailure: false,
      statusWeight: this._getStatusWeight('pending')
    };
  }

  private _reorderFiles() {
    this._updateFiles(R.sortBy(R.prop('statusWeight'))(this._getFiles()));
  }

  private _getStatusWeight(status: UploadStatus): number {
    switch (status) {
      case 'uploadFailure':
      case 'uploaded':
        return 0;
      case 'uploading':
        return 1;
      case 'pending':
        return 2;
      default:
        return 3;
    }
  }

  private _trackUploadFiles(): void {
    this._uploadManagement.onTrackFileChange$
      .subscribe(
        (trackedFile: TrackedFile) => {
          const relevantNewFile = R.find(R.propEq('uploadToken', trackedFile.uploadToken))(this._getFiles());

          if (relevantNewFile) {
            relevantNewFile.status = trackedFile.status;
            relevantNewFile.statusWeight = this._getStatusWeight(trackedFile.status);

            switch (trackedFile.status) {
              case 'uploaded':
                relevantNewFile.uploading = false;
                relevantNewFile.uploadFailure = false;
                this._removeUploadedFile(relevantNewFile);
                this._reorderFiles();
                break;
              case 'uploadFailure':
                relevantNewFile.uploading = false;
                relevantNewFile.uploadFailure = true;
                this._reorderFiles();
                break;
              case 'uploading':
                if (!relevantNewFile.uploading) {
                  this._reorderFiles();
                }
                relevantNewFile.progress = Number((trackedFile.progress * 100).toFixed(0));
                relevantNewFile.uploading = true;
                relevantNewFile.uploadFailure = false;
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

  public proceedUpload(files: Array<UploadSettingsFile>, conversionProfileId: number): void {
    const payload = files
      .map(({ mediaType, name }) => new KalturaMediaEntry({ mediaType, name, conversionProfileId }))
      .map(entry => new MediaAddAction({ entry }));
    const request = new KalturaMultiRequest(...payload);

    const updatedFile = files.map(file => {
      const tempId = FriendlyHashId.defaultInstance.generateUnique(this._getFiles().map(item => item.tempId));
      return Object.assign(file, { tempId });
    });

    updatedFile.forEach(file => {
      this._addFile(this._convertFile(file));
    });

    this._kalturaServerClient.multiRequest(request)
      .switchMap(res => Observable.from(res))
      .map(res => res.error ? Observable.throw(res.error) : res.result)
      .zip(updatedFile, (entry, file) =>
        Object.assign({}, file, {
          entryId: (<any>entry).id,
          conversionProfileId: (<any>entry).conversionProfileId
        }))
      .map(file => {
        const relevantFile = R.find(R.propEq('tempId', file.tempId))(this._getFiles());
        const removing = !relevantFile || relevantFile.removing;

        return Object.assign({}, file, { removing });
      })
      // -------- SIDE EFFECT ----------
      .do(file => {
        if (file.removing) {
          this._removeMediaEntry(file.entryId).subscribe();
        }
      })
      // -------------------------------
      .filter(file => !file.removing)
      .flatMap(
        file => this._uploadManagement.newUpload(new KalturaUploadFile(file.file)),
        (file, { uploadToken }) => Object.assign({}, file, { uploadToken }),
        environment.uploadsShared.MAX_CONCURENT_UPLOADS
      )
      // -------- SIDE EFFECT ----------
      .do(file => {
        this._updateUploadFile(file);
        this._reorderFiles();
      })
      // -------------------------------
      .map(({ uploadToken: token, mediaType, entryId, conversionProfileId: profileId }) => {
        const subSubResource = new KalturaUploadedFileTokenResource({ token });
        if (mediaType === KalturaMediaType.image) {
          return {
            entryId,
            conversionProfileId: profileId,
            resource: subSubResource
          };
        }

        const subResource = new KalturaAssetParamsResourceContainer({ resource: subSubResource, assetParamsId: 0 });
        const resource = new KalturaAssetsParamsResourceContainers({ resources: [subResource] });

        return { entryId, resource, conversionProfileId };
      })
      .map(resource => new MediaUpdateContentAction(resource))
      .toArray()
      .switchMap(resourcePayload => this._kalturaServerClient.multiRequest(new KalturaMultiRequest(...resourcePayload)))
      .subscribe(
        () => {
        },
        (err) => {
          console.error(err); // TODO handle error
        }
      );
  }

  public cancelUpload(tempId: string): void {
    const relevantFile = R.find(R.propEq('tempId', tempId))(this._getFiles());
    const removeOperations$ = [];

    if (relevantFile) {
      const { entryId, uploadToken } = relevantFile;

      relevantFile.removing = true;

      if (entryId) {
        removeOperations$.push(this._removeMediaEntry(relevantFile.entryId));
      }

      if (uploadToken) {
        removeOperations$.push(
          this._uploadManagement.cancelUpload(uploadToken)
            .filter(status => status)
            .switchMap(() => this._kalturaServerClient.request(new UploadTokenDeleteAction({ uploadTokenId: uploadToken })))
        );
      }

      Observable.forkJoin(removeOperations$)
        .subscribe(
          () => {
          },
          () => {
            relevantFile.removing = false;
            relevantFile.uploadFailure = true;
          },
          () => {
            this._removeFile(relevantFile);
          });
    }
  }

  public getTranscodingProfiles(): Observable<Array<KalturaConversionProfile>> {
    if (!this._trancodingProfileCache$) {
      const payload = new ConversionProfileListAction({
        filter: new KalturaConversionProfileFilter({ typeEqual: KalturaConversionProfileType.media }),
        pager: new KalturaFilterPager({ pageSize: 500 })
      });

      this._trancodingProfileCache$ = this._kalturaServerClient
        .request(new ConversionProfileListAction(payload))
        .map((res: KalturaConversionProfileListResponse) => res.objects)
        .map(profiles => profiles.filter(profile => profile.getTypeName() === 'KalturaConversionProfile'))
        .publishReplay(1)
        .refCount();
    }

    return this._trancodingProfileCache$;
  }

  public resetTranscodingProfiles(): void {
    this._trancodingProfileCache$ = null;
  }

  public selectFiles(files) {
    this._selectedFiles.next(files);
  }

  public resetSelected() {
    this._selectedFiles.next(null);
  }
}
