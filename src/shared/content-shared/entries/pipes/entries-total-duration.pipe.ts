import { Pipe, PipeTransform } from '@angular/core';
import { KalturaMediaEntry } from 'kaltura-ngx-client/api/types/KalturaMediaEntry';

@Pipe({ name: 'kEntriesTotalDuration' })
export class EntriesTotalDurationPipe implements PipeTransform {

  transform(entries: KalturaMediaEntry[] = []): number {
    return Array.isArray(entries) ? entries.reduce((total, entry) => total + entry.duration, 0) : 0;
  }
}
