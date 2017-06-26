import { OnInit, Component } from '@angular/core';
import { ConfirmationService, Confirmation } from 'primeng/primeng';
import { BrowserService } from 'app-shared/kmc-shell/providers/browser.service';

/*
 * App Component
 * Top Level Component
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers : [ConfirmationService]
})
export class AppComponent implements OnInit {

  constructor(private _confirmationService : ConfirmationService, private _browserService : BrowserService ) {

  }

  ngOnInit()
  {
      this._browserService.registerOnShowConfirmation(this._confirmationService.confirm.bind(this._confirmationService));
  }
}
