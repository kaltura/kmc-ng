/* tslint:disable:no-unused-variable */

import { By }           from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import {
  beforeEach, beforeEachProviders,
  describe, xdescribe,
  expect, it, xit,
  async, inject
} from '@angular/core/testing';

import { ContentComponent } from './content.component';

describe('Component: Entries', () => {
  it('should create an instance', () => {
    let component = new ContentComponent();
    expect(component).toBeTruthy();
  });
});
