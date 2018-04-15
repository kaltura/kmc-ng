import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { AppShellService } from 'app-shared/kmc-shell';

@Component({
  selector: 'kKMCDashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  @ViewChild('appMenu') private _appMenuRef: ElementRef;

  @HostListener('window:resize') private _resizeContent(): void {
    if (this._appMenuRef) {
      this._appShellService.setContentAreaHeight(window.innerHeight - this._appMenuRef.nativeElement.offsetHeight);
    }
  }

  constructor(private _appShellService: AppShellService) {
  }
}
