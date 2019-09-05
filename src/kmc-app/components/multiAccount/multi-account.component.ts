import {Component, Output, OnInit, EventEmitter} from '@angular/core';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { BrowserService} from 'app-shared/kmc-shell';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'kMultiAccountMenu',
  templateUrl: './multi-account.component.html',
  styleUrls: ['./multi-account.component.scss']
})
export class MultiAccountComponent implements OnInit {

  @Output() menuChange = new EventEmitter<string>();
  public _menuItems: MenuItem[] = [];
  public _defaultMenuSelection: string;

  constructor(private _appLocalization: AppLocalization,
              private _browserService: BrowserService) {
  }

  ngOnInit() {
      this._menuItems = [
          {label: this._appLocalization.get('app.titles.parentOnly'),styleClass: 'kSelected', command: (event) => {
                  this._defaultMenuSelection = this._appLocalization.get('app.titles.parentOnly');
                  this._browserService.setInLocalStorage('multiAccountAnalytics', 'parentOnly');
                  this._menuItems[0].styleClass = 'kSelected';
                  this._menuItems[1].styleClass = '';
                  this.menuChange.emit('parentOnly');
              }},
          {label: this._appLocalization.get('app.titles.allAccounts'),command: (event) => {
                  this._defaultMenuSelection = this._appLocalization.get('app.titles.allAccounts');
                  this._browserService.setInLocalStorage('multiAccountAnalytics', 'allAccounts');
                  this._menuItems[0].styleClass = '';
                  this._menuItems[1].styleClass = 'kSelected';
                  this.menuChange.emit('allAccounts');
              }}
      ];
      const multiAccountAnalytics = this._browserService.getFromLocalStorage('multiAccountAnalytics');
      this._defaultMenuSelection = multiAccountAnalytics && multiAccountAnalytics === 'allAccounts' ? this._menuItems[1].label : this._menuItems[0].label;
  }

}

