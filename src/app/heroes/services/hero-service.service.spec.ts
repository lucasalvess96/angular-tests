import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { of } from 'rxjs';
import { Heroes } from '../models/heroes';
import { HeroServiceService } from './hero-service.service';

// TEST WITH SPY
describe('HeroServiceService', () => {
  let httpClientSpy: jasmine.SpyObj<HttpClient>;
  let service: HeroServiceService;

  beforeEach(() => {
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);
    service = new HeroServiceService(httpClientSpy);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return expected heroes (HttpClient called once)', (done: DoneFn) => {
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
});

// TEST WITH TESTBED WITHOUT SPY
describe('HeroServiceService with TestBed', () => {
  let serviceTestBed: HeroServiceService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [HeroServiceService],
    });
    serviceTestBed = TestBed.inject(HeroServiceService);
  });

  it('should be created serviceTestBed', () => {
    expect(serviceTestBed).toBeTruthy();
  });

  it('test should wait for HeroServiceService.getHeroes', waitForAsync(() => {
    const expectedHeroes: Heroes[] = [
      {
        id: 1,
        name: 'json-server',
        active: true,
      },
    ];
    serviceTestBed
      .getHeroes()
      .subscribe((value) => expect(value).toEqual(expectedHeroes));
  }));
});
