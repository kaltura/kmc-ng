import { NgModule } from '@angular/core';
import { DynamicMetadataSectionFactory } from './dynamic-metadata-section-factory.service';
import { DynamicMetadataFormFactory } from './dynamic-metadata-form-factory.service';

@NgModule(
    {
        imports : [
        ],
        declarations : [
        ],
        exports : [
        ],
        providers : [
            DynamicMetadataSectionFactory,
            DynamicMetadataFormFactory
        ]
    }
)
export class DynamicMetadataFormModule
{

}