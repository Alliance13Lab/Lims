import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { TokenInterceptor } from './@shared/http/token-interceptor';
import { HttpService } from './@shared/http/http.service';

import { routes } from './app.routes';

import { BsModalService } from 'ngx-bootstrap/modal';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    { provide: HttpClient, useClass: HttpService },
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
    BsModalService,
    TitleCasePipe,
    DatePipe
  ],
};
