import {
    HttpClient,
    HttpErrorResponse,
    HttpHeaders,
    HttpParams,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, retry, throwError } from 'rxjs';
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
    baseUrl: string = `${environment.baseUrl}/heroes`;

    constructor(private http: HttpClient) {}

    getHeroes(): Observable<Heroes[]> {
        return this.http.get<Heroes[]>(this.baseUrl).pipe(
            retry(2),
            catchError((erro: HttpErrorResponse) => this.handleError(erro))
        );
    }

    getHero(id: Heroes): Observable<Heroes> {
        const url = `${this.baseUrl}/?id=${id.id}`;

        return this.http.get<Heroes[]>(url).pipe(
            map((hero: Heroes[]) => hero.find((hero) => hero.id === +id)!),
            retry(2),
            catchError((erro: HttpErrorResponse) => this.handleError(erro))
        );
    }

    addHero(hero: Heroes): Observable<Heroes> {
        return this.http.post<Heroes>(this.baseUrl, hero, httpOpotions).pipe(
            retry(2),
            catchError((erro: HttpErrorResponse) => this.handleError(erro))
        );
    }

    updateHero(hero: Heroes): Observable<Heroes> {
        httpOpotions.headers = httpOpotions.headers.set(
            'authorization',
            'my-auth-token'
        );

        return this.http.put<Heroes>(this.baseUrl, hero, httpOpotions).pipe(
            retry(2),
            catchError((erro: HttpErrorResponse) => this.handleError(erro))
        );
    }

    searchHero(search: string): Observable<Heroes[]> {
        const options = search
            ? { params: new HttpParams().set('name', search) }
            : {};

        search = search.trim();

        if (!search.trim()) {
            return of([]);
        }

        return this.http.get<Heroes[]>(this.baseUrl, options).pipe(
            retry(2),
            catchError((erro: HttpErrorResponse) => this.handleError(erro))
        );
    }

    deleteHero(id: Heroes): Observable<unknown> {
        const deleteHeroId = `${this.baseUrl}/id=${id.id}`;

        return this.http.delete<Heroes>(deleteHeroId, httpOpotions).pipe(
            retry(2),
            catchError((erro: HttpErrorResponse) => this.handleError(erro))
        );
    }

    private handleError(erro: HttpErrorResponse) {
        if (erro.status === 0) {
            console.error(`verifique a conexão com da sua internet`);
        } else {
            console.error(`O back-end retornou o código ${erro.message}`);
        }

        if (erro.error instanceof Event) {
            throw erro.error;
        }

        return throwError(() => new Error(erro.message));
    }
}
