import { Pipe, PipeTransform } from '@angular/core';
import { SortDirection } from 'app-shared/content-shared/entries/entries-store/entries-store.service';

@Pipe({ name: 'kEntriesTableSortDirection' })
export class EntriesTableSortDirectionPipe implements PipeTransform {
  transform(value: SortDirection): number {
    switch (value) {
      case SortDirection.Asc:
        return 1;
      case SortDirection.Desc:
        return -1;
    }
  }
}
