import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';

const cachePersistenceKey = 'httpCache';

export interface HttpcacheEntry {
  lastUpdated: Date;
  data: HttpResponse<any>;
}

/**
 * Provides a cache facility for HTTP request with configurable persistence policy.
 */
@Injectable({
  providedIn: 'root'
})
export class HttpCacheService {
  private cacheData: { [key: string]: HttpcacheEntry } = {};
  private storage: Storage | null = null;

  constructor() {
    this.loadCacheData();
  }

  /**
   * Sets the cache data for the specified request.
   * @param url The request URL.
   * @param data The received data.
   * @param lastUpdated The cache last update, current date is used if not specified.
   */
  setCachedData(url: string, data: HttpResponse<any>, lastUpdated?: Date): void {
    this.cacheData[url] = {
      data,
      lastUpdated: lastUpdated || new Date()
    };
    this.saveCacheData();
  }

  /**
   * Sets the cache data for the specified request.
   * @param url The request URL.
   * @return The cached data or null if no cached data exists for this request.
   */
  getCachedData(url: string): HttpResponse<any> | null {
    const cahedEntry = this.cacheData[url];

    if (cahedEntry) {
      return cahedEntry.data;
    }

    return null;
  }

  /**
   * Gets the cache entry for the specified request.
   * @param url The request URL.
   * @return the cache entry or null if no cached data exists for this request.
   */
  getCacheEntry(url: string): HttpcacheEntry | null {
    return this.cacheData[url] || null;
  }

  /**
   * Clears the cache entry (if exists) for the specified request.
   * @param url The request URL.
   */
  clearCache(url: string): void {
    delete this.cacheData[url];
    this.saveCacheData();
  }

  /**
   * Cleans cache entries older than the specified date.
   * @param expirationDate The cache expiration date. If no date is specified, all cache entries are removed.
   */
  cleanCache(expirationDate?: Date): void {
    if (expirationDate) {
      Object.entries(this.cacheData).forEach(([key, value]) => {
        if (expirationDate >= value.lastUpdated) {
          delete this.cacheData[key];
        }
      });
    } else {
      this.cacheData = {};
    }
    this.saveCacheData();
  }

  /**
   * Sets the cache persistence policy.
   * Note that changing the persistence will also clear the cache from its previous storage.
   * @param persistence How the cache should be persisted, it can be either local or session storage, or if no value is
   * provided it will be only in-memory (default).
   */
  setPersistence(persistence: 'local' | 'session' | null): void {
    this.cleanCache();
    this.storage = persistence === 'local' ? window.localStorage : persistence === 'session' ? window.sessionStorage : null;
    this.loadCacheData();
  }

  private saveCacheData(): void {
    if (this.storage) {
      this.storage.setItem(cachePersistenceKey, JSON.stringify(this.cacheData || null));
    }
  }

  private loadCacheData(): void {
    const data = this.storage ? this.storage.getItem(cachePersistenceKey) : null;
    this.cacheData = data ? JSON.parse(data) : {};
  }
}