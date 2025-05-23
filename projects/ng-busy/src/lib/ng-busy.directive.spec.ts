import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { BusyTrackerService } from './service/busy-tracker.service';
import { BusyConfigHolderService } from './service/busy-config-holder.service';
import {
  ApplicationRef, ChangeDetectionStrategy, ChangeDetectorRef,
  Component,
  DebugElement,
  ElementRef, Inject,
  Injector,
  Renderer2, TemplateRef, ViewChild,
  ViewContainerRef
} from '@angular/core';
import { By } from '@angular/platform-browser';
import { NgBusyModule } from './ng-busy.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Subscription, Observable } from 'rxjs';
import { InstanceConfigHolderService } from './service/instance-config-holder.service';

const createPromiseWithDelay = (delay: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, delay);
  });
};

const createSubscriptionWithDelay = (delay: number): Subscription => {
  return new Observable((o) => {
    setTimeout((t: number = 0) => {
      o.next(t);
      o.complete();
    }, delay);
  }).subscribe(() => {
  });
};

// @ts-ignore
@Component({
    selector: 'lib-component-template',
    template: `
      <div>
          <div>
              {{message}}
          </div>
      </div>
  `,
    standalone: false
})
export class CustomBusyComponent {

  constructor(@Inject('instanceConfigHolder') private instanceConfigHolder: InstanceConfigHolderService) {
  }

  get message() {
    return this.instanceConfigHolder.config.message;
  }
}

@Component({
    template: `
      <ng-template #customTemplate>
          <div class="custom_template_for_test" style="margin-top: 110px; text-align: center;">Hi, This is from ng-template.</div>
      </ng-template>
      <div class="ng-busy-container-for-test" [ngBusy]="options"></div>`,
    standalone: false
})
class TestNgBusyComponent {
  options: any;
  @ViewChild('customTemplate', { static: true })
  customTemplate: TemplateRef<any>;
}

