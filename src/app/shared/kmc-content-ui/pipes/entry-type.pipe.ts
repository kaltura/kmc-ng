import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'entryType'})
export class EntryTypePipe implements PipeTransform {
  transform(value = '1'): string {
    let icon = '';
    switch (value.toString()) {
      case '1':
         icon = 'media.png';
         break;
      case '2':
        icon = 'image.png';
        break;
      case '5':
        icon = 'audio.png';
        break;
      case '201':
      case '202':
      case '203':
      case '204':
        icon = 'live.png';
        break;
      default:
        icon = 'unknown.png';
        break;
    }
    return 'assets/content/entryTypes/' + icon;
  }
}
