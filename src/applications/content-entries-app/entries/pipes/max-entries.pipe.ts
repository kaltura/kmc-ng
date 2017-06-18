import { Pipe, PipeTransform } from '@angular/core';
import { environment } from 'app-environment';


@Pipe({name: 'kMaxEntries'})
export class MaxEntriesPipe implements PipeTransform {
  constructor() {
  }

  transform(value: number): number {
  	const maxEntries = environment.entriesShared.MAX_ENTRIES;
    return value >  maxEntries ? maxEntries : value;
  }
}
