import { AreaBlockerMessage, AreaBlockerMessageButton, WidgetBase } from '@kaltura-ng/kaltura-ui';
import {KalturaMultiRequest, KalturaRoomEntry} from 'kaltura-ngx-client';
import { RoomWidgetsManager } from './room-widgets-manager';
import {KalturaLogger} from '@kaltura-ng/kaltura-logger';


export abstract class RoomWidget extends WidgetBase<RoomWidgetsManager, KalturaRoomEntry, KalturaMultiRequest> {
  public sectionBlockerMessage: AreaBlockerMessage;
  public showSectionLoader: boolean;

  constructor(private _widgetKey: string, logger: KalturaLogger) {
    super(_widgetKey, logger);
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

  protected _showBlockerMessage(message: AreaBlockerMessage, addBackToRoomsButton: boolean) {
    let messageToShow = message;
    if (addBackToRoomsButton) {
      messageToShow = new AreaBlockerMessage({
        message: message.message,
        buttons: [
          ...this._createBackToRoomsButton(),
          ...message.buttons
        ]
      })
    }

    this.showSectionLoader = false;
    this.sectionBlockerMessage = messageToShow;
  }

  protected _createBackToRoomsButton(): AreaBlockerMessageButton[] {
    if (this.form) {
      return [{
        label: 'Back To Rooms',
        action: () => {
          this.form.returnToRooms();
        }
      }];
    } else {
      return [{
        label: 'Dismiss',
        action: () => {
          this._removeBlockerMessage();
        }
      }];
    }
  }

  protected _showActivationError(message?: string) {
    this._showBlockerMessage(new AreaBlockerMessage(
      {
        message: message || 'An error occurred while loading data',
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
