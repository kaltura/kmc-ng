import { Pipe, PipeTransform } from '@angular/core';
import { environment } from 'kmc-app';


@Pipe({name: 'kMaxEntries'})
export class MaxEntriesPipe implements PipeTransform {
  constructor() {
  }

  transform(value: number): number {
  	const maxEntries = environment.entriesShared.MAX_ENTRIES;
    return value >  maxEntries ? maxEntries : value;
  }
}
