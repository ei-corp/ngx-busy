import {ModuleWithProviders, NgModule} from '@angular/core';
import {BusyConfig, DefaultBusyComponent} from './model/busy-config';
import {CommonModule} from '@angular/common';
import {BusyTrackerService} from './service/busy-tracker.service';
import {BusyConfigHolderService} from './service/busy-config-holder.service';
import { NgBusyDirective } from './ng-busy.directive';
import { NgBusyComponent } from './component/ng-busy/ng-busy.component';
import { NgBusyBackdropComponent } from './component/ng-busy-backdrop/ng-busy-backdrop.component';

@NgModule({
    imports: [CommonModule],
    declarations: [DefaultBusyComponent, NgBusyDirective, NgBusyComponent, NgBusyBackdropComponent],
    providers: [BusyConfigHolderService, BusyTrackerService],
    exports: [NgBusyDirective],
    entryComponents: [DefaultBusyComponent, NgBusyBackdropComponent, NgBusyComponent]
})
export class NgBusyModule {
    static forRoot(config: BusyConfig): ModuleWithProviders {
        return {
            ngModule: NgBusyModule,
            providers: [
                {provide: BusyConfig, useValue: config}
            ]
        };
    }
}