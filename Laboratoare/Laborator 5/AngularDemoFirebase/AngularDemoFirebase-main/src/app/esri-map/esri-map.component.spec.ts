import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EsriMapComponent } from './esri-map.component';

describe('EsriMapComponent', () => {
  let component: EsriMapComponent;
  let fixture: ComponentFixture<EsriMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EsriMapComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EsriMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
