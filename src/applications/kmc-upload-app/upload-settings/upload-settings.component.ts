import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { SelectItem } from 'primeng/primeng';
import { UploadManagement } from '@kaltura-ng/kaltura-common';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { KalturaMediaType } from 'kaltura-ngx-client';
import { NewEntryUploadFile, NewEntryUploadService } from 'app-shared/kmc-shell';
import { AreaBlockerMessage, FileDialogComponent } from '@kaltura-ng/kaltura-ui';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui';
import { TranscodingProfileManagement } from 'app-shared/kmc-shared/transcoding-profile-management';
import { globalConfig } from 'config/global';

export interface UploadSettingsFile {
  file: File;
  mediaType: KalturaMediaType;
  name: string;
  isEditing?: boolean;
  hasError?: boolean;
  errorToken?: string;
  size: number;
}


@Component({
  selector: 'kKMCUploadSettings',
  templateUrl: './upload-settings.component.html',
  styleUrls: ['./upload-settings.component.scss']
})
export class UploadSettingsComponent implements OnInit, AfterViewInit {


  @Input() parentPopupWidget: PopupWidgetComponent;
  @ViewChild('fileDialog') _fileDialog: FileDialogComponent;

  public _tableScrollableWrapper: Element;
  public _transcodingProfiles: { value: number, label: string }[];
  public _profileForm: FormGroup;
  public _transcodingProfileField: AbstractControl;
  public _transcodingProfileError: AreaBlockerMessage;
  public _transcodingProfileLoading = false;
  public _files: UploadSettingsFile[] = [];
  public _fileTypes: SelectItem[] = [
    {
      'label': this._appLocalization.get('applications.upload.uploadSettings.mediaTypes.video'),
      'value': KalturaMediaType.video
    },
    {
      'label': this._appLocalization.get('applications.upload.uploadSettings.mediaTypes.audio'),
      'value': KalturaMediaType.audio
    },
    {
      'label': this._appLocalization.get('applications.upload.uploadSettings.mediaTypes.image'),
      'value': KalturaMediaType.image
    },
  ];

  public _allowedExtensions = `
    .flv,.asf,.qt,.mov,.mpg,.avi,.wmv,.mp4,.3gp,.f4v,.m4v,.mpeg,.mxf,.rm,.rv,.rmvb,.ts,.ogg,.ogv,.vob,.webm,.mts,.arf,.mkv,
    .flv,.asf,.qt,.mov,.mpg,.avi,.wmv,.mp3,.wav,.ra,.rm,.wma,.aif,.m4a,
    .jpg,.jpeg,.gif,.png
  `;


  constructor(private _newEntryUploadService: NewEntryUploadService,
              private _formBuilder: FormBuilder,
              private _transcodingProfileManagement: TranscodingProfileManagement,
              private _uploadManagement: UploadManagement,
              private _appLocalization: AppLocalization) {
    this._buildForm();
  }

  private _buildForm(): void {
    this._profileForm = this._formBuilder.group({ 'transcodingProfile': '' });
    this._transcodingProfileField = this._profileForm.controls['transcodingProfile'];
  }

  ngAfterViewInit(): void {
    this._fileDialog.open();

    this._tableScrollableWrapper = document.querySelector('.kUploadSettings .ui-datatable-scrollable-body');
  }

  ngOnInit() {
    this._loadTranscodingProfiles();
  }

  public _handleSelectedFiles(files: FileList) {
    const isEditing = false;

    const newItems = Array.from(files).map(file => {
      const ext = this._getFileExtension(file.name);
      const mediaType = this._getMediaTypeFromExtension(ext);
      const { name, size } = file;
      return ({ file, mediaType, name, size, isEditing });
    });

    this._files = [...this._files, ...newItems];
  }

