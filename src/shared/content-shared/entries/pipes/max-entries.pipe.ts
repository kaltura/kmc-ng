import { Pipe, PipeTransform } from '@angular/core';
import { modulesConfig } from 'config/modules';


@Pipe({ name: 'kMaxEntries' })
export class MaxEntriesPipe implements PipeTransform {
  constructor() {
  }

  transform(value: number): number {
    const maxEntries = modulesConfig.shared.lists.maxItems;
    return value > maxEntries ? maxEntries : value;
  }
}
