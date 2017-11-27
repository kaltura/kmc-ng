import { NgModule } from '@angular/core';
import { KalturaClientModule } from '@kaltura-ng/kaltura-client';
import { UploadFileAdapterToken, UploadManagementModule } from '@kaltura-ng/kaltura-common';
import { KalturaUploadAdapter } from './kaltura-upload-adapter.service';

@NgModule({
    imports: <any[]>[
        KalturaClientModule,
        UploadManagementModule
    ],
    declarations: <any[]>[
    ],
    exports: <any[]>[
    ],
    providers: <any[]>[
        {
            provide : UploadFileAdapterToken,
            useClass : KalturaUploadAdapter,
            multi : true
        }
    ]
})
export class KalturaServerModule {

}
