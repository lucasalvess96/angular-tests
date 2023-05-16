import { HarnessLoader, parallel } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import {
    MatRowHarness,
    MatTableHarness,
} from '@angular/material/table/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HeroListComponent } from './hero-list.component';

describe('HeroListComponent', () => {
    let component: HeroListComponent;
    let fixture: ComponentFixture<HeroListComponent>;
    let loader: HarnessLoader;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [HeroListComponent],
            imports: [
                HttpClientModule,
                MatTableModule,
                MatSortModule,
                BrowserAnimationsModule,
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(HeroListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        loader = TestbedHarnessEnvironment.loader(fixture);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('dataSource sorting', () => {
        fixture.detectChanges();
        component.ngOnInit();
        const sort = component.dataSource.sort;
        expect(sort).toBeInstanceOf(MatSort);
    });

    it('should load harness for a table', async () => {
        const table = await loader.getAllHarnesses(MatTableHarness);
        expect(table.length).toBe(1);
    });

    it('should get the different kinds of rows in the table', async () => {
        const table = await loader.getHarness(MatTableHarness);
        const headerRows = await table.getHeaderRows();
        const rows = await table.getRows();
        expect(headerRows.length).toBe(1);
        expect(rows.length).toBe(9);
    });

    it('should get cells inside a row', async () => {
        const table = await loader.getHarness(MatTableHarness);
        const headerRows = await table.getHeaderRows();
        const rows = await table.getRows();

        const headerCells = (
            await parallel(() => headerRows.map((row) => row.getCells()))
        ).map((row) => row.length);

        const cells = (
            await parallel(() => rows.map((row) => row.getCells()))
        ).map((row) => row.length);

        expect(headerCells).toEqual([3]);
        expect(cells).toEqual([3, 3, 3, 3, 3, 3, 3, 3, 3]);
    });

    it('should be able to get the text of a cell', async () => {
        const table = await loader.getHarness(MatTableHarness);
        const secondRow = (await table.getRows())[1];
        const cells = await secondRow.getCells();
        const cellText = await parallel(() =>
            cells.map((cell) => cell.getText())
        );
        expect(cellText).toEqual(['2', 'json-server2', 'true']);
    });

    it('should be able to get the column name of a cell', async () => {
        const table: MatTableHarness = await loader.getHarness(MatTableHarness);
        const fifthRow: MatRowHarness = (await table.getRows())[1];
        const cells = await fifthRow.getCells();
        const cellColumnNames = await parallel(() =>
            cells.map((cell) => cell.getColumnName())
        );
        expect(cellColumnNames).toEqual(['id', 'name', 'active']);
    });

    it('should be able to filter cells by text', async () => {
        const table = await loader.getHarness(MatTableHarness);
        const firstRow = (await table.getRows())[0];
        const cells = await firstRow.getCells({ text: 'json-server' });
        const cellTexts = await parallel(() =>
            cells.map((cell) => cell.getText())
        );
        expect(cellTexts).toEqual(['json-server']);
    });

    it('should be able to filter cells by column name', async () => {
        const table = await loader.getHarness(MatTableHarness);
        const firstRow = (await table.getRows())[0];
        const cells = await firstRow.getCells({ columnName: 'name' });
        const cellTexts = await parallel(() =>
            cells.map((cell) => cell.getText())
        );
        expect(cellTexts).toEqual(['json-server']);
    });
});
