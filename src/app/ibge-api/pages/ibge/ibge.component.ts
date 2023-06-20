import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { IbgeCitys, IbgeUf } from '../../models/ibge';
import { IbgeService } from '../../services/ibge.service';

@Component({
    selector: 'app-ibge',
    templateUrl: './ibge.component.html',
    styleUrls: ['./ibge.component.css']
})
export class IbgeComponent implements OnInit, OnDestroy {
    formGroup!: FormGroup;

    ufs?: IbgeUf[];
    citys?: IbgeCitys[];

    unsubscribe: Subject<void> = new Subject<void>();

    constructor(private ibgeService: IbgeService, private formBuilder: FormBuilder) {}

    ngOnInit(): void {
        this.formGroup = this.formBuilder?.group({
            uf: ['', Validators.required],
            city: ['', Validators.required]
        });

        this.IbgeUf();
    }

    IbgeUf(): void {
        this.ibgeService
            .listIbgeUf()
            .pipe(takeUntil(this.unsubscribe))
            .subscribe({
                next: (response: IbgeUf[]) => {
                    this.ufs = response;
                },
                error: (erro: HttpErrorResponse) => console.log(erro.error)
            });
    }

    IbgeCity(city: IbgeCitys): void {
        this.ibgeService
            .listIbgeCitys(city)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe({
                next: (response: IbgeCitys[]) => {
                    this.citys = response;
                },
                error: (erro: HttpErrorResponse) => console.log(erro.error)
            });
    }

    formsSave(): void {
        if (this.formGroup.valid) {
            const values = this.formGroup.value;
            console.log(values);
        }
    }

    ngOnDestroy(): void {
        this.unsubscribe.next();
        this.unsubscribe.complete();
    }
}
