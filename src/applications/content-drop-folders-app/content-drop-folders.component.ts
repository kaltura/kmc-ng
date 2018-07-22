import { Component } from '@angular/core';
import { DropFoldersStoreService } from './drop-folders-store/drop-folders-store.service';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
import { KalturaLoggerName } from '@kaltura-ng/kaltura-logger';


@Component({
  selector: 'kDropFolders',
  templateUrl: './content-drop-folders.component.html',
  styleUrls: ['./content-drop-folders.component.scss'],
  providers: [
    DropFoldersStoreService,
      KalturaLogger,
    {
      provide: KalturaLoggerName, useValue: 'drop-folders-store.service'
    }
  ]
})
export class ContentDropFoldersComponent {
}

