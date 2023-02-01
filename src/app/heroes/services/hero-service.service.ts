import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, retry, throwError } from 'rxjs';
import { Heroes } from '../models/heroes';
import { environment } from './../../../environments/environment';

const httpOpotions = {
  headers: new HttpHeaders({
    'Content-type': 'application/json',
    Authorization: 'my-auth-token',
  }),
};

@Injectable({
  providedIn: 'root',
})
export class HeroServiceService {
  private baseUrl: string = `${environment.baseUrl}/heroes`;

  constructor(private http: HttpClient) {}

  getHeroes(): Observable<Heroes[]> {
    return this.http
      .get<Heroes[]>(this.baseUrl)
      .pipe(retry(2), catchError(this.ConfigErrorApi));
  }

  getHero(id: Heroes): Observable<Heroes> {
    return this.getHeroes().pipe(
      map((hero: Heroes[]) => hero.find((hero) => hero.id === +id)!),
      retry(2),
      catchError(this.ConfigErrorApi)
    );
  }

  addHero(hero: Heroes): Observable<Heroes> {
    return this.http
      .post<Heroes>(this.baseUrl, hero, httpOpotions)
      .pipe(retry(2), catchError(this.ConfigErrorApi));
  }

  updateHero(hero: Heroes): Observable<Heroes> {
    httpOpotions.headers = httpOpotions.headers.set(
      'authorization',
      'my-auth-token'
    );
    return this.http
      .put<Heroes>(this.baseUrl, hero, httpOpotions)
      .pipe(retry(2), catchError(this.ConfigErrorApi));
  }

  searchHero(search: string): Observable<Heroes[]> {
    search = search.trim();
    const options = search
      ? { params: new HttpParams().set('name', search) }
      : {};
    return this.http
      .get<Heroes[]>(this.baseUrl, options)
      .pipe(retry(2), catchError(this.ConfigErrorApi));
  }

  deleteHero(id: Heroes): Observable<unknown> {
    const deleteHeroId = `${this.baseUrl}/${id.id}`;
    return this.http
      .delete<Heroes>(deleteHeroId, httpOpotions)
      .pipe(retry(2), catchError(this.ConfigErrorApi));
  }

  private ConfigErrorApi(erro: HttpErrorResponse) {
    if (erro.status === 0) {
      console.error(`Algum erro ocorreu ${erro.error}`);
    } else {
      console.error(
        `O back-end retornou o código ${erro.status}, o corpo era: ${erro.error}`
      );
    }
    return throwError(
      () => new Error('Algo de ruím acontenceu tente novamente mais tarde.')
    );
  }
}
