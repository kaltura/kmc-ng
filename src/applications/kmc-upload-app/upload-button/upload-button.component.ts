import {Component, ViewChild} from '@angular/core';
import {PopupWidgetComponent} from '@kaltura-ng/kaltura-ui';
import {KalturaMediaType} from 'kaltura-ngx-client';
import {PrepareEntryComponent} from '../prepare-entry/prepare-entry.component';
import { KMCPermissions, KMCPermissionsService } from 'app-shared/kmc-shared/kmc-permissions';
import { FileDialogComponent } from '@kaltura-ng/kaltura-ui';

@Component({
  selector: 'kUploadButton',
  templateUrl: './upload-button.component.html',
  styleUrls: ['./upload-button.component.scss'],
})
export class UploadButtonComponent {
  @ViewChild('uploadmenu') uploadMenuPopup: PopupWidgetComponent;
  @ViewChild('uploadsettings') uploadSettingsPopup: PopupWidgetComponent;
  @ViewChild('createLive') createLivePopup: PopupWidgetComponent;
  @ViewChild('prepareEntry') prepareEntryComponent: PrepareEntryComponent;
  @ViewChild('bulkuploadmenu') bulkUploadMenu: PopupWidgetComponent;
    @ViewChild('fileDialog') _fileDialog: FileDialogComponent;

  public _disabled = true;
    public _allowedExtensions = `
    .flv,.asf,.qt,.mov,.mpg,.avi,.wmv,.mp4,.3gp,.f4v,.m4v,.mpeg,.mxf,.rm,.rv,.rmvb,.ts,.ogg,.ogv,.vob,.webm,.mts,.arf,.mkv,
    .flv,.asf,.qt,.mov,.mpg,.avi,.wmv,.mp3,.wav,.ra,.rm,.wma,.aif,.m4a,
    .jpg,.jpeg,.gif,.png
    `;
    public _files = [];

  constructor(private _appPermissions: KMCPermissionsService) {
      this._disabled = !this._appPermissions.hasAnyPermissions([
          KMCPermissions.CONTENT_INGEST_UPLOAD,
          KMCPermissions.CONTENT_INGEST_BULK_UPLOAD,
          KMCPermissions.CONTENT_INGEST_ORPHAN_VIDEO,
          KMCPermissions.CONTENT_INGEST_ORPHAN_AUDIO,
          KMCPermissions.LIVE_STREAM_ADD
      ]);
  }

  public _onMenuItemSelected(item: string): void {
    switch (item) {
      case 'uploadFromDesktop':
          this._fileDialog.open();
        break;
      case 'bulkUpload':
        this.bulkUploadMenu.open();
          this.uploadMenuPopup.close();
        break;
      case 'prepareVideoEntry':
        this.prepareEntryComponent.prepareEntry(KalturaMediaType.video);
          this.uploadMenuPopup.close();
        break;
      case 'prepareAudioEntry':
        this.prepareEntryComponent.prepareEntry(KalturaMediaType.audio);
          this.uploadMenuPopup.close();
        break;
      case 'createLive':
        this.createLivePopup.open();
          this.uploadMenuPopup.close();
        break;
      default:
        break;
    }
  }

    private _getFileExtension(filename: string): string {
        const extension = /(?:\.([^.]+))?$/.exec(filename)[1];
        return typeof extension === 'undefined' ? '' : extension.toLowerCase();
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
            case videoFiles.indexOf(extension) !== -1:
                return KalturaMediaType.video;
            case audioFiles.indexOf(extension) !== -1:
                return KalturaMediaType.audio;
            case imageFiles.indexOf(extension) !== -1:
                return KalturaMediaType.image;
            default:
                return null;
        }
    }

    public _handleSelectedFiles(files: FileList): void {
        const isEditing = false;

        const newItems = Array.from(files).map(file => {
            const ext = this._getFileExtension(file.name);
            const mediaType = this._getMediaTypeFromExtension(ext);
            const { name, size } = file;
            return ({ file, mediaType, name, size, isEditing });
        });

        this._files = [...this._files, ...newItems];

        this.uploadMenuPopup.close();
        this.uploadSettingsPopup.open();
    }
}

