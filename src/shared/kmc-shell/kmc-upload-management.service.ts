import { Injectable, OnDestroy } from '@angular/core';
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
import { KalturaConversionProfile } from 'kaltura-typescript-client/types/KalturaConversionProfile';
import { KalturaConversionProfileType } from 'kaltura-typescript-client/types/KalturaConversionProfileType';
import { KalturaFilterPager } from 'kaltura-typescript-client/types/KalturaFilterPager';
import { KalturaConversionProfileFilter } from 'kaltura-typescript-client/types/KalturaConversionProfileFilter';
import { ConversionProfileListAction } from 'kaltura-typescript-client/types/ConversionProfileListAction';
import { FriendlyHashId } from '@kaltura-ng/kaltura-common/friendly-hash-id';
import { MediaDeleteAction } from 'kaltura-typescript-client/types/MediaDeleteAction';
import { UploadTokenDeleteAction } from 'kaltura-typescript-client/types/UploadTokenDeleteAction';
import * as R from 'ramda';


export type UploadStatus = 'uploading' | 'uploadCompleted' | 'uploadFailed' | 'pending' | 'removing';

export interface UploadFileData {
    uploadFileId: string;
    serverUploadToken: string;
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
export class KmcUploadManagementService implements OnDestroy {

    private _newUploadFiles = new BehaviorSubject<Array<UploadFileData>>([]);
    private _tempIds: Array<string> = [];

    public newUploadFiles$ = this._newUploadFiles.asObservable();



    constructor(private _kalturaServerClient: KalturaClient, private _uploadManagement: UploadManagement) {
        this._trackUploadFiles();
    }

    private _getFiles(): Array<UploadFileData> {
        return this._newUploadFiles.getValue();
    }

    private _removeUploadedFile(file: UploadFileData): void {
        setTimeout(() => this._removeFiles(file), 5000);
    }

    private _updateFiles(items: Array<UploadFileData>): void {
        this._newUploadFiles.next(items);
    }

    private _addFiles(files: UploadFileData | Array<UploadFileData>): void {
        files = Array.isArray(files) ? files : [files];
        this._updateFiles([...this._getFiles(), ...files]);
    }

    private _removeFiles(payload: UploadFileData | Array<UploadFileData>): void {
        payload = Array.isArray(payload) ? payload : [payload];
        this._tempIds = <Array<string>>R.without(R.pluck('tempId', payload), this._tempIds);
        this._updateFiles(R.without(payload, this._getFiles()));
    }

    private _updateUploadFile(file: any): void {
        // TODO [kmcng]
        // const relevantFile = R.find(R.propEq('tempId', file.tempId))(this._getFiles());
        //
        // if (relevantFile) {
        //   relevantFile.entryId = file.entryId;
        //   relevantFile.uploadToken = file.uploadToken;
        // }
    }


    ngOnDestroy() : void{

    }

    private _convertFile(file: any): UploadFileData {
        // TODO [kmcng]
        throw new Error("todo kmcng");
        // const { entryId, name: fileName, size: fileSize, mediaType, uploadedOn, uploadToken, tempId } = file;
        //
        // return {
        //   fileName,
        //   fileSize,
        //   mediaType,
        //   tempId,
        //   entryId: entryId || '',
        //   uploadedOn: uploadedOn || new Date(),
        //   uploadId: uploadId || '',
        //   status: 'pending',
        //   progress: 0,
        //   uploading: false,
        //   uploadFailure: false,
        //   statusWeight: this._getStatusWeight('pending')
        // };
    }

    private _reorderFiles(): void {
        this._updateFiles(R.sortBy(R.prop('statusWeight'))(this._getFiles()));
    }

