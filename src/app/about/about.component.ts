import 'jquery';
import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'idlmAbout',
    templateUrl: './about.component.html',
    styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {

    constructor() { }

    ngOnInit() {
        $(window).scrollTop(0);
    }

}
