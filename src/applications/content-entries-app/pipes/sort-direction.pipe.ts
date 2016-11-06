import { Pipe, PipeTransform } from '@angular/core';
import {SortDirection} from "kmc-content-ui/providers/content-entries-store.service";

@Pipe({name: 'sortDirection'})
export class SortDirectionPipe implements PipeTransform {
    transform(value: SortDirection): number {
        return  SortDirection.Asc ? 1 : -1;
    }
}
