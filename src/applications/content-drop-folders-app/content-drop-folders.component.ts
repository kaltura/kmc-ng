import { Component } from '@angular/core';
import { DropFoldersService } from './drop-folders-list/drop-folders.service';

@Component({
  selector: 'kDropFolders',
  templateUrl: './content-drop-folders.component.html',
  styleUrls: ['./content-drop-folders.component.scss'],
  providers: [DropFoldersService]
})
export class ContentDropFoldersComponent {
}

