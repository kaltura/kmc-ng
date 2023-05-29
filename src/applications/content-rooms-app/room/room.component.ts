import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BrowserService } from 'app-shared/kmc-shell/providers';
import { AreaBlockerMessage, AreaBlockerMessageButton } from '@kaltura-ng/kaltura-ui';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { Observable } from 'rxjs';
import { RoomsStore } from '../rooms/rooms-store/rooms-store.service';
import { KMCPermissionsService } from 'app-shared/kmc-shared/kmc-permissions';
import { ContentRoomViewSections, ContentRoomViewService } from 'app-shared/kmc-shared/kmc-views/details-views';
import { cancelOnDestroy } from '@kaltura-ng/kaltura-common';
import { AnalyticsNewMainViewService } from "app-shared/kmc-shared/kmc-views";
import { ActionTypes, NotificationTypes, RoomStore } from "./room-store.service";
import { RoomWidgetsManager } from "./room-widgets-manager";
import { RoomSectionsListWidget } from "./room-sections-list/room-sections-list-widget.service";
import { RoomDetailsWidget } from "./room-details/room-details-widget.service";
import { RoomMetadataWidget } from "./room-metadata/room-metadata-widget.service";
import { RoomThumbnailsWidget } from "./room-thumbnails/room-thumbnails-widget.service";
import { RoomAccessControlWidget } from "./room-access-control/room-access-control-widget.service";
import { RoomUsersWidget } from "./room-users/room-users-widget.service";
import { RoomBreakoutWidget } from "./room-breakout/room-breakout-widget.service";

@Component({
  selector: 'kRoom',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss'],
  providers: [
    RoomsStore,
    RoomStore,
    RoomWidgetsManager,
    RoomThumbnailsWidget,
    RoomSectionsListWidget,
    RoomDetailsWidget,
    RoomMetadataWidget,
    RoomAccessControlWidget,
    RoomBreakoutWidget,
    RoomUsersWidget
  ]
})
export class RoomComponent implements OnInit, OnDestroy {
  public _roomName: string;
  public _currentRoomId: string;
  public _showLoader = false;
  public _areaBlockerMessage: AreaBlockerMessage;
  public isValid = true;
  public isDirty = true;
  public _analyticsAllowed = false;
  public _enablePrevButton: boolean;
  public _enableNextButton: boolean;

    public get _enableSaveBtn(): boolean {
        return this._roomStore.roomIsDirty; // TODO [kmc] check for room update permissions once added to the backend
    }

  constructor(private _browserService: BrowserService,
              public _roomStore: RoomStore,
              private _appLocalization: AppLocalization,
              private _roomsStore: RoomsStore,
              private _permissionsService: KMCPermissionsService,
              private _roomWidgetsManager: RoomWidgetsManager,
              widget1: RoomSectionsListWidget,
              widget2: RoomDetailsWidget,
              widget3: RoomMetadataWidget,
              widget4: RoomThumbnailsWidget,
              widget5: RoomAccessControlWidget,
              widget6: RoomBreakoutWidget,
              widget7: RoomUsersWidget,
              private _contentRoomView: ContentRoomViewService,
              private _analyticsNewMainViewService: AnalyticsNewMainViewService,
              private _router: Router,
              private _roomRoute: ActivatedRoute) {
    _roomWidgetsManager.registerWidgets([widget1, widget2, widget3, widget4, widget5, widget6, widget7])
  }

