import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {DestinationComponentBase} from '../../feed-details.component';
import {KalturaGenericXsltSyndicationFeed} from 'kaltura-ngx-client/api/types/KalturaGenericXsltSyndicationFeed';
import {FormBuilder} from '@angular/forms';
import {AppLocalization} from '@kaltura-ng/kaltura-common';

@Component({
  selector: 'kFlexibleFormatDestinationForm',
  templateUrl: './flexible-format-destination-form.component.html',
  styleUrls: ['./flexible-format-destination-form.component.scss'],
  providers: [{provide: DestinationComponentBase, useExisting: FlexibleFormatDestinationFormComponent}]
})
export class FlexibleFormatDestinationFormComponent extends DestinationComponentBase implements OnInit, OnDestroy {

  @Output()
  onFormStateChanged = new EventEmitter<{ isValid: boolean, isDirty: boolean }>();

  @Input()
  feed: KalturaGenericXsltSyndicationFeed = null;

  public _error: string = null;
  public _xslCode: string = null;
  public _loading = false;
  private _fileReader: FileReader = new FileReader();

  constructor(private _fb: FormBuilder,
              private _appLocalization: AppLocalization) {
    super()
  }

  ngOnInit() {
    this.onFormStateChanged.emit({
      isValid: false,
      isDirty: false
    });
  }

  ngOnDestroy() {
  }

  public _onFileSelected(selectedFiles: FileList) {
    const showLoadError = () => {
      this._loading = false;
      this.onFormStateChanged.emit({isValid: false, isDirty: true});
      this._xslCode = null;
      this._error = this._appLocalization
        .get('applications.content.syndication.details.destinationsForms.flexibleFormat.xslCode.errors.loadingFile',
          {'0': fileData.name});
    };

    let fileData: File = null;
    if (selectedFiles && selectedFiles.length) {
      fileData = selectedFiles[0];

      try {
        this._loading = true;
        this._fileReader.readAsText(fileData);

        this._fileReader.onloadend = (e) => {
          this._loading = false;
          if (!this._fileReader.result) {
            showLoadError();
          } else {
            this.onFormStateChanged.emit({isValid: true, isDirty: true});
            this._xslCode = this._fileReader.result;
            this._error = null;
          }
        };
      } catch (ex) {
        showLoadError();
      }
    }
  }

  public getData(): KalturaGenericXsltSyndicationFeed {
    const data = new KalturaGenericXsltSyndicationFeed({
      xslt: this._xslCode
    });

    return data;
  }
}
