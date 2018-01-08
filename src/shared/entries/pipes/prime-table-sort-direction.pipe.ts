import { Pipe, PipeTransform } from '@angular/core';
import { SortDirection } from 'app-shared/entries/entries-store/entries-store.service';

@Pipe({ name: 'kPrimeTableSortDirection' })
export class PrimeTableSortDirectionPipe implements PipeTransform {
  transform(value: SortDirection): number {
    switch (value) {
      case SortDirection.Asc:
        return 1;
      case SortDirection.Desc:
        return -1;
    }
  }
}
