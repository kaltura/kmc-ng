import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'entryType'})
export class EntryTypePipe implements PipeTransform {
  transform(value): string {
    let className = 'k-entry-';

    if (value) {
      switch (value.toString()) {
        case '1':
          className += 'media';
          break;
        case '2':
          className += 'image';
          break;
        case '5':
          className += 'audio';
          break;
        case '201':
        case '202':
        case '203':
        case '204':
          className += 'live';
          break;
        default:
          className += 'unknown';
          break;
      }
    }
    return className;
  }
}
