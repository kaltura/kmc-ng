import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'playlistType'})
export class PlaylistTypePipe implements PipeTransform {
  transform(value: string = '3'): string {
    const types = {
      '3': 'Manual',
      '10': 'Rule Based',
      '101': 'External'
    };
    return types[value];
  }
}
