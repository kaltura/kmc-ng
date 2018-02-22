import { AreaBlockerMessage, AreaBlockerMessageButton, WidgetBase } from '@kaltura-ng/kaltura-ui';
import { TranscodingProfileWidgetsManager } from './transcoding-profile-widgets-manager';
import { KalturaMultiRequest } from 'kaltura-ngx-client';
import { KalturaConversionProfile } from 'kaltura-ngx-client/api/types/KalturaConversionProfile';

export abstract class TranscodingProfileWidget extends WidgetBase<TranscodingProfileWidgetsManager, KalturaConversionProfile, KalturaMultiRequest> {
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

  protected _showBlockerMessage(message: AreaBlockerMessage, addBackToProfilesButton: boolean) {
    let messageToShow = message;
    if (addBackToProfilesButton) {
      messageToShow = new AreaBlockerMessage({
        message: message.message,
        buttons: [
          ...this._createBackToEntriesButton(),
          ...message.buttons
        ]
      });
    }

    this.showSectionLoader = false;
    this.sectionBlockerMessage = messageToShow;
  }

  protected _createBackToEntriesButton(): AreaBlockerMessageButton[] {
    if (this.form) {
      return [{
        label: 'Back To Profiles',
        action: () => {
          this.form.returnToProfiles();
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
