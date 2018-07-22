import { Injectable } from '@angular/core';
import { MetadataProfile } from '../custom-metadata';
import { DynamicFormService } from '@kaltura-ng/kaltura-ui';
import { DynamicMetadataForm } from './dynamic-metadata-form';
import { DynamicMetadataSectionFactory } from './dynamic-metadata-section-factory.service';

@Injectable()
export class DynamicMetadataFormFactory{

    constructor(private _dynamicFormService : DynamicFormService,
                private _dynamicMetadataSection : DynamicMetadataSectionFactory){
    }

    createHandler( metadataProfile : MetadataProfile) : DynamicMetadataForm
    {
        const metadataSection = this._dynamicMetadataSection.create(metadataProfile);
        return new DynamicMetadataForm(metadataProfile, metadataSection, this._dynamicFormService);
    }
}
