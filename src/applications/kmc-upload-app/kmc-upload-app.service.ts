import { Injectable } from '@angular/core';
import { KalturaClient } from '@kaltura-ng/kaltura-client';
import { Observable } from 'rxjs/Observable';
import { KalturaMediaType } from 'kaltura-typescript-client/types/KalturaMediaType';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { TrackedFile, UploadManagement } from '@kaltura-ng/kaltura-common';
import { KalturaMediaEntry } from 'kaltura-typescript-client/types/KalturaMediaEntry';
import { MediaAddAction } from 'kaltura-typescript-client/types/MediaAddAction';
import { KalturaMultiRequest } from 'kaltura-typescript-client';
import { KalturaUploadFile } from '@kaltura-ng/kaltura-server-utils';
import { KalturaAssetsParamsResourceContainers } from 'kaltura-typescript-client/types/KalturaAssetsParamsResourceContainers';
import { KalturaUploadedFileTokenResource } from 'kaltura-typescript-client/types/KalturaUploadedFileTokenResource';
import { KalturaAssetParamsResourceContainer } from 'kaltura-typescript-client/types/KalturaAssetParamsResourceContainer';
import { MediaUpdateContentAction } from 'kaltura-typescript-client/types/MediaUpdateContentAction';
import { UploadSettingsFile } from './upload-settings/upload-settings.service';
import { KalturaConversionProfile } from 'kaltura-typescript-client/types/KalturaConversionProfile';
import { KalturaConversionProfileType } from 'kaltura-typescript-client/types/KalturaConversionProfileType';
import { KalturaFilterPager } from 'kaltura-typescript-client/types/KalturaFilterPager';
import { KalturaConversionProfileFilter } from 'kaltura-typescript-client/types/KalturaConversionProfileFilter';
import { ConversionProfileListAction } from 'kaltura-typescript-client/types/ConversionProfileListAction';
import { FriendlyHashId } from '@kaltura-ng/kaltura-common/friendly-hash-id';
import { MediaDeleteAction } from 'kaltura-typescript-client/types/MediaDeleteAction';
import { UploadTokenDeleteAction } from 'kaltura-typescript-client/types/UploadTokenDeleteAction';
import * as R from 'ramda';

