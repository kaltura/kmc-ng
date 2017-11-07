import { AreaBlockerMessage, AreaBlockerMessageButton, WidgetBase } from '@kaltura-ng/kaltura-ui';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';
import { KalturaMultiRequest } from 'kaltura-typescript-client';
import { PlaylistWidgetsManager } from './playlist-widgets-manager';
import { KalturaPlaylist } from 'kaltura-typescript-client/types/KalturaPlaylist';

export abstract class PlaylistWidget extends WidgetBase<PlaylistWidgetsManager, KalturaPlaylist, KalturaMultiRequest> {
  public sectionBlockerMessage: AreaBlockerMessage;
  public showSectionLoader: boolean;

  constructor(private _widgetKey: string) {
    super(_widgetKey);
  }

  protected _showLoader() {
    this._removeBlockerMessage();
    this.showSectionLoader = true;
  }

  protected _hideLoader() {
    this.showSectionLoader = false;
  }

  protected _removeBlockerMessage(): void {
    this.sectionBlockerMessage = null;
  }

  protected _showBlockerMessage(message: AreaBlockerMessage, addBackToPlaylistsButton: boolean) {
    let messageToShow = message;
    if (addBackToPlaylistsButton) {
      messageToShow = new AreaBlockerMessage({
        message: message.message,
        buttons: [
          ...this._createBackToPlaylistsButton(),
          ...message.buttons
        ]
      })
    }

    this.showSectionLoader = false;
    this.sectionBlockerMessage = messageToShow;
  }

  protected _createBackToPlaylistsButton(): AreaBlockerMessageButton[] {
    if (this.form) {
      return [{
        label: 'Back To Playlists',
        action: () => {
          this.form.returnToPlaylists();
        }
      }];
    } else {
      return [{
        label: 'dismiss',
        action: () => {
          this._removeBlockerMessage();
        }
      }];
    }
  }

  protected _showActivationError() {
    this._showBlockerMessage(new AreaBlockerMessage(
      {
        message: 'An error occurred while loading data',
        buttons: [
          {
            label: 'Retry',
            action: () => {
              this.activate();
            }
          }
        ]
      }
    ), true);
  }
}
