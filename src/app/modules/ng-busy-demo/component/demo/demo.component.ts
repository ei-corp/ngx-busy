import {Component, OnInit, ViewEncapsulation} from '@angular/core';

@Component({
    selector: 'app-busy-demo',
    templateUrl: './demo.component.html',
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['./demo.component.css'],
    standalone: false
})
export class DemoComponent implements OnInit {

  constructor() {
  }

  ngOnInit() {
  }

}
