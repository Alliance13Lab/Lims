import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, Subscriber } from 'rxjs';

import { HttpCacheService } from './http-cache.service';

/**
 * Caches HTTP requests.
 * Use ExtendedHttpClient fluent API to configure caching for each request.
 */
@Injectable({
  providedIn: 'root'
})
export class CacheInterceptor implements HttpInterceptor {
  private forceUpdate = false;
  private expireAfterMinutes: number = 0;

  constructor(private httpCacheService: HttpCacheService) { }

  /**
   * Configures interceptor options
   * @param options If update option is enabled, forces request to be made and updates cache entry.
   * @return The configured instance.
   */
  configure(options: { update?: boolean; expireAfterMinutes?: number } | null): CacheInterceptor {
    const instance = new CacheInterceptor(this.httpCacheService);
    if (options) {
      if (options.update) {
        instance.forceUpdate = true;
      }
      if (options?.expireAfterMinutes) {
        instance.expireAfterMinutes = options.expireAfterMinutes;
      }
    }
    return instance;
  }

  intercept(request: HttpRequest<any>, _next: HttpHandler): Observable<HttpEvent<any>> {
    if (request.method !== 'GET') {
      return _next.handle(request);
    }

    return new Observable((subscriber: Subscriber<HttpEvent<any>>) => {
      let cachedData: any = this.forceUpdate ? null : this.httpCacheService.getCachedData(request.urlWithParams);

      if (cachedData != null) {
        const currentTime = new Date();
        const lastUpdated = new Date(cachedData.lastUpdated)
        lastUpdated.setMinutes(lastUpdated.getMinutes() + this.expireAfterMinutes);
        cachedData = lastUpdated > currentTime ? cachedData : null;
      }

      if (cachedData) {
        subscriber.next(new HttpResponse(cachedData as object));
        subscriber.complete();
      } else {
        _next.handle(request).subscribe({
          next: (event: HttpEvent<any>) => {
            if (event instanceof HttpResponse) {
              this.httpCacheService.setCachedData(request.urlWithParams, event);
            }
            subscriber.next(event);
          },
          error: (err) => subscriber.error(err),
          complete: () => subscriber.complete()
        });
      }
    });
  }
}