import {Pipe, PipeTransform} from '@angular/core';
import {KalturaVendorServiceType} from 'kaltura-ngx-client';
import {AppLocalization} from '@kaltura-ng/mc-shared';

@Pipe({name: 'kReachServiceType'})
export class ReachServiceTypePipe implements PipeTransform {
    constructor(private _appLocalization: AppLocalization) {
    }
    
    transform(value: number): string {
        let type = '';
        switch(value){
            case KalturaVendorServiceType.human:
                type = this._appLocalization.get('applications.settings.reach.services.human');
                break;
            case KalturaVendorServiceType.machine:
                type = this._appLocalization.get('applications.settings.reach.services.machine');
                break;
            default:
                type = '';
                break;
        }
        return type;
    }
}
