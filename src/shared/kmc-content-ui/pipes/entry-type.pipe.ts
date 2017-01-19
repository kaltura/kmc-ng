import { Pipe, PipeTransform } from '@angular/core';
import { EntryType } from '../entries-store/entries-store.service';

@Pipe({name: 'entryType'})
export class EntryTypePipe implements PipeTransform {
  transform(value): string {
    let className = 'k-entry-';
    if (typeof(value) !== 'undefined' && value !== null)  {
      switch (value) {
        case EntryType.Media:
          className += 'media';
          break;
        case EntryType.Image:
          className += 'image';
          break;
        case EntryType.Audio:
          className += 'audio';
          break;
        case EntryType.Live:
        case EntryType.Live2:
        case EntryType.Live3:
        case EntryType.Live4:
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
