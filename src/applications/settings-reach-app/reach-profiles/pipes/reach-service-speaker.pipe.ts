import {Pipe, PipeTransform} from '@angular/core';
import {KalturaNullableBoolean} from 'kaltura-ngx-client';
import {AppLocalization} from '@kaltura-ng/mc-shared';

@Pipe({name: 'kReachServiceSpeaker'})
export class ReachServiceSpeakerPipe implements PipeTransform {
    constructor(private _appLocalization: AppLocalization) {
    }
    
    transform(value: KalturaNullableBoolean): string {
        let speaker = '';
        switch(value){
            case KalturaNullableBoolean.trueValue:
                speaker = this._appLocalization.get('app.common.yes');
                break;
            case KalturaNullableBoolean.falseValue:
            case KalturaNullableBoolean.nullValue:
                speaker = this._appLocalization.get('app.common.no');
                break;
            default:
                speaker = '';
                break;
        }
        return speaker;
    }
}
