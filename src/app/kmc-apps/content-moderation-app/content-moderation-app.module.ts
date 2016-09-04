import { NgModule }           from '@angular/core';
import { CommonModule }       from '@angular/common';
import { FormsModule, ReactiveFormsModule }        from '@angular/forms';

import { routing} from './content-moderation-app.routes';
import { ModerationComponent } from './components/moderation.component';

@NgModule({
  imports:      [ CommonModule, FormsModule, routing, ReactiveFormsModule ],
  declarations: [ ModerationComponent ],
  providers:    []
})
export class ContentModerationAppModule { }
