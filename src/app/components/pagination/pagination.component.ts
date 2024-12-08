import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss'],
})
export class PaginationComponent implements OnInit {

  @Input() current: number;

  constructor() {
    console.log('Hello PaginationComponent Component');
  }

  ngOnInit() {}

}