  ngOnInit() {
    let errorMessage;
      this._roomStore.notifications$
          .pipe(cancelOnDestroy(this))
          .subscribe(
              ({ type, error }) => {
                  switch(type) {
                      case NotificationTypes.ViewEntered:
                          const room = this._roomStore.room;
                          if (room ) {
                              this._contentRoomView.viewEntered({
                                  room,
                                  activatedRoute: this._roomRoute,
                                  section: ContentRoomViewSections.ResolveFromActivatedRoute
                              });
                          }

                          break;
                      default:
                          break;
                  }
              });

    this._roomStore.state$
      .pipe(cancelOnDestroy(this))
      .subscribe(
        status => {
          this._showLoader = false;
          this._areaBlockerMessage = null;

          if (status) {
            switch (status.action) {
              case ActionTypes.RoomLoading:
                this._showLoader = true;

                // when loading new room in progress, the 'roomId' property
                // reflect the room that is currently being loaded
                // while 'room$' stream is null
                this._currentRoomId = this._roomStore.roomId;
                break;

              case ActionTypes.RoomLoaded:
                this._roomName = this._roomStore.room.name;
                this._analyticsAllowed = this._analyticsNewMainViewService.isAvailable(); // new analytics app is available
                this._updateNavigationState();
                break;

              case ActionTypes.RoomLoadingFailed:
                errorMessage = status.error
                  ? status.error.message
                  : this._appLocalization.get('applications.content.errors.loadError');
                this._areaBlockerMessage = new AreaBlockerMessage({
                  message: errorMessage,
                  buttons: [
                    this._createBackToRoomsButton(),
                    {
                      label: this._appLocalization.get('applications.content.playlistDetails.errors.retry'),
                      action: () => this._roomStore.reloadRoom()
                    }
                  ]
                });
                break;

              case ActionTypes.RoomSaving:
                this._showLoader = true;
                break;

              case ActionTypes.RoomSavingFailed:
                errorMessage = status.error && status.error.message
                  ? status.error.message
                  : this._appLocalization.get('applications.content.playlistDetails.errors.saveError');

                this._areaBlockerMessage = new AreaBlockerMessage({
                  message: errorMessage,
                  buttons: [{
                    label: this._appLocalization.get('applications.content.playlistDetails.errors.ok'),
                    action: () => this._roomStore.reloadRoom()
                  }]
                });
                break;

              case ActionTypes.RoomDataIsInvalid:
                this._areaBlockerMessage = new AreaBlockerMessage({
                  message: this._appLocalization.get('applications.content.playlistDetails.errors.validationError'),
                  buttons: [{
                    label: this._appLocalization.get('applications.content.playlistDetails.errors.dismiss'),
                    action: () => this._areaBlockerMessage = null
                  }]
                });
                break;

              case ActionTypes.ActiveSectionBusy:
                this._areaBlockerMessage = new AreaBlockerMessage({
                  message: this._appLocalization.get('applications.content.playlistDetails.errors.busyError'),
                  buttons: [{
                    label: this._appLocalization.get('applications.content.playlistDetails.errors.dismiss'),
                    action: () => this._areaBlockerMessage = null
                  }]
                });
                break;

              case ActionTypes.RoomPrepareSavingFailed:
                errorMessage = status.error && status.error.message
                  ? status.error.message
                  : this._appLocalization.get('applications.content.playlistDetails.errors.savePrepareError');
                this._areaBlockerMessage = new AreaBlockerMessage({
                  message: errorMessage,
                  buttons: [{
                    label: this._appLocalization.get('applications.content.playlistDetails.errors.dismiss'),
                    action: () => this._areaBlockerMessage = null
                  }]
                });
                break;

              default:
                break;
            }
          }
        },
        error => {
          this._areaBlockerMessage = new AreaBlockerMessage({
            message: error.message,
            buttons: [{
              label: this._appLocalization.get('applications.content.playlistDetails.errors.ok'),
              action: () => this._roomStore.reloadRoom()
            }]
          });
        }
      );



  }

  ngOnDestroy() {
  }

  private _updateNavigationState(): void {
    const rooms = this._roomsStore.rooms.data().items;
    if (rooms && this._currentRoomId) {
      const currentRoomIndex = rooms.findIndex(room => room.id === this._currentRoomId);
      this._enableNextButton = currentRoomIndex >= 0 && (currentRoomIndex < rooms.length - 1);
      this._enablePrevButton = currentRoomIndex > 0;
    } else {
      this._enableNextButton = false;
      this._enablePrevButton = false;
    }
  }

  private _createBackToRoomsButton(): AreaBlockerMessageButton {
    return {
      label: this._appLocalization.get('applications.content.rooms.backToPlaylists'),
      action: () => this._roomStore.returnToRooms()
    };
  }

  public _backToList(): void {
    this._roomStore.returnToRooms();
  }

  public save(): void {
    this._roomStore.saveRoom();
  }

  public _navigateToRoom(direction: 'next' | 'prev'): void {
    const rooms = this._roomsStore.rooms.data().items;
    if (rooms && this._currentRoomId) {
      const currentRoomIndex = rooms.findIndex(room => room.id === this._currentRoomId);
      let newRoom = null;
      if (direction === 'next' && this._enableNextButton) {
          newRoom = rooms[currentRoomIndex + 1];
      }
      if (direction === 'prev' && this._enablePrevButton) {
          newRoom = rooms[currentRoomIndex - 1];
      }
      if (newRoom) {
        this._roomStore.openRoom(newRoom);
      }
    }
  }

    public _openRoomAnalytics(): void {
        if (this._analyticsAllowed) {
            this._router.navigate(['analytics/entry-ep'], { queryParams: { id: this._roomStore.room.id } });
        }
    }

  public canLeave(): Observable<{ allowed: boolean }> {
    return this._roomStore.canLeaveWithoutSaving();
  }

}
