import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { SelectItem } from 'primeng/primeng';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { KalturaMediaType } from 'kaltura-typescript-client/types/KalturaMediaType';
import { NewEntryUploadService } from 'app-shared/kmc-shell';
import { AreaBlockerMessage, FileDialogComponent } from '@kaltura-ng/kaltura-ui';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import { environment } from 'app-environment';
import { ConversionProfileListAction } from 'kaltura-typescript-client/types/ConversionProfileListAction';
import { KalturaConversionProfileFilter } from 'kaltura-typescript-client/types/KalturaConversionProfileFilter';
import { KalturaConversionProfileType } from 'kaltura-typescript-client/types/KalturaConversionProfileType';
import { KalturaFilterPager } from 'kaltura-typescript-client/types/KalturaFilterPager';
import { KalturaClient } from '@kaltura-ng/kaltura-client';

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

  private _tempName: string;

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


  constructor(private _kalturaServerClient: KalturaClient,
              private _newEntryUploadService: NewEntryUploadService,
              private _formBuilder: FormBuilder,
              private _appLocalization: AppLocalization) {
    this._buildForm();
  }

  private _buildForm(): void {
    this._profileForm = this._formBuilder.group({ 'transcodingProfile': '' });
    this._transcodingProfileField = this._profileForm.controls['transcodingProfile'];
  }

  ngAfterViewInit(): void {
    this._fileDialog.open();
  }

  ngOnInit() {
    this._loadTranscodingProfiles();
  }

  private _handleSelectedFiles(files: FileList) {
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


  private _loadTranscodingProfiles() {
    this._transcodingProfileLoading = true;
    this._kalturaServerClient
      .request(new ConversionProfileListAction(
        {
          filter: new KalturaConversionProfileFilter(
            { typeEqual: KalturaConversionProfileType.media }
          ),
          pager: new KalturaFilterPager({ pageSize: 500 })
        }))
      .subscribe(
        response => {
          const profiles = response.objects;
          this._transcodingProfileLoading = false;
          this._transcodingProfiles = profiles.map(({ name: label, id: value }) => ({ label, value }));

          const defaultValue = profiles.find(({ isDefault }) => !!isDefault);
          if (defaultValue) {
            this._transcodingProfileField.setValue(defaultValue.id);
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
        name: fileData.name
      }));

      this._newEntryUploadService.upload(uploadFileDataList, trancodingProfileId * 1);
    }
  }

  private _validateFiles(files: UploadSettingsFile[]): boolean {

    let result = true;
    const allowedTypes = [KalturaMediaType.audio, KalturaMediaType.video, KalturaMediaType.image];
    const maxFileSize = environment.uploadsShared.MAX_FILE_SIZE;

    this._files.forEach(file => {
      const fileSize = file.size / 1024 / 1024; // convert to Mb

      if (!allowedTypes.includes(file.mediaType)) {
        result = false;
        file.errorToken = 'applications.upload.validation.wrongType';
        file.hasError = true;
      } else if (fileSize > maxFileSize) {
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


  public _relatedTableRowStyle(rowData): string {
    return rowData.hasError ? 'has-error' : '';
  }

  public _editName(file: UploadSettingsFile): void {
    this._tempName = file.name;
    file.isEditing = true;
  }

  public _updateName(name: string = ''): void {
    this._tempName = name.trim() || '';
  }

  public _cancelEdit(file: UploadSettingsFile): void {
    const name = this._tempName;

    if (file.name === name) {
      file.isEditing = false;
      return;
    }

    if (name && file.name !== name) {
      file.isEditing = file.hasError = false;
      file.name = name;
      this._tempName = '';
    } else {
      file.hasError = true;
    }
  }
}
