import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpResponse,
} from '@angular/common/http';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { fakeAsync, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { HeroServiceService } from './hero-service.service';

interface Heroes {
  id: number;
  name: string;
  active: boolean;
}

const testBaseUrl: string = '/heroes';

// TEST WITH HttpClientTestingModule
describe('HeroServiceService whit HttpClientTestingModule', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('can test HttpClient.getHeroes', () => {
    const testHero: Heroes = {
      id: 1,
      name: 'test hero',
      active: true,
    };
    httpClient
      .get<Heroes>(testBaseUrl)
      .subscribe((hero) => expect(hero).toBe(testHero));

    const req = httpTestingController.expectOne('/heroes');
    expect(req.request.method).toEqual('GET');
    req.flush(testHero);
    httpTestingController.verify();
  });

  it('can test HttpClient.get with matching header', () => {
    const testHero: Heroes = {
      id: 1,
      name: 'test hero',
      active: true,
    };
    httpClient
      .get<Heroes>(testBaseUrl, {
        headers: new HttpHeaders({ Authorization: 'my-auth-token' }),
      })
      .subscribe((hero) => expect(hero).toBe(testHero));
    const req = httpTestingController.expectOne((request) =>
      request.headers.has('Authorization')
    );
    req.flush(testHero);
  });

  it('can test multiple requests', () => {
    const testHero: Heroes[] = [
      {
        id: 1,
        name: 'json-server',
        active: true,
      },
    ];
    httpClient
      .get<Heroes[]>(testBaseUrl)
      .subscribe((hero) =>
        expect(hero.length).withContext('should have no data').toEqual(0)
      );

    httpClient
      .get<Heroes[]>(testBaseUrl)
      .subscribe((hero) =>
        expect(hero)
          .withContext('should be one element array')
          .toEqual([testHero[0]])
      );

    httpClient
      .get<Heroes[]>(testBaseUrl)
      .subscribe((hero) =>
        expect(hero).withContext('should be expected data').toEqual(testHero)
      );
    const requests = httpTestingController.match(testBaseUrl);
    expect(requests.length).toEqual(3);
    requests[0].flush([]);
    requests[1].flush([testHero[0]]);
    requests[2].flush(testHero);
  });

  it('can test for 404 error', () => {
    const emsg = 'deliberate 404 error';

    httpClient.get<Heroes[]>(testBaseUrl).subscribe({
      next: () => fail('should have failed with the 404 error'),
      error: (error: HttpErrorResponse) => {
        expect(error.status).withContext('status').toEqual(404);
        expect(error.error).withContext('message').toEqual(emsg);
      },
    });
    const req = httpTestingController.expectOne(testBaseUrl);
    req.flush(emsg, { status: 404, statusText: 'Not Found' });
  });

  it('can test for network error', (done) => {
    const errorEvent = new ProgressEvent('error');

    httpClient.get<Heroes[]>(testBaseUrl).subscribe({
      next: () => fail('should have failed with the network error'),
      error: (error: HttpErrorResponse) => {
        expect(error.error).toBe(errorEvent);
        done();
      },
    });
    const req = httpTestingController.expectOne(testBaseUrl);
    req.error(errorEvent);
  });

  it('httpTestingController.verify should fail if HTTP response not simulated', () => {
    httpClient.get('some/api').subscribe();
    expect(() => httpTestingController.verify()).toThrow();
    const req = httpTestingController.expectOne('some/api');
    req.flush(null);
  });
});