    private _getStatusWeight(status: string): number {
        switch (status) {
            case 'uploadFailed':
            case 'uploadCompleted':
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

        this._uploadManagement.onFileStatusChanged$
            .cancelOnDestroy(this)
            .subscribe(
                (file) => {
                    const relevantNewFile = R.find(R.propEq('id', file.id))(this._getFiles());

                    if (relevantNewFile && relevantNewFile.status !== 'removing') {
                        relevantNewFile.status = file.status;
                        relevantNewFile.statusWeight = this._getStatusWeight(file.status);

                        switch (file.status) {
                            case 'waitingUpload':
                                // TODO [kmcng]
                                break;
                            case 'uploadCompleted':
                                relevantNewFile.uploading = false;
                                relevantNewFile.uploadFailure = false;
                                this._removeUploadedFile(relevantNewFile);
                                this._reorderFiles();
                                break;
                            case 'uploadFailed':
                                relevantNewFile.uploading = false;
                                relevantNewFile.uploadFailure = true;
                                this._reorderFiles();
                                break;
                            case 'uploading':
                                if (!relevantNewFile.uploading) {
                                    // TODO [kmcng] this logic will happen a lot because it is executed every time the progress is being updated
                                    // TODO [kmcng] you can add status 'startUploading' in the infrastructure to tackle this expression
                                    this._reorderFiles();
                                }
                                relevantNewFile.progress = (file.progress * 100).toFixed(0);
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

    public upload(files : UploadFileData, conversionProfileId: number) : void
    {
    //   const payload = R.pipe(
    //     R.map(({ mediaType, name }) => new KalturaMediaEntry({ mediaType, name, conversionProfileId })),
    //     R.map((entry: KalturaMediaEntry) => new MediaAddAction({ entry }))
    //   )(files);
    //   const request = new KalturaMultiRequest(...payload);
    //
    //   const updatedFiles = R.map(file => R.merge(file, { tempId: this._getTempId() }), files);
    //
    //   this._addFiles(<Array<NewUploadFile>>R.map(this._convertFile.bind(this), updatedFiles));
    //
    //   this._kalturaServerClient.multiRequest(request)
    //     .switchMap(res => Observable.from(res))
    //     .map(res => res.error ? Observable.throw(res.error) : res.result)
    //     .zip(updatedFiles, (entry, file) =>
    //       Object.assign({}, file, {
    //         entryId: (<any>entry).id,
    //         conversionProfileId: (<any>entry).conversionProfileId
    //       }))
    //     .map(file => {
    //       const relevantFile = R.find(R.propEq('tempId', file.tempId))(this._getFiles());
    //       const removing = !relevantFile || relevantFile.removing;
    //
    //       return R.merge(file, { removing });
    //     })
    //     // -------- SIDE EFFECT ----------
    //     .do(file => {
    //       if (file.removing) {
    //         this._removeMediaEntry(file.entryId).subscribe();
    //       }
    //     })
    //     // -------------------------------
    //     .filter(file => !(<any>file).removing)
    //     .map(file => {
    //       const uploadToken = this._uploadManagement.addFile(new KalturaUploadFile(file.file));
    //       return R.merge(file, uploadToken)
    //     })
    //     // -------- SIDE EFFECT ----------
    //     .do(file => {
    //       this._updateUploadFile(file);
    //       this._reorderFiles();
    //     })
    //     // -------------------------------
    //     .map(({ uploadToken: token, mediaType, entryId, conversionProfileId: profileId }) => {
    //       const subSubResource = new KalturaUploadedFileTokenResource({ token });
    //       if (mediaType === KalturaMediaType.image) {
    //         return {
    //           entryId,
    //           conversionProfileId: profileId,
    //           resource: subSubResource
    //         };
    //       }
    //
    //       const subResource = new KalturaAssetParamsResourceContainer({ resource: subSubResource, assetParamsId: 0 });
    //       const resource = new KalturaAssetsParamsResourceContainers({ resources: [subResource] });
    //
    //       return { entryId, resource, conversionProfileId };
    //     })
    //     .map(resource => new MediaUpdateContentAction(resource))
    //     .toArray()
    //     .switchMap(resourcePayload => this._kalturaServerClient.multiRequest(new KalturaMultiRequest(...resourcePayload)))
    //     .subscribe(
    //       () => {
    //       },
    //       (err) => {
    //         console.warn(err);
    //
    //         const failedFiles = this._getFiles()
    //           .filter(({ status }) => status !== 'uploadCompleted')
    //           .map(file => R.merge(file, {
    //             uploading: false,
    //             uploadFailure: true,
    //             status: 'uploadFailure'
    //           }));
    //
    //         this._updateFiles(failedFiles);
    //       }
    //     );
     }

    public cancelUpload(tempId: string): void {
        // const relevantFile = R.find(R.propEq('tempId', tempId))(this._getFiles());
        // const removeOperations$ = [];

        // if (relevantFile) {
           // const { entryId, uploadToken } = relevantFile;

            //this._uploadManagement.cancelUpload(uploadToken,false);
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
      //   }
    }

    public bulkCancel(files: Array<UploadFileData>): void {
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
}
