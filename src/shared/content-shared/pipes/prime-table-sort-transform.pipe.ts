import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'kPrimeTableSortTransform' })
export class PrimeTableSortTransformPipe implements PipeTransform {
  transform(value: boolean): string | boolean {
    return value ? 'custom' : false;
  }
}
