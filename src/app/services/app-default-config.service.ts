import { Injectable } from '@angular/core';

@Injectable()
export class AppDefaultConfig {
  configUri = "config/app.json";
  loginRoute = "/login";
  errorRoute = "/error";
  defaultRoute = "/dashboard";
}