  private _getFileExtension(filename: string): string {
  	const extension = /(?:\.([^.]+))?$/.exec(filename)[1];
    return typeof extension === "undefined" ? '' : extension.toLowerCase();
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


  private _loadTranscodingProfiles() {
    this._transcodingProfileLoading = true;

    this._transcodingProfileManagement.get()
      .subscribe(
        profiles => {
          this._transcodingProfileLoading = false;
          const transcodingProfiles = [...profiles];
          const defaultProfileIndex = transcodingProfiles.findIndex(({ isDefault }) => !!isDefault);
          if (defaultProfileIndex !== -1) {
            const [defaultProfile] = transcodingProfiles.splice(defaultProfileIndex, 1);
            this._transcodingProfiles = [
              { label: defaultProfile.name, value: defaultProfile.id },
              ...transcodingProfiles.map(({ name: label, id: value }) => ({ label, value }))
            ];
            this._transcodingProfileField.setValue(defaultProfile.id);
          } else {
            this._transcodingProfiles = transcodingProfiles.map(({ name: label, id: value }) => ({ label, value }));
            this._transcodingProfileField.setValue(this._transcodingProfiles[0].value);
          }
        },
        (error) => {
          this._transcodingProfileError = new AreaBlockerMessage({
            message: error.message,
            buttons: [
              {
                label: this._appLocalization.get('app.common.retry'),
                action: () => {
                  this._transcodingProfileError = null;
                  this._transcodingProfileLoading = false;
                  this._loadTranscodingProfiles();
                }
              },
              {
                label: this._appLocalization.get('app.common.cancel'),
                action: () => {
                  this._transcodingProfileError = null;
                  this._transcodingProfileLoading = false;
                  this.parentPopupWidget.close();
                }
              }
            ]
          });
        });
  }

  public _removeFile(file: UploadSettingsFile): void {
    const fileIndex = this._files.indexOf(file);
    if (fileIndex !== -1) {
      const newList = Array.from(this._files);
      newList.splice(fileIndex, 1);
      this._files = newList;
    }
  }

  public _upload(): void {

    if (this._files.some(({ isEditing }) => isEditing)) {
      return;
    }

    const trancodingProfileId = this._profileForm.value.transcodingProfile;

    if (trancodingProfileId === null || typeof trancodingProfileId === 'undefined' || trancodingProfileId.length === 0) {
      this._transcodingProfileError = new AreaBlockerMessage({
        message: this._appLocalization.get('applications.upload.validation.missingTranscodingProfile'),
        buttons: [
          {
            label: this._appLocalization.get('app.common.ok'),
            action: () => {
              this._transcodingProfileError = null;
            }
          }
        ]
      });
      return;
    }

    if (this._validateFiles(this._files)) {
      this.parentPopupWidget.close();
      const uploadFileDataList = this._files.map(fileData => ({
        file: fileData.file,
        mediaType: fileData.mediaType,
        entryName: fileData.name
      }));

      this._newEntryUploadService.upload(uploadFileDataList, Number(trancodingProfileId));
    }
  }

  private _validateFiles(files: UploadSettingsFile[]): boolean {

    let result = true;
    const allowedTypes = [KalturaMediaType.audio, KalturaMediaType.video, KalturaMediaType.image];
    const maxFileSize = globalConfig.kalturaServer.maxUploadFileSize;

    files.forEach(file => {
      const fileSize = file.size / 1024 / 1024; // convert to Mb

      if (allowedTypes.indexOf(file.mediaType) === -1) {
        result = false;
        file.errorToken = 'applications.upload.validation.wrongType';
        file.hasError = true;
      } else if (!(this._uploadManagement.supportChunkUpload(new NewEntryUploadFile(null, null, null, null)) || fileSize < maxFileSize)) {
        result = false;
        file.hasError = true;
        file.errorToken = 'applications.upload.validation.fileSizeExceeded';
      } else {
        file.hasError = false;
        file.errorToken = null;
      }
    });

    return result;
  }

  public _updateFileValidityOnTypeChange(file: UploadSettingsFile): void {
    if (file.hasError && file.errorToken === 'applications.upload.validation.wrongType') {
      file.errorToken = null;
      file.hasError = false;
    }
  }

  public _editName(file: UploadSettingsFile): void {
    file.isEditing = true;
  }

  public _cancelEdit(file: UploadSettingsFile): void {
    const name = file.name.trim() || '';

    if (name) {
      file.isEditing = file.hasError = false;
      file.name = name;
    } else {
      file.hasError = true;
      file.errorToken = 'applications.upload.validation.fileNameRequired';
    }
  }
}
