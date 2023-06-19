import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, retry, throwError } from 'rxjs';
import { Ibge } from '../models/ibge';

@Injectable({
    providedIn: 'root',
})
export class IbgeService {
    constructor(private http: HttpClient) {}

    listUf(): Observable<Ibge[]> {
        return this.http
            .get<Ibge[]>(
                'https://servicodados.ibge.gov.br/api/v1/localidades/estados'
            )
            .pipe(
                retry(2),
                catchError((erro: HttpErrorResponse) => this.handleErro(erro))
            );
    }

    listCidades(estados: string): Observable<Ibge[]> {
        return this.http
            .get<Ibge[]>(
                `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estados}/municipios`
            )
            .pipe(
                retry(2),
                catchError((erro: HttpErrorResponse) => this.handleErro(erro))
            );
    }

    private handleErro(erro: HttpErrorResponse) {
        if (erro.status === 0) {
            alert(`verifique a conexão com da sua internet`);
        } else {
            alert(`O back-end retornou o código ${erro.error}`);
        }

        if (erro.error instanceof Event) {
            throw erro.error;
        }

        return throwError(() => new Error(erro.error));
    }
}
