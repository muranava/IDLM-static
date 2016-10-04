import { Component, Input, ElementRef, ViewChild } from '@angular/core';
import { BasicChart } from '../../charts/charts';

@Component({
  selector: 'idlmChart-2-2',
  templateUrl: './chart-2-2.component.html',
  styleUrls: ['./chart-2-2.component.css']
})
export class Chart_2_2Component extends BasicChart {
    @ViewChild('chartPlayground') chartElement: ElementRef;
    dataCatalogKey:string="2.2";

    initChart(){
    }
    initData(){
    }
    updateScales(){
    }
    draw(){
    }
}
