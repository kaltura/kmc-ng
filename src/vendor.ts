// Angular 2
import '@angular/platform-browser';
import '@angular/platform-browser-dynamic';
import '@angular/core';
import '@angular/common';
import '@angular/http';
import '@angular/router';

// RxJS Statics
import 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import 'rxjs/add/observable/fromPromise';

// RxJS Operators
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/toPromise';


// Bootstrap
import 'ng2-bootstrap/ng2-bootstrap';



// general libraries
import 'jquery';
import 'moment';
import 'ramda';

// Import application theme (not pure vendor but we want is to bundle in vendor)
import './style/app.scss';