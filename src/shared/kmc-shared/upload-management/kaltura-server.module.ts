import { NgModule } from '@angular/core';
import { KalturaClientModule } from 'kaltura-ngx-client';
import { UploadFileAdapterToken, UploadManagementModule } from '@kaltura-ng/kaltura-common';
import { KalturaUploadAdapter } from './kaltura-upload-adapter.service';

@NgModule({
    imports: [
        KalturaClientModule,
        UploadManagementModule
    ],
    declarations: [
    ],
    exports: [
    ],
    providers: [
        {
            provide : UploadFileAdapterToken,
            useClass : KalturaUploadAdapter,
            multi : true
        }
    ]
})
export class KalturaServerModule {

}
