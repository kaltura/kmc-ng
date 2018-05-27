import {FeedDetailsComponent} from './feed-details.component';
import {GoogleDestinationFormComponent} from "./destinations-forms/google-destination-form/google-destination-form.component";
import {YahooDestinationFormComponent} from "./destinations-forms/yahoo-destination-form/yahoo-destination-form.component";
import {RokuDestinationFormComponent} from "./destinations-forms/roku-destination-form/roku-destination-form.component";
import {OperaDestinationFormComponent} from "applications/content-syndication-app/feeds/feed-details/destinations-forms/opera-destination-form/opera-destination-form.component";
import {FlexibleFormatDestinationFormComponent} from "./destinations-forms/flexible-format-destination-form/flexible-format-destination-form.component";
import { ItunesDestinationFormComponent } from './destinations-forms/itunes-destination-form/itunes-destination-form.component';

export const FeedDetailsComponentsList = [
  FeedDetailsComponent,
  GoogleDestinationFormComponent,
  YahooDestinationFormComponent,
  RokuDestinationFormComponent,
  OperaDestinationFormComponent,
  FlexibleFormatDestinationFormComponent,
  ItunesDestinationFormComponent
];