// TEST WITH SPY
describe('HeroServiceService with spy', () => {
  let httpClientSpy: jasmine.SpyObj<HttpClient>;
  let service: HeroServiceService;

  beforeEach(() => {
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);
    service = new HeroServiceService(httpClientSpy);
  });

  it('should be created with spy', () => {
    expect(service).toBeTruthy();
  });

  it('getValue should return real value', () => {
    const expectedHeroes: Heroes[] = [
      {
        id: 1,
        name: 'json-server',
        active: true,
      },
    ];
    httpClientSpy.get.and.returnValue(of(expectedHeroes));
    service.getHeroes().subscribe((value) => {
      expect(value).toBe(expectedHeroes);
    });
  });

  it('should return expected heroes (HttpClient called once) with spy', (done: DoneFn) => {
    const expectedHeroes: Heroes[] = [
      {
        id: 1,
        name: 'lucas',
        active: true,
      },
    ];
    httpClientSpy.get.and.returnValue(of(expectedHeroes));
    service.getHeroes().subscribe({
      next: (heroes) => {
        expect(heroes).withContext('expected heroes').toBe(expectedHeroes);
        done();
      },
      error: done.fail,
    });
    expect(httpClientSpy.get.calls.count()).withContext('one call').toBe(1);
  });

  it('getHeroes should return value from observable with spy', (done: DoneFn) => {
    const expectedHeroes: Heroes[] = [
      {
        id: 1,
        name: 'lucas',
        active: true,
      },
    ];
    httpClientSpy.get.and.returnValue(of(expectedHeroes));
    service.getHeroes().subscribe((value) => {
      expect(value).toBe(expectedHeroes);
      done();
    });
  });

  it('should allow the use of fakeAsync', fakeAsync(() => {
    let value: any;
    let expectedHeroes: Heroes[] = [
      {
        id: 1,
        name: 'lucas',
        active: true,
      },
    ];
    httpClientSpy.get.and.returnValue(of(expectedHeroes));
    service.getHeroes().subscribe((val: any) => (value = val));
    expect(value).toEqual(expectedHeroes);
  }));
});

