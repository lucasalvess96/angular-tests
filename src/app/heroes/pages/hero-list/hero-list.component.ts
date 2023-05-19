import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { MatPaginator } from '@angular/material/paginator';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subject, takeUntil } from 'rxjs';
import { Heroes } from '../../models/heroes';
import { HeroServiceService } from '../../services/hero-service.service';

@Component({
    selector: 'app-hero-list',
    templateUrl: './hero-list.component.html',
    styleUrls: ['./hero-list.component.css'],
})
export class HeroListComponent implements OnInit, OnDestroy {
    dataSource!: MatTableDataSource<Heroes>;

    displayedColumns: string[] = ['id', 'name', 'active'];

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(private heroServiceService: HeroServiceService) {}

    loading: boolean = false;

    color: ThemePalette = 'primary';
    mode: ProgressSpinnerMode = 'indeterminate';
    value: number = 50;

    unsubscribe = new Subject<void>();

    ngOnInit(): void {
        this.list();
    }

    list(): void {
        this.loading = true;
        this.heroServiceService
            .getHeroes()
            .pipe(takeUntil(this.unsubscribe))
            .subscribe({
                next: (heroes: Heroes[]) => {
                    this.loading = false;
                    this.dataSource = new MatTableDataSource(heroes);
                    this.dataSource.paginator = this.paginator;
                    this.dataSource.sort = this.sort;
                },
                error: (error: HttpErrorResponse) => window.alert(error.name),
            });
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();

        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }

    ngOnDestroy(): void {
        this.unsubscribe.next();
        this.unsubscribe.complete();
    }
}
