import { Injectable } from '@angular/core';
import { KalturaClient } from '@kaltura-ng/kaltura-client';
import { ConversionProfileListAction } from 'kaltura-typescript-client/types/ConversionProfileListAction';
import { KalturaConversionProfileType } from 'kaltura-typescript-client/types/KalturaConversionProfileType';
import { KalturaFilterPager } from 'kaltura-typescript-client/types/KalturaFilterPager';
import { KalturaConversionProfileFilter } from 'kaltura-typescript-client/types/KalturaConversionProfileFilter';
import { Observable } from 'rxjs/Observable';
import { KalturaConversionProfileListResponse } from 'kaltura-typescript-client/types/KalturaConversionProfileListResponse';
import { KalturaConversionProfile } from 'kaltura-typescript-client/types/KalturaConversionProfile';
import { KalturaMediaType } from 'kaltura-typescript-client/types/KalturaMediaType';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { environment } from 'app-environment';
import { UploadManagement } from '@kaltura-ng/kaltura-common';
import { KalturaMediaEntry } from 'kaltura-typescript-client/types/KalturaMediaEntry';
import { MediaAddAction } from 'kaltura-typescript-client/types/MediaAddAction';
import { KalturaMultiRequest } from 'kaltura-typescript-client';
import { KalturaServerFile } from '@kaltura-ng/kaltura-server-utils';
import { KalturaAssetsParamsResourceContainers } from 'kaltura-typescript-client/types/KalturaAssetsParamsResourceContainers';
import { KalturaUploadedFileTokenResource } from 'kaltura-typescript-client/types/KalturaUploadedFileTokenResource';
import { KalturaAssetParamsResourceContainer } from 'kaltura-typescript-client/types/KalturaAssetParamsResourceContainer';
import { MediaUpdateContentAction } from 'kaltura-typescript-client/types/MediaUpdateContentAction';
import * as R from 'ramda';

export interface IUploadSettingsFile {
  file: File;
  mediaType: KalturaMediaType;
  name: string;
  size: number;
  entryId?: string;
  uploadToken?: string;
  uploadedOn?: Date;
  conversionProfileId?: number;
  isEditing?: boolean;
  hasError?: boolean
}

@Injectable()
export class UploadSettingsHandler {
  private _allowedExtensions = `
    .flv,.asf,.qt,.mov,.mpg,.avi,.wmv,.mp4,.3gp,.f4v,.m4v,.mpeg,.mxf,.rm,.rv,.rmvb,.ts,.ogg,.ogv,.vob,.webm,.mts,.arf,.mkv,
    .flv,.asf,.qt,.mov,.mpg,.avi,.wmv,.mp3,.wav,.ra,.rm,.wma,.aif,.m4a,
    .jpg,.jpeg,.gif,.png
  `;
  private _selectedFiles = new BehaviorSubject<{ items: Array<IUploadSettingsFile> }>({ items: [] });

  public selectedFiles$ = this._selectedFiles.asObservable();

  public get allowedExtensions(): string {
    return this._allowedExtensions;
  }

  constructor(private _kalturaServerClient: KalturaClient, private _uploadManagement: UploadManagement) {
  }

  private _getFileExtension(filename: string): string {
    return /(?:\.([^.]+))?$/.exec(filename)[1];
  }

  private _getMediaTypeFromExtension(extension: string): KalturaMediaType | null {
    const imageFiles = ['jpg', 'jpeg', 'gif', 'png'];
    const audioFiles = [
      'flv', 'asf', 'qt', 'mov', 'mpg',
      'avi', 'wmv', 'mp3', 'wav', 'ra',
      'rm', 'wma', 'aif', 'm4a'
    ];
    const videoFiles = [
      'flv', 'asf', 'qt', 'mov', 'mpg',
      'avi', 'wmv', 'mp4', '3gp', 'f4v',
      'm4v', 'mpeg', 'mxf', 'rm', 'rv',
      'rmvb', 'ts', 'ogg', 'ogv', 'vob',
      'webm', 'mts', 'arf', 'mkv'
    ];

    switch (true) {
      case videoFiles.includes(extension):
        return KalturaMediaType.video;
      case audioFiles.includes(extension):
        return KalturaMediaType.audio;
      case imageFiles.includes(extension):
        return KalturaMediaType.image;
      default:
        return null;
    }
  }

