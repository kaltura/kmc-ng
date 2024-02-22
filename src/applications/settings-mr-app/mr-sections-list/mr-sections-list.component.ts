import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import {NavigationEnd, Router} from '@angular/router';
import {cancelOnDestroy} from '@kaltura-ng/kaltura-common';

export enum SettingsMrViewSections {
    Rules = 'rules',
    Review = 'review',
    Logs = 'logs'
}
export interface SectionWidgetItem {
    label: string;
    key: SettingsMrViewSections;
}

@Component({
  selector: 'kMrSectionsList',
  templateUrl: './mr-sections-list.component.html',
  styleUrls: ['./mr-sections-list.component.scss']
})

export class MrSectionsList implements OnInit, OnDestroy {
  public _sections: SectionWidgetItem[] = [];
  public selectedSection = '';

  constructor(public _appLocalization: AppLocalization,
              private router: Router) {

      router.events
          .pipe(cancelOnDestroy(this))
          .subscribe((event) => {
              if (event instanceof NavigationEnd) {
                  const currentRoute = event.urlAfterRedirects;
                  if (currentRoute.indexOf('/mr/') > -1) {
                      this.selectedSection = currentRoute.split('/').pop();
                  }
              }
          });
  }

  ngOnInit() {
      this._sections = [
          {
              label: this._appLocalization.get('applications.settings.mr.rules'),
              key: SettingsMrViewSections.Rules
          },
          {
              label: this._appLocalization.get('applications.settings.mr.review'),
              key: SettingsMrViewSections.Review
          },
          {
              label: this._appLocalization.get('applications.settings.mr.logs'),
              key: SettingsMrViewSections.Logs
          }
      ]
  }
  ngOnDestroy() {
  }

  public _navigateToSection(section: SectionWidgetItem): void {
      this.router.navigate(['settings/mr/' + section.key]);
  }

}
