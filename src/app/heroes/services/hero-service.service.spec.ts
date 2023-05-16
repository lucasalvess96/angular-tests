import { HttpClient, HttpResponse } from '@angular/common/http';
import {
    HttpClientTestingModule,
    HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Heroes } from '../models/heroes';
import { HeroServiceService } from './hero-service.service';

describe('HeroesServiceService', () => {
    let httpClient: HttpClient;
    let httpTestingController: HttpTestingController;
    let heroService: HeroServiceService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [HeroServiceService],
        });

        httpTestingController = TestBed.inject(HttpTestingController);
        heroService = TestBed.inject(HeroServiceService);
    });

    afterEach(() => {
        httpTestingController.verify();
    });

    describe('#getHeroes', () => {
        let expectedHeroes: Heroes[];

        beforeEach(() => {
            heroService = TestBed.inject(HeroServiceService);

            expectedHeroes = [
                { id: 1, name: 'A' },
                { id: 2, name: 'B' },
            ] as Heroes[];
        });

        it('should return expected heroes', () => {
            heroService.getHeroes().subscribe({
                next: (heroes: Heroes[]) =>
                    expect(heroes)
                        .withContext('should return expected heroes')
                        .toBe(expectedHeroes),
                error: () => fail,
            });

            const req = httpTestingController.expectOne(heroService.baseUrl);
            expect(req.request.method).toEqual('GET');

            req.flush(expectedHeroes);
        });

        it('should be OK returning no heroes', () => {
            heroService.getHeroes().subscribe({
                next: (heroes: Heroes[]) =>
                    expect(heroes.length)
                        .withContext('should have empty heroes array')
                        .toEqual(0),
                error: () => fail,
            });

            const req = httpTestingController.expectOne(heroService.baseUrl);
            req.flush([]);
        });

        it('should return expected heroes (called multiple times)', () => {
            heroService.getHeroes().subscribe();
            heroService.getHeroes().subscribe();
            heroService.getHeroes().subscribe({
                next: (heroes: Heroes[]) =>
                    expect(heroes)
                        .withContext('should return expected heroes')
                        .toEqual(expectedHeroes),
                error: fail,
            });

            const requests = httpTestingController.match(heroService.baseUrl);
            expect(requests.length)
                .withContext('calls to getHeroes()')
                .toEqual(3);

            requests[0].flush([]);
            requests[1].flush([{ id: 1, name: 'bob' }]);
            requests[2].flush(expectedHeroes);
        });

        it('should turn 500 into a user-friendly error', () => {
            const msg: string = 'internal server error';
            const retryCount: number = 2;

            heroService.getHeroes().subscribe({
                next: () => fail('expected to fail'),
                error: (error) => expect(error.message).toContain(msg),
            });

            for (var i = 0, c = retryCount + 1; i < c; i++) {
                const req = httpTestingController.expectOne(
                    heroService.baseUrl
                );
                expect(req.request.method).toEqual('GET');
                req.flush(msg, {
                    status: 500,
                    statusText: 'internal server error',
                });
            }
        });

        it('should turn network error into user-facing error in a list of the heroes', (done: DoneFn) => {
            const errorEvent = new ProgressEvent('error');
            const retryCount: number = 2;

            heroService.getHeroes().subscribe({
                next: () => fail('expected to fail'),
                error: (error) => {
                    expect(error).toBe(errorEvent);
                    done();
                },
            });

            for (var i = 0, c = retryCount + 1; i < c; i++) {
                const req = httpTestingController.expectOne(
                    heroService.baseUrl
                );
                req.error(errorEvent);
            }
        });
    });

    describe('#getHero', () => {
        it('should return a hero by id', () => {
            const getHeroId: Heroes = { id: 1, name: 'AB', active: true };
            const retryCount: number = 2;

            heroService.getHero(getHeroId).subscribe({
                next: (hero: Heroes) =>
                    expect(hero)
                        .withContext('fail get hero by id')
                        .toBe(getHeroId),
                error: () => fail,
            });

            for (var i = 0, c = retryCount + 1; i < c; i++) {
                const req = httpTestingController.expectOne(
                    `${heroService.baseUrl}/?id=${getHeroId.id}`
                );
                expect(req.request.method).toEqual('GET');
                req.flush(getHeroId);
            }
        });

        it('shoudl return id not found', () => {
            const getHeroId: Heroes = { id: 1, name: 'AB', active: true };
            const msg: string = 'Not found';
            const retryCount: number = 2;

            heroService.getHero(getHeroId).subscribe({
                next: () => fail('expected to fail'),
                error: (error) => expect(error.message).toContain(msg),
            });

            for (var i = 0, c = retryCount + 1; i < c; i++) {
                const req = httpTestingController.expectOne(
                    `${heroService.baseUrl}/?id=${getHeroId.id}`
                );
                expect(req.request.method).toEqual('GET');
                req.flush(msg, { status: 404, statusText: 'Not found' });
            }
        });

        it('should turn 500 into a friendly error if fetch by id fails', (done: DoneFn) => {
            const getHeroId: Heroes = { id: 1, name: 'AB', active: true };
            const msg: string = '500 internal server error';
            const retryCount: number = 2;

            heroService.getHero(getHeroId).subscribe({
                next: () => fail('expected to fail'),
                error: (error) => {
                    expect(error.message).toContain(msg);
                    done();
                },
            });

            for (var i = 0, c = retryCount + 1; i < c; i++) {
                const req = httpTestingController.expectOne(
                    `${heroService.baseUrl}/?id=${getHeroId.id}`
                );
                expect(req.request.method).toEqual('GET');
                req.flush(msg, {
                    status: 500,
                    statusText: 'internal server error',
                });
            }
        });

        it('should turn network error into user facing error when fetching an id', (done: DoneFn) => {
            const getHeroId: Heroes = { id: 1, name: 'AB', active: true };
            const errorEvent = new ProgressEvent('error');
            const retryCount: number = 2;

            heroService.getHero(getHeroId).subscribe({
                next: () => fail('expected to fail'),
                error: (error) => {
                    expect(error).toBe(errorEvent);
                    done();
                },
            });

            for (var i = 0, c = retryCount + 1; i < c; i++) {
                const req = httpTestingController.expectOne(
                    `${heroService.baseUrl}/?id=${getHeroId.id}`
                );
                expect(req.request.method).toEqual('GET');
                req.error(errorEvent);
            }
        });
    });

    describe('#addHero', () => {
        it('should create a hero', () => {
            const addHeroes: Heroes = { id: 1, name: 'AB', active: true };

            heroService.addHero(addHeroes).subscribe({
                next: (data) =>
                    expect(data)
                        .withContext('should return the hero')
                        .toEqual(addHeroes),
                error: fail,
            });

            const req = httpTestingController.expectOne(heroService.baseUrl);
            expect(req.request.method).toEqual('POST');
            expect(req.request.body).toEqual(addHeroes);

            const expectedResponse = new HttpResponse({
                status: 200,
                statusText: 'OK',
                body: addHeroes,
            });
            req.event(expectedResponse);
        });

        it('should turn 404 error into user-facing error in addHero', () => {
            const msg: string = '404 Not Found';
            const addHeroes: Heroes = { id: 1, name: 'AB', active: true };
            const retryCount: number = 2;

            heroService.addHero(addHeroes).subscribe({
                next: () => fail('expected to fail'),
                error: (error) => expect(error.message).toContain(msg),
            });

            for (var i = 0, c = retryCount + 1; i < c; i++) {
                const req = httpTestingController.expectOne(
                    heroService.baseUrl
                );
                req.flush(msg, { status: 404, statusText: 'Not Found' });
            }
        });

        it('should turn network error into user-facing error in method post', (done: DoneFn) => {
            const errorEvent = new ProgressEvent('error');
            const addHeroes: Heroes = { id: 1, name: 'AB', active: true };
            const retryCount: number = 2;

            heroService.addHero(addHeroes).subscribe({
                next: () => fail('expected to fail'),
                error: (error: any) => {
                    expect(error).toEqual(errorEvent);
                    done();
                },
            });

            for (var i = 0, c = retryCount + 1; i < c; i++) {
                const req = httpTestingController.expectOne(
                    heroService.baseUrl
                );
                req.error(errorEvent);
            }
        });

        it('should return expected heroes called multiple times ind addHero', () => {
            const addHeroes: Heroes = { id: 1, name: 'AB', active: true };

            heroService.addHero(addHeroes).subscribe();
            heroService.addHero(addHeroes).subscribe();
            heroService.addHero(addHeroes).subscribe({
                next: (heroes: Heroes) =>
                    expect(heroes)
                        .withContext('should return expected heroes')
                        .toEqual(addHeroes),
                error: fail,
            });

            const requests = httpTestingController.match(heroService.baseUrl);
            expect(requests.length)
                .withContext('calls to getHeroes()')
                .toEqual(3);

            requests[0].flush([{ id: 0, name: 'bobAB' }]);
            requests[1].flush([{ id: 1, name: 'bob' }]);
            requests[2].flush(addHeroes);
        });
    });

    describe('#updateHero', () => {
        const makeUrl = (id: number) => `${heroService.baseUrl}/?id=${id}`;

        it('should update a hero and return it', () => {
            const updateHero: Heroes = { id: 1, name: 'A', active: false };

            heroService.updateHero(updateHero).subscribe({
                next: (data) =>
                    expect(data)
                        .withContext('should return the hero')
                        .toEqual(updateHero),
                error: fail,
            });

            const req = httpTestingController.expectOne(heroService.baseUrl);
            expect(req.request.method).toEqual('PUT');
            expect(req.request.body).toEqual(updateHero);

            const expectedResponse = new HttpResponse({
                status: 200,
                statusText: 'OK',
                body: updateHero,
            });
            req.event(expectedResponse);
        });

        it('should turn 404 error into user-facing error', () => {
            const msg: string = '404 Not Found';
            const updateHero: Heroes = { id: 1, name: 'A', active: false };
            const retryCount: number = 2;

            heroService.updateHero(updateHero).subscribe({
                next: () => fail('expected to fail'),
                error: (error) => expect(error.message).toContain(msg),
            });

            for (var i = 0, c = retryCount + 1; i < c; i++) {
                const req = httpTestingController.expectOne(
                    heroService.baseUrl
                );
                req.flush(msg, { status: 404, statusText: 'Not Found' });
            }
        });

        it('should turn network error into user-facing error in method put', (done) => {
            const errorEvent = new ProgressEvent('error');
            const updateHero: Heroes = { id: 1, name: 'A', active: true };
            const retryCount: number = 2;

            heroService.updateHero(updateHero).subscribe({
                next: () => fail('expected to fail'),
                error: (error) => {
                    expect(error).toEqual(errorEvent);
                    done();
                },
            });

            for (var i = 0, c = retryCount + 1; i < c; i++) {
                const req = httpTestingController.expectOne(
                    heroService.baseUrl
                );
                req.error(errorEvent);
            }
        });

        it('should return expected heroes called multiple times ind updateHero', () => {
            const updateHero: Heroes = { id: 1, name: 'A', active: true };

            heroService.addHero(updateHero).subscribe();
            heroService.addHero(updateHero).subscribe();
            heroService.addHero(updateHero).subscribe({
                next: (heroes: Heroes) =>
                    expect(heroes)
                        .withContext('should return expected heroes')
                        .toEqual(updateHero),
                error: () => fail,
            });

            const requests = httpTestingController.match(heroService.baseUrl);
            expect(requests.length)
                .withContext('calls to getHeroes()')
                .toEqual(3);

            requests[0].flush([{ id: 0, name: 'bobAB' }]);
            requests[1].flush([{ id: 1, name: 'bob' }]);
            requests[2].flush(updateHero);
        });
    });

    describe('#searchHero', () => {
        it('should return a search of the hero', () => {
            const search: string = 'AB';

            heroService.searchHero(search).subscribe({
                next: (data) =>
                    expect(data)
                        .withContext('should return a search')
                        .toEqual(data),
                error: () => fail,
            });

            const req = httpTestingController.expectOne(
                `${heroService.baseUrl}?name=${search}`
            );
            expect(req.request.method).toEqual('GET');

            const expectedResponse = new HttpResponse({
                status: 200,
                statusText: 'OK',
                body: search,
            });
            req.event(expectedResponse);
        });

        it('shoudl return hero not found', () => {
            const search: string = 'AB';
            const msg: string = 'Not found';
            const retryCount: number = 2;

            heroService.searchHero(search).subscribe({
                next: () => fail('expected to fail'),
                error: (error) => expect(error.message).toContain(msg),
            });

            for (var i = 0, c = retryCount + 1; i < c; i++) {
                const req = httpTestingController.expectOne(
                    `${heroService.baseUrl}?name=${search}`
                );
                expect(req.request.method).toEqual('GET');
                req.flush(msg, { status: 404, statusText: 'Not found' });
            }
        });

        it('should turn 500 into a friendly error if fetch by id fails', (done: DoneFn) => {
            const search: string = 'AB';
            const msg: string = '500 internal server error';
            const retryCount: number = 2;

            heroService.searchHero(search).subscribe({
                next: () => fail('expected to fail'),
                error: (error) => {
                    expect(error.message).toContain(msg);
                    done();
                },
            });

            for (var i = 0, c = retryCount + 1; i < c; i++) {
                const req = httpTestingController.expectOne(
                    `${heroService.baseUrl}?name=${search}`
                );
                expect(req.request.method).toEqual('GET');
                req.flush(msg, {
                    status: 500,
                    statusText: 'internal server error',
                });
            }
        });

        it('should turn network error into user facing error when fetching an id', (done: DoneFn) => {
            const search: string = 'AB';
            const errorEvent: ProgressEvent<EventTarget> = new ProgressEvent(
                'error'
            );
            const retryCount: number = 2;

            heroService.searchHero(search).subscribe({
                next: () => fail('expected to fail'),
                error: (error) => {
                    expect(error).toBe(errorEvent);
                    done();
                },
            });

            for (var i = 0, c = retryCount + 1; i < c; i++) {
                const req = httpTestingController.expectOne(
                    `${heroService.baseUrl}?name=${search}`
                );
                expect(req.request.method).toEqual('GET');
                req.error(errorEvent);
            }
        });
    });

    describe('#deleteHero', () => {
        it('should delete a hero', () => {
            const getHeroId: Heroes = { id: 1, name: 'AB', active: true };

            heroService.deleteHero(getHeroId).subscribe({
                next: (hero) =>
                    expect(hero)
                        .withContext('fail get hero by id')
                        .toBe(getHeroId),
                error: () => fail,
            });

            const req = httpTestingController.expectOne(
                `${heroService.baseUrl}/id=${getHeroId.id}`
            );
            expect(req.request.method).toEqual('DELETE');
            req.flush(getHeroId);
        });

        it('should return 404 id not fould in delete hero', () => {
            const getHeroId: Heroes = { id: 1, name: 'AB', active: true };
            const msg: string = 'Not found';
            const retryCount: number = 2;

            heroService.deleteHero(getHeroId).subscribe({
                next: () => fail('expected to fail'),
                error: (error) => expect(error.message).toContain(msg),
            });

            for (var i = 0, c = retryCount + 1; i < c; i++) {
                const req = httpTestingController.expectOne(
                    `${heroService.baseUrl}/id=${getHeroId.id}`
                );
                expect(req.request.method).toEqual('DELETE');
                req.flush(msg, { status: 404, statusText: 'Not found' });
            }
        });

        it('should turn 500 into a friendly error if fetch by id fails in delete HERO', (done: DoneFn) => {
            const getHeroId: Heroes = { id: 1, name: 'AB', active: true };
            const msg: string = '500 internal server error';
            const retryCount: number = 2;

            heroService.deleteHero(getHeroId).subscribe({
                next: () => fail('expected to fail'),
                error: (error) => {
                    expect(error.message).toContain(msg);
                    done();
                },
            });

            for (var i = 0, c = retryCount + 1; i < c; i++) {
                const req = httpTestingController.expectOne(
                    `${heroService.baseUrl}/id=${getHeroId.id}`
                );
                expect(req.request.method).toEqual('DELETE');
                req.flush(msg, {
                    status: 500,
                    statusText: 'internal server error',
                });
            }
        });

        it('should turn network error into user facing error when fetching an id', (done: DoneFn) => {
            const getHeroId: Heroes = { id: 1, name: 'AB', active: true };
            const errorEvent = new ProgressEvent('error');
            const retryCount: number = 2;

            heroService.deleteHero(getHeroId).subscribe({
                next: () => fail('expected to fail'),
                error: (error) => {
                    expect(error).toBe(errorEvent);
                    done();
                },
            });

            for (var i = 0, c = retryCount + 1; i < c; i++) {
                const req = httpTestingController.expectOne(
                    `${heroService.baseUrl}/id=${getHeroId.id}`
                );
                expect(req.request.method).toEqual('DELETE');
                req.error(errorEvent);
            }
        });
    });
});
