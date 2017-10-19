import { Pipe, PipeTransform } from '@angular/core';
import { KalturaDropFolderFile } from 'kaltura-typescript-client/types/KalturaDropFolderFile';
import { DropFoldersService } from '../drop-folders.service';

@Pipe({ name: 'kFolderName' })
export class FolderNamePipe implements PipeTransform {
  constructor(private _dropFoldersService: DropFoldersService) {}

  transform(value: string, folder: KalturaDropFolderFile = null): string {
    let folderName = value;
    this._dropFoldersService.ar.forEach(folder => {
      if(folder.id === value) {
        folderName = folder.name;
      }
    });
    return folderName;
  }
}
