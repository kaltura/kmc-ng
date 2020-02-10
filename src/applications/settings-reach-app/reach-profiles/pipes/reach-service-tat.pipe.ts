import {Pipe, PipeTransform} from '@angular/core';
import {KalturaVendorServiceTurnAroundTime} from 'kaltura-ngx-client';
import {AppLocalization} from '@kaltura-ng/mc-shared';

@Pipe({name: 'kReachServiceTat'})
export class ReachServiceTatPipe implements PipeTransform {
    constructor(private _appLocalization: AppLocalization) {
    }
    
    transform(value: number): string {
        let tat = '';
        switch(value){
            case KalturaVendorServiceTurnAroundTime.bestEffort:
                tat = this._appLocalization.get('applications.settings.reach.services.turnAroundTime.bestEffort');
                break;
            case KalturaVendorServiceTurnAroundTime.eightHours:
                tat = this._appLocalization.get('applications.settings.reach.services.turnAroundTime.eightHours');
                break;
            case KalturaVendorServiceTurnAroundTime.fiveDays:
                tat = this._appLocalization.get('applications.settings.reach.services.turnAroundTime.fiveDays');
                break;
            case KalturaVendorServiceTurnAroundTime.fortyEightHours:
                tat = this._appLocalization.get('applications.settings.reach.services.turnAroundTime.fortyEightHours');
                break;
            case KalturaVendorServiceTurnAroundTime.fourDays:
                tat = this._appLocalization.get('applications.settings.reach.services.turnAroundTime.fourDays');
                break;
            case KalturaVendorServiceTurnAroundTime.immediate:
                tat = this._appLocalization.get('applications.settings.reach.services.turnAroundTime.immediate');
                break;
            case KalturaVendorServiceTurnAroundTime.sixHours:
                tat = this._appLocalization.get('applications.settings.reach.services.turnAroundTime.sixHours');
                break;
            case KalturaVendorServiceTurnAroundTime.tenDays:
                tat = this._appLocalization.get('applications.settings.reach.services.turnAroundTime.tenDays');
                break;
            case KalturaVendorServiceTurnAroundTime.thirtyMinutes:
                tat = this._appLocalization.get('applications.settings.reach.services.turnAroundTime.thirtyMinutes');
                break;
            case KalturaVendorServiceTurnAroundTime.threeHours:
                tat = this._appLocalization.get('applications.settings.reach.services.turnAroundTime.threeHours');
                break;
            case KalturaVendorServiceTurnAroundTime.twelveHours:
                tat = this._appLocalization.get('applications.settings.reach.services.turnAroundTime.twelveHours');
                break;
            case KalturaVendorServiceTurnAroundTime.twentyFourHours:
                tat = this._appLocalization.get('applications.settings.reach.services.turnAroundTime.twentyFourHours');
                break;
            case KalturaVendorServiceTurnAroundTime.twoHours:
                tat = this._appLocalization.get('applications.settings.reach.services.turnAroundTime.twoHours');
                break;
            default:
                tat = '';
                break;
        }
        return tat;
    }
}
