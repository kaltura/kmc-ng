import { Injectable } from '@angular/core';

@Injectable()
export class AppBootstrapConfig {
  configUri = "config/app.json";
  loginRoute = "login";
  errorRoute = "/error";
  authenticatedRoute = "dashboard";
}
