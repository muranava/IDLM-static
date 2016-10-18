import { Component, OnInit } from '@angular/core';
import 'jquery';

@Component({
  selector: 'idlmHome',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
    constructor(){
    }

    ngOnInit(){
    }

    goNext(){
        let target = $('#introduction');
        $('html,body').stop().animate({
            scrollTop: target.offset().top
        }, '400');
    }
}
