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
import { IUploadSettingsFile } from './upload-settings/upload-settings.service';
import { KalturaConversionProfile } from 'kaltura-typescript-client/types/KalturaConversionProfile';
import { KalturaConversionProfileType } from 'kaltura-typescript-client/types/KalturaConversionProfileType';
import { KalturaConversionProfileListResponse } from 'kaltura-typescript-client/types/KalturaConversionProfileListResponse';
import { KalturaFilterPager } from 'kaltura-typescript-client/types/KalturaFilterPager';
import { KalturaConversionProfileFilter } from 'kaltura-typescript-client/types/KalturaConversionProfileFilter';
import { ConversionProfileListAction } from 'kaltura-typescript-client/types/ConversionProfileListAction';

export interface INewUploadFile {
  uploadToken: string;
  entryId: string;
  uploadedOn: Date;
  fileName: string;
  fileSize: number;
  status: 'uploading' | 'uploaded' | 'uploadFailure' | 'pending';
  progress: number;
  mediaType: KalturaMediaType;
  uploading: boolean;
  uploadFailure: boolean;
}

const temp: Array<INewUploadFile> = [
  {
    uploadToken: 'asgegsdgdsfg',
    entryId: 'klnlknln',
    uploadedOn: new Date(),
    fileName: 'Example_file.mov',
    fileSize: 1024,
    status: 'uploading',
    progress: 55,
    mediaType: KalturaMediaType.video,
    uploading: true,
    uploadFailure: false
  },
  {
    uploadToken: 'aszxvewf',
    entryId: 'asdasdrgvc',
    uploadedOn: new Date(),
    fileName: 'Example_file.mov',
    fileSize: 1024,
    status: 'uploading',
    progress: 15,
    mediaType: KalturaMediaType.video,
    uploading: true,
    uploadFailure: false
  },
  {
    uploadToken: 'qgtdgsdg',
    entryId: 'gsfgsg',
    uploadedOn: new Date(),
    fileName: 'Example_file.mp3',
    fileSize: 1024,
    status: 'uploading',
    progress: 30,
    mediaType: KalturaMediaType.audio,
    uploading: true,
    uploadFailure: false
  }
];

@Injectable()
export class KmcUploadAppService {
  private _allowedExtensions = `
    .flv,.asf,.qt,.mov,.mpg,.avi,.wmv,.mp4,.3gp,.f4v,.m4v,.mpeg,.mxf,.rm,.rv,.rmvb,.ts,.ogg,.ogv,.vob,.webm,.mts,.arf,.mkv,
    .flv,.asf,.qt,.mov,.mpg,.avi,.wmv,.mp3,.wav,.ra,.rm,.wma,.aif,.m4a,
    .jpg,.jpeg,.gif,.png
  `;

  private _trancodingProfileCache$: Observable<Array<KalturaConversionProfile>>;
  private _selectedFiles = new BehaviorSubject<FileList>(null);
  private _newUploadFiles = new BehaviorSubject<Array<INewUploadFile>>(temp);

  public selectedFiles$ = this._selectedFiles.asObservable();
  public newUploadFiles$ = this._newUploadFiles.asObservable();

  public get allowedExtensions(): string {
    return this._allowedExtensions;
  }

  constructor(private _kalturaServerClient: KalturaClient, private _uploadManagement: UploadManagement) {
    this._trackUploadFiles();
  }

  private _getFiles(): Array<INewUploadFile> {
    return this._newUploadFiles.getValue();
  }

  private _updateFiles(items: Array<INewUploadFile>): void {
    this._newUploadFiles.next(items);
  }

  private _addFile(file: INewUploadFile): void {
    this._updateFiles([...this._getFiles(), file]);
  }

  private _convertFile(file: IUploadSettingsFile): INewUploadFile {
    const { entryId, name: fileName, size: fileSize, mediaType, uploadedOn, uploadToken } = file;

    return {
      entryId,
      fileName,
      fileSize,
      mediaType,
      uploadedOn,
      uploadToken,
      status: 'pending',
      progress: 0,
      uploading: false,
      uploadFailure: false
    };
  }

  private _trackUploadFiles(): void {
    this._uploadManagement.onTrackFileChange$
      .subscribe(
        (trackedFile: TrackedFile) => {
          const newUploadFiles = this._getFiles();
          const relevantNewFile = newUploadFiles.find(({ uploadToken }) => uploadToken === trackedFile.uploadToken);

          if (relevantNewFile) {
            relevantNewFile.status = trackedFile.status;

            switch (trackedFile.status) {
              case 'uploaded':
                relevantNewFile.uploading = false;
                relevantNewFile.uploadFailure = false;
                break;
              case 'uploadFailure':
                relevantNewFile.uploading = false;
                relevantNewFile.uploadFailure = true;
                break;
              case 'uploading':
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

  public proceedUpload(files: Array<IUploadSettingsFile>, conversionProfileId: number): void {
    const payload = files
      .map(({ mediaType, name }) => new KalturaMediaEntry({ mediaType, name, conversionProfileId }))
      .map(entry => new MediaAddAction({ entry }));
    const request = new KalturaMultiRequest(...payload);

    this._kalturaServerClient.multiRequest(request)
      .switchMap(res => Observable.from(res))
      .map(res => res.error ? Observable.throw(res.error) : res.result)
      .zip(files, (entry, file) =>
        Object.assign({}, file, {
          entryId: (<any>entry).id,
          conversionProfileId: (<any>entry).conversionProfileId,
          uploadedOn: new Date()
        }))
      .flatMap(
        file => this._uploadManagement.newUpload(new KalturaUploadFile(file.file)),
        (file, { uploadToken }) => Object.assign({}, file, { uploadToken })
      )
      // -------- SIDE EFFECT ----------
      .do((file: IUploadSettingsFile) => this._addFile(this._convertFile(file)))
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