  private _validateFiles(files: Array<IUploadSettingsFile>): { updatedFiles: Array<IUploadSettingsFile>, errorMessage: string } {
    const mediaTypeError = files.some(this._validateFileMediaType);
    if (mediaTypeError) {
      const updatedFiles = this._updateFilesWithError(this._validateFileMediaType)(files);
      return { updatedFiles, errorMessage: 'applications.upload.validation.wrongType' };
    }

    const fileSizeError = files.some(this._validateFileSize);
    if (fileSizeError) {
      const updatedFiles = this._updateFilesWithError(this._validateFileSize)(files);
      return { updatedFiles, errorMessage: 'applications.upload.validation.fileSizeExceeded' };
    }

    const updatedFiles = this._updateFilesWithError(file => file.hasError = false)(files);
    return { updatedFiles, errorMessage: '' };
  }

  private _validateFileSize(file: IUploadSettingsFile): boolean {
    const maxFileSize = environment.uploadsShared.MAX_FILE_SIZE;
    const fileSize = file.size / 1024 / 1024; // convert to Mb

    return fileSize > maxFileSize;
  }

  private _validateFileMediaType(file: IUploadSettingsFile): boolean {
    const allowedTypes = [KalturaMediaType.audio, KalturaMediaType.video, KalturaMediaType.image];
    return !allowedTypes.includes(file.mediaType);
  }

  private _updateFilesWithError(validationFn: (file: IUploadSettingsFile) => boolean): <T>(files: T) => T {
    return (files) => files.map(file => Object.assign({}, file, { hasError: validationFn(file) }));
  }

  private _proceedUpload(files: Array<IUploadSettingsFile>, conversionProfileId: number): void {
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
        file => this._uploadManagement.newUpload(new KalturaServerFile(file.file)),
        (file, { uploadToken }) => Object.assign({}, file, { uploadToken })
      )
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
        () => {},
        (err) => {
          console.error(err); // TODO handle error
        }
      );
  }

  private _updateFiles(items: Array<IUploadSettingsFile>): void {
    this._selectedFiles.next({ items });
  }

  public resetFiles(): void {
    this._selectedFiles.next({ items: [] });
  }

  public addFiles(files: FileList): void {
    const isEditing = false;
    const existingItems = this._selectedFiles.getValue().items;

    const convertedFiles = Array.from(files).map(file => {
      const ext = this._getFileExtension(file.name);
      const mediaType = this._getMediaTypeFromExtension(ext);
      const { name, size } = file;

      return { file, mediaType, name, size, isEditing };
    });

    this._selectedFiles.next({ items: [...existingItems, ...convertedFiles] });
  }

  public removeFile(file: IUploadSettingsFile): void {
    const files = this._selectedFiles.getValue().items;
    const updatedFiles = R.without([file], files);

    this._selectedFiles.next({ items: updatedFiles });
  }

  public updateFile(file: IUploadSettingsFile, updatedFile: IUploadSettingsFile): void {
    const files = this._selectedFiles.getValue().items;
    const index = R.indexOf(file, files);
    const updatedFiles = R.update(index, updatedFile, files);

    this._selectedFiles.next({ items: updatedFiles });
  }

  public upload(files: Array<IUploadSettingsFile>, transcodingProfile: number): string {
    const { updatedFiles, errorMessage } = this._validateFiles(files);
    this._updateFiles(updatedFiles);

    if (errorMessage) {
      return errorMessage;
    }

    this._proceedUpload(updatedFiles, transcodingProfile);

    return '';
  }

  public getTranscodingProfiles(): Observable<Array<KalturaConversionProfile>> {
    const payload = new ConversionProfileListAction({
      filter: new KalturaConversionProfileFilter({ typeEqual: KalturaConversionProfileType.media }),
      pager: new KalturaFilterPager({ pageSize: 500 })
    });

    return this._kalturaServerClient
      .request(new ConversionProfileListAction(payload))
      .map((res: KalturaConversionProfileListResponse) => res.objects)
      .map(profiles => profiles.filter(profile => profile.getTypeName() === 'KalturaConversionProfile'));
  }
}
