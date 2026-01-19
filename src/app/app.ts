import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { setTheme } from 'ngx-bootstrap/utils';

import { NgHttpLoaderComponent, Spinkit } from 'ng-http-loader';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgHttpLoaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly spinkit = Spinkit;
  protected readonly title = signal('lims');

  constructor() {
    setTheme('bs5'); // or 'bs4'
  }
}