describe('HeroServiceService (with mocks)', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let heroServiceService: HeroServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [HeroServiceService],
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    heroServiceService = TestBed.inject(HeroServiceService);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  describe('#GetHeroes', () => {
    let expectedHeroes: Heroes[];

    beforeEach(() => {
      heroServiceService = TestBed.inject(HeroServiceService);

      expectedHeroes = [{ id: 1, name: 'json-server', active: true }];
    });

    it('should return expected heroes (called once)', () => {
      heroServiceService.getHeroes().subscribe({
        next: (heroes: Heroes[]) =>
          expect(heroes)
            .withContext('should return expected heroes')
            .toEqual(expectedHeroes),
        error: () => fail,
      });

      const req = httpTestingController.expectOne(heroServiceService.baseUrl);
      expect(req.request.method).toEqual('GET');

      req.flush(expectedHeroes);
    });

    it('should be OK returning no heroes', () => {
      heroServiceService.getHeroes().subscribe({
        next: (hero: Heroes[]) =>
          expect(hero.length)
            .withContext('should have empty heroes array')
            .toBe(0),
        error: () => fail,
      });

      const req = httpTestingController.expectOne(heroServiceService.baseUrl);

      req.flush([]);
    });

    it('should turn 404 into a user-friendly error', () => {
      const emsg = 'deliberate 404 error';

      httpClient.get<Heroes[]>(testBaseUrl).subscribe({
        next: () => fail('should have failed with the 404 error'),
        error: (error: HttpErrorResponse) => {
          expect(error.status).withContext('status').toEqual(404);
          expect(error.error).withContext('message').toEqual(emsg);
        },
      });

      const req = httpTestingController.expectOne(testBaseUrl);

      req.flush(emsg, { status: 404, statusText: 'Not Found' });
    });

    it('should return expected heroes (called multiple times)', () => {
      const testHero: Heroes[] = [
        {
          id: 1,
          name: 'json-server',
          active: true,
        },
      ];
      httpClient
        .get<Heroes[]>(testBaseUrl)
        .subscribe((hero: Heroes[]) =>
          expect(hero.length).withContext('should have no data').toEqual(0)
        );

      httpClient
        .get<Heroes[]>(testBaseUrl)
        .subscribe((hero: Heroes[]) =>
          expect(hero)
            .withContext('should be one element array')
            .toEqual([testHero[0]])
        );

      httpClient
        .get<Heroes[]>(testBaseUrl)
        .subscribe((hero: Heroes[]) =>
          expect(hero).withContext('should be expected data').toEqual(testHero)
        );
      const requests = httpTestingController.match(testBaseUrl);
      expect(requests.length).toEqual(3);
      requests[0].flush([]);
      requests[1].flush([testHero[0]]);
      requests[2].flush(testHero);
    });
  });

  describe('#PostHero', () => {
    it('should add an Hero and return it', () => {
      const newEmp: Heroes = {
        id: 1,
        name: 'json-server',
        active: true,
      };

      heroServiceService.addHero(newEmp).subscribe({
        next: (heroes) =>
          expect(heroes)
            .withContext('should return expected heroes')
            .toEqual(newEmp),
        error: fail,
      });

      const req = httpTestingController.expectOne(heroServiceService.baseUrl);
      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual(newEmp);

      const expectedResponse = new HttpResponse({
        status: 201,
        statusText: 'Created',
        body: newEmp,
      });
      req.event(expectedResponse);
    });

    // it('should turn 404 error into return of the requested Hero', () => {
    //   const msg = 'Deliberate 404';

    //   const newEmp: Heroes = {
    //     id: 1,
    //     name: 'json-server',
    //     active: true,
    //   };

    //   heroServiceService.addHero(newEmp).subscribe({
    //     next: () => fail('expected to fail'),
    //     error: (error) => expect(error.message).toContain(msg),
    //   });

    //   const req = httpTestingController.expectOne(heroServiceService.baseUrl);

    //   expect(req.request.method).toBe('POST');

    //   req.flush(msg, { status: 404, statusText: 'Not Found' });
    // });
  });

  describe('#updateHero', () => {
    it('should update a hero and return it', () => {
      const updateHero: Heroes = {
        id: 1,
        name: 'json-server',
        active: true,
      };

      heroServiceService.updateHero(updateHero).subscribe({
        next: (hero) =>
          expect(hero)
            .withContext('should return the hero')
            .toEqual(updateHero),
        error: fail,
      });

      const req = httpTestingController.expectOne(heroServiceService.baseUrl);
      expect(req.request.method).toEqual('PUT');
      expect(req.request.body).toEqual(updateHero);

      const expectedResponse = new HttpResponse({
        status: 200,
        statusText: 'OK',
        body: updateHero,
      });
      req.event(expectedResponse);
    });

    // it('should turn 404 error into user-facing error', () => {
    //   const msg = 'Deliberate 404';

    //   const updateHero: Heroes = {
    //     id: 1,
    //     name: 'json-server',
    //     active: true,
    //   };

    //   heroServiceService.updateHero(updateHero).subscribe({
    //     next: () => fail('expected to fail'),
    //     error: (error) => expect(error.message).toContain(msg),
    //   });

    //   const req = httpTestingController.expectOne(heroServiceService.baseUrl);

    //   req.flush(msg, { status: 404, statusText: 'Not Found' });
    // });

    // it('should turn network error into user-facing error', (done) => {
    //   const errorEvent = new ProgressEvent('error');

    //   const updateHero: Heroes = {
    //     id: 1,
    //     name: 'json-server',
    //     active: true,
    //   };

    //   heroServiceService.updateHero(updateHero).subscribe({
    //     next: () => fail('expected to fail'),
    //     error: (error) => {
    //       expect(error).toBe(errorEvent);
    //       done();
    //     },
    //   });

    //   const req = httpTestingController.expectOne(heroServiceService.baseUrl);

    //   req.error(errorEvent);
    // });
  });

  describe('#DeleteHero', () => {
    // it('should delete an Hero and return it', () => {
    //   const newEmp: Heroes = {
    //     id: 10,
    //     name: 'json-servers',
    //     active: true,
    //   };
    //   heroServiceService.deleteHero(newEmp).subscribe({
    //     next: (heroes) =>
    //       expect(heroes)
    //         .withContext('should return expected heroes')
    //         .toEqual(newEmp),
    //     error: fail,
    //   });
    //   const req = httpTestingController.expectOne(heroServiceService.baseUrl);
    //   expect(req.request.method).toEqual('DELETE');
    //   expect(req.request.body).toEqual(newEmp);
    //   req.flush(newEmp);
    // });
  });
});
