import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'entryStatus'})
export class EntryStatusPipe implements PipeTransform {
  transform(value: string): string {
    let ret: string = '';
    switch (value.toString()){
      case '-2':
            ret = 'Error Importing';
            break;
      case '-1':
            ret = 'Error Converting';
            break;
      case 'virusScan.ScanFailure':
            ret = 'Scan Failure';
            break;
      case '0':
            ret = 'Import';
            break;
      case 'virusScan.Infected':
            ret = 'Infected';
            break;
      case '1':
            ret = 'Preconvert';
            break;
      case '2':
            ret = 'Ready';
            break;
      case '3':
            ret = 'Deleted';
            break;
      case '4':
            ret = 'Pending';
            break;
      case '5':
            ret = 'Moderate';
            break;
      case '6':
            ret = 'Blocked';
            break;
      case '7':
            ret = 'No Content';
            break;
    }
    return ret;
  }
}