export type UploadStatus = 'uploading' | 'uploaded' | 'uploadFailure' | 'pending' | 'removing';

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
  private _tempIds: Array<string> = [];

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

  private _removeUploadedFile(file: NewUploadFile): void {
    setTimeout(() => this._removeFiles(file), 5000);
  }

  private _updateFiles(items: Array<NewUploadFile>): void {
    this._newUploadFiles.next(items);
  }

  private _addFiles(files: NewUploadFile | Array<NewUploadFile>): void {
    files = Array.isArray(files) ? files : [files];
    this._updateFiles([...this._getFiles(), ...files]);
  }

  private _removeFiles(payload: NewUploadFile | Array<NewUploadFile>): void {
    payload = Array.isArray(payload) ? payload : [payload];
    this._tempIds = <Array<string>>R.without(R.pluck('tempId', payload), this._tempIds);
    this._updateFiles(R.without(payload, this._getFiles()));
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

  private _reorderFiles(): void {
    this._updateFiles(R.sortBy(R.prop('statusWeight'))(this._getFiles()));
  }

  private _getStatusWeight(status: string): number {
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

          if (relevantNewFile && relevantNewFile.status !== 'removing') {
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

  private _getTempId(): string {
    const tempId = FriendlyHashId.defaultInstance.generateUnique(this._tempIds);
    this._tempIds = R.append(tempId, this._tempIds);

    return tempId;
  }

  public proceedUpload(files: Array<UploadSettingsFile>, conversionProfileId: number): void {
    const payload = R.pipe(
      R.map(({ mediaType, name }) => new KalturaMediaEntry({ mediaType, name, conversionProfileId })),
      R.map((entry: KalturaMediaEntry) => new MediaAddAction({ entry }))
    )(files);
    const request = new KalturaMultiRequest(...payload);

    const updatedFiles = R.map(file => R.merge(file, { tempId: this._getTempId() }), files);

    this._addFiles(<Array<NewUploadFile>>R.map(this._convertFile.bind(this), updatedFiles));

    this._kalturaServerClient.multiRequest(request)
      .switchMap(res => Observable.from(res))
      .map(res => res.error ? Observable.throw(res.error) : res.result)
      .zip(updatedFiles, (entry, file) =>
        Object.assign({}, file, {
          entryId: (<any>entry).id,
          conversionProfileId: (<any>entry).conversionProfileId
        }))
      .map(file => {
        const relevantFile = R.find(R.propEq('tempId', file.tempId))(this._getFiles());
        const removing = !relevantFile || relevantFile.removing;

        return R.merge(file, { removing });
      })
      // -------- SIDE EFFECT ----------
      .do(file => {
        if (file.removing) {
          this._removeMediaEntry(file.entryId).subscribe();
        }
      })
      // -------------------------------
      .filter(file => !(<any>file).removing)
      .flatMap(
        (file: any) => this._uploadManagement.newUpload(new KalturaUploadFile(file.file)),
        (file, { uploadToken }) => R.merge(file, { uploadToken })
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

      this._uploadManagement.cancelUpload(uploadToken);
      //   relevantFile.removing = true;
      //   relevantFile.status = 'removing';
      //
      //   if (entryId) {
      //     removeOperations$.push(this._removeMediaEntry(relevantFile.entryId));
      //   }
      //
      //   if (uploadToken) {
      //     removeOperations$.push(
      //       this._uploadManagement.cancelUpload(uploadToken)
      //         .filter(status => status)
      //         .switchMap(() => this._kalturaServerClient.request(new UploadTokenDeleteAction({ uploadTokenId: uploadToken })))
      //     );
      //   }
      //
      //   Observable.forkJoin(removeOperations$)
      //     .subscribe(
      //       () => {
      //       },
      //       () => {
      //         relevantFile.removing = false;
      //         relevantFile.uploadFailure = true;
      //       },
      //       () => {
      //         this._removeFiles(relevantFile);
      //       });
    }
  }

  public bulkCancel(files: Array<NewUploadFile>): void {
    const removeEntryPayload = R.pipe(
      R.pluck('entryId'),
      R.filter(Boolean),
      R.map((entryId: string) => new MediaDeleteAction({ entryId }))
    )(files);

    const removeUploadTokenPayload = R.pipe(
      R.pluck('uploadToken'),
      R.filter(Boolean),
      R.map((uploadTokenId: string) => new UploadTokenDeleteAction({ uploadTokenId }))
    )(files);

    const removeEntryRequest = removeEntryPayload.length
      ? <Observable<any>>this._kalturaServerClient.multiRequest(removeEntryPayload)
      : <Observable<any>>Observable.of(false);

    const removeUploadTokenRequest = removeUploadTokenPayload.length
      ? <Observable<any>>this._kalturaServerClient.multiRequest(removeUploadTokenPayload)
      : <Observable<any>>Observable.of(false);

    files.forEach(file => {
      file.removing = true;
      file.status = 'removing';
    });

    // TODO [kmcng] we should use optimistic approach. cancel the upload locally and then try
    // to do server cleanup (and show console.warn if failed without showing anything else to the user
    // TODO [kmcng] let's discuss about t

    // removeEntryRequest
    //   .switchMap(() => removeUploadTokenRequest)
    //   .switchMap(() => Observable.from(files))
    //   .pluck('uploadToken')
    //   .switchMap((uploadToken: string) => this._uploadManagement.cancelUpload(uploadToken))
    //   .toArray()
    //   .subscribe(() => this._removeFiles(files));
  }

  public getTranscodingProfiles(): Observable<Array<KalturaConversionProfile>> {
    if (!this._trancodingProfileCache$) {
      const payload = new ConversionProfileListAction({
        filter: new KalturaConversionProfileFilter({ typeEqual: KalturaConversionProfileType.media }),
        pager: new KalturaFilterPager({ pageSize: 500 })
      });

      this._trancodingProfileCache$ = this._kalturaServerClient
        .request(new ConversionProfileListAction(payload))
        .pluck('objects')
        .map((profiles: Array<KalturaConversionProfile>) =>
          profiles.filter(profile => profile.getTypeName() === 'KalturaConversionProfile')
        )
        .publishReplay(1)
        .refCount();
    }

    return this._trancodingProfileCache$;
  }

  public resetTranscodingProfiles(): void {
    this._trancodingProfileCache$ = null;
  }

  public selectFiles(files: FileList): void {
    this._selectedFiles.next(files);
  }

  public resetSelected(): void {
    this._selectedFiles.next(null);
  }
}
