import { Component, Input } from '@angular/core';
import { KalturaDistributionValidationError } from 'kaltura-ngx-client/api/types/KalturaDistributionValidationError';
import { KalturaDistributionValidationErrorConditionNotMet } from 'kaltura-ngx-client/api/types/KalturaDistributionValidationErrorConditionNotMet';
import { KalturaDistributionValidationErrorMissingThumbnail } from 'kaltura-ngx-client/api/types/KalturaDistributionValidationErrorMissingThumbnail';
import { KalturaDistributionValidationErrorMissingMetadata } from 'kaltura-ngx-client/api/types/KalturaDistributionValidationErrorMissingMetadata';
import { KalturaDistributionValidationErrorMissingFlavor } from 'kaltura-ngx-client/api/types/KalturaDistributionValidationErrorMissingFlavor';
import { KalturaDistributionValidationErrorInvalidData } from 'kaltura-ngx-client/api/types/KalturaDistributionValidationErrorInvalidData';
import { OverlayPanel } from 'primeng/primeng';

export interface DistributedProfileErrorsGroup {
  [key: string]: KalturaDistributionValidationError[]
}

@Component({
  selector: 'kEntryDistributedProfileErrors',
  templateUrl: './distributed-profile-errors.component.html',
  styleUrls: ['./distributed-profile-errors.component.scss']
})
export class DistributedProfileErrorsComponent {
  @Input() set errors(value: KalturaDistributionValidationError[]) {
    if (value && value.length) {
      this._errors = this._mapErrors(value);
      this._errorsKeys = Object.keys(this._errors);
    }
  }

  public _errors: DistributedProfileErrorsGroup;
  public _errorsKeys: string[] = [];
  public _selectedErrorGroup: { type: string, errors: KalturaDistributionValidationError[] };

  private _mapErrors(errors: KalturaDistributionValidationError[]): DistributedProfileErrorsGroup {
    const updateErrorType = (acc, val, type) => {
      if (!acc[type]) {
        return Object.assign(acc, { [type]: [val] });
      }
      return Object.assign(acc, { [type]: [...acc[type], val] });
    };

    return errors.reduce((acc, val) => {
      switch (true) {
        case val instanceof KalturaDistributionValidationErrorInvalidData:
          return updateErrorType(acc, val, 'metadataError');

        case val instanceof KalturaDistributionValidationErrorMissingMetadata:
          return updateErrorType(acc, val, 'missingMetadata');

        case val instanceof KalturaDistributionValidationErrorMissingFlavor:
          return updateErrorType(acc, val, 'missingFlavor');

        case val instanceof KalturaDistributionValidationErrorMissingThumbnail:
          return updateErrorType(acc, val, 'missingThumbnail');

        case val instanceof KalturaDistributionValidationErrorConditionNotMet:
          return updateErrorType(acc, val, 'autoDistributionMetadataMissing');

        default:
          break;
      }
    }, {})
  }

  public _toggleErrorInfo($event: Event, errorGroup: KalturaDistributionValidationError[], type: string, panel: OverlayPanel): void {
    this._selectedErrorGroup = { type, errors: errorGroup };
    panel.toggle($event);
  }
}