@Component({
    template: `
      <div class="ng-busy-container-for-test" [ngBusy]="options"></div>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
class TestNgBusyOnPushComponent {
  options: any;

  constructor(public cdr: ChangeDetectorRef) {
  }
}

describe('NgBusyDirective', () => {
  let component: TestNgBusyComponent;
  let fixture: ComponentFixture<TestNgBusyComponent>;
  let busyContainer: DebugElement;
  let spinner;
  const mockElementRef: ElementRef = { nativeElement: undefined };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [TestNgBusyComponent, CustomBusyComponent, TestNgBusyOnPushComponent],
      imports: [NgBusyModule.forRoot({
        wrapperClass: 'for_root_class'
      }), BrowserAnimationsModule],
      providers: [BusyConfigHolderService, BusyTrackerService,
        ApplicationRef, ViewContainerRef, { provide: ElementRef, useValue: mockElementRef }, Renderer2, Injector]
    });

  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestNgBusyComponent);
    component = fixture.componentInstance;
    busyContainer = fixture.debugElement.query(By.css('div.ng-busy-container-for-test'));
    mockElementRef.nativeElement = fixture.elementRef.nativeElement;
    fixture.detectChanges();
  });

  it('should not create lib-ng-busy after init the NgBusyDirective', waitForAsync(() => {
    const compiled = fixture.debugElement.nativeElement;
    component.options = undefined;
    fixture.detectChanges();
    expect(compiled.querySelector('lib-ng-busy')).toBeNull();
  }));

  it('should work as expected when use Subscription as busyOption', fakeAsync(() => {
    component.options = createSubscriptionWithDelay(1000);
    fixture.detectChanges();
    tick(300);
    fixture.detectChanges();
    spinner = fixture.debugElement.query(By.css('lib-ng-busy default-busy'));
    expect(spinner).not.toBeNull();
    tick(700);
    fixture.detectChanges();
    spinner = fixture.debugElement.query(By.css('lib-ng-busy default-busy'));
    expect(spinner).not.toBeNull();
    tick();
  }));

  it('should load default template when there is a busy and no template configured', fakeAsync(() => {
    component.options = createPromiseWithDelay(1000);
    fixture.detectChanges();
    tick(300);
    fixture.detectChanges();
    spinner = fixture.debugElement.query(By.css('lib-ng-busy default-busy'));
    expect(spinner).not.toBeNull();
    tick(700);
    fixture.detectChanges();
    spinner = fixture.debugElement.query(By.css('lib-ng-busy default-busy'));
    expect(spinner).not.toBeNull();
    tick();
  }));

  it('should load the template when the option template is configured', fakeAsync(() => {
    component.options = {
      busy: createPromiseWithDelay(1000),
      template: component.customTemplate
    };
    fixture.detectChanges();
    tick(300);
    fixture.detectChanges();
    spinner = fixture.debugElement.query(By.css('lib-ng-busy .custom_template_for_test'))
    expect(spinner.nativeElement.textContent)
      .toBe('Hi, This is from ng-template.');
    tick(700);
    fixture.detectChanges();
    spinner = fixture.debugElement.query(By.css('lib-ng-busy .custom_template_for_test'))
    expect(spinner).toBeNull();
    tick();
  }));


  it('string typed template', fakeAsync(() => {
    component.options = {
      busy: createPromiseWithDelay(1000),
      template: 'hello',
      wrapperClass: 'content_class'
    };
    fixture.detectChanges();
    tick(300);
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('lib-ng-busy>.content_class')).nativeElement.textContent)
      .toBe('hello');
    tick(700);
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('lib-ng-busy>.content_class'))).toBeNull();
    tick();
  }));

  it('not affect each other when there many busies', fakeAsync(() => {
    const fixture1 = TestBed.createComponent(TestNgBusyComponent);
    const component1 = fixture1.componentInstance;
    component.options = {
      busy: createPromiseWithDelay(1000),
      template: 'hello',
      wrapperClass: 'content_class'
    };
    fixture.detectChanges();
    fixture1.detectChanges();
    tick(300);
    fixture.detectChanges();
    fixture1.detectChanges();
    expect(fixture.debugElement.query(By.css('lib-ng-busy>.content_class')).nativeElement.textContent)
      .toBe('hello');
    expect(fixture1.debugElement.query(By.css('lib-ng-busy>.content_class'))).toBeNull();
    expect(fixture1.debugElement.query(By.css('lib-ng-busy>.another_content_class'))).toBeNull();
    component1.options = {
      busy: createPromiseWithDelay(1000),
      template: 'I\'m from another busy',
      wrapperClass: 'another_content_class'
    };
    tick(0);
    fixture.detectChanges();
    fixture1.detectChanges();
    tick(700);
    fixture.detectChanges();
    fixture1.detectChanges();
    expect(fixture.debugElement.query(By.css('lib-ng-busy>.content_class'))).toBeNull();
    expect(fixture1.debugElement.query(By.css('lib-ng-busy>.another_content_class')).nativeElement.textContent)
      .toBe('I\'m from another busy');
    tick(300);
    fixture.detectChanges();
    fixture1.detectChanges();
    expect(fixture.debugElement.query(By.css('lib-ng-busy>.content_class'))).toBeNull();
    expect(fixture1.debugElement.query(By.css('lib-ng-busy>.content_class'))).toBeNull();
    expect(fixture1.debugElement.query(By.css('lib-ng-busy>.another_content_class'))).toBeNull();
    tick();
  }));

  it('component typed template', fakeAsync(() => {
    component.options = {
      busy: createPromiseWithDelay(1000),
      template: CustomBusyComponent,
      message: 'this is from component',
      wrapperClass: 'content_class_component'
    };
    fixture.detectChanges();
    tick(300);
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('lib-ng-busy>.content_class_component')).nativeElement.textContent.trim())
      .toBe('this is from component');
    tick(700);
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('lib-ng-busy>.content_class_component'))).toBeNull();
    tick();
  }));

  it('the message of the busy should be changed if the message in the option is changed', fakeAsync(() => {
    component.options = {
      busy: createPromiseWithDelay(1000),
      template: CustomBusyComponent,
      message: 'this is from component',
      wrapperClass: 'content_class_component'
    };
    fixture.detectChanges();
    tick(300);
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('lib-ng-busy>.content_class_component')).nativeElement.textContent.trim())
      .toBe('this is from component');
    component.options.message = 'wow, the message changed!!!';
    tick(200);
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('lib-ng-busy>.content_class_component')).nativeElement.textContent.trim())
      .toBe('wow, the message changed!!!');
    tick(500);
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('lib-ng-busy>.content_class_component'))).toBeNull();
    tick();
  }));

});
