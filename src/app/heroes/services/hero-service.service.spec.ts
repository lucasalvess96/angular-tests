import { HttpClient } from '@angular/common/http';
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
