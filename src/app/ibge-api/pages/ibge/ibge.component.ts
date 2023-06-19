import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Ibge } from '../../models/ibge';
import { IbgeService } from '../../services/ibge.service';

@Component({
    selector: 'app-ibge',
    templateUrl: './ibge.component.html',
    styleUrls: ['./ibge.component.css'],
})
export class IbgeComponent implements OnInit {
    formGroup!: FormGroup;

    ufs?: Ibge[];
    citys?: Ibge[];

    constructor(
        private ibgeService: IbgeService,
        private formBuilder: FormBuilder
    ) {}

    ngOnInit(): void {
        this.formGroup = this.formBuilder?.group({
            uf: ['', Validators.required],
            city: ['', Validators.required],
        });

        this.IbgeUf();
    }

    IbgeUf(): void {
        this.ibgeService.listUf().subscribe({
            next: (response: Ibge[]) => {
                this.ufs = response;
            },
            error: (erro: HttpErrorResponse) => console.log(erro.error),
        });
    }

    IbgeCity(city: any): void {
        this.ibgeService.listCidades(city).subscribe({
            next: (response: Ibge[]) => {
                this.citys = response;
            },
            error: (erro: HttpErrorResponse) => console.log(erro.error),
        });
    }
}
