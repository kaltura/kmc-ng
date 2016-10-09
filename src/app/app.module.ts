import { NgModule, NgModuleFactoryLoader, enableProdMode } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { routing } from './app.routes';
import { KMCShellAppModule } from './shell/kmc-shell.module';

// depending on the env mode, enable prod mode or add debugging modules
if (process.env.ENV === 'build') {
  enableProdMode();
}

@NgModule({
  imports: <any>[ routing,  RouterModule.forRoot([]), KMCShellAppModule ],       // module dependencies
  declarations: <any>[ AppComponent ],   // components and directives
  bootstrap: <any>[ AppComponent ],     // root component
  providers: <any>[

  ]
})
export class AppModule { }
