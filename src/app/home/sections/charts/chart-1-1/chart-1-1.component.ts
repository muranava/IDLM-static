import { Component, Input, Renderer, ViewChild, ElementRef } from '@angular/core';
import { select } from 'd3-selection';
import { line, stack, area } from 'd3-shape';
import { scaleLinear, ScaleLinear, scaleQuantize, ScaleQuantize, ScaleTime } from 'd3-scale';
import { max, range } from 'd3-array';
import { entries } from 'd3-collection';
import 'd3-transition';

import { AxedChart, dateParser, LineChartNode, ScrollableChart } from '../charts';
import { DataLoaderService } from '../data-loader.service';

interface State {
    domain: number[],
    range: number[],
    scale: ScaleLinear<any,any>|ScaleQuantize<any>
};

interface Period {
    start: Date,
    end: Date,
    text: string
}

let FAKE_PERIODS = [
    {
        start: (new Date(1997, 0, 1)),
        end: (new Date(2001, 8, 1)),
        text: `###Période pré-11 septembre
        Nous voyons ici que le nombre d'occurence d'islam n'est pas significatif.
        Certains journaux comme le Figaro n'aborde quasiment pas le sujet.
        `
    },{
        start: (new Date(2001, 8, 1)),
        end: (new Date(2006, 8,  31)),
        text: `###Le 11 septembre et ses retombées

        On assiste ici à une explostion du nombre d'occurences, tout journaux
        confondus.
        `
    },{
        start: (new Date(2006, 8, 31)),
        end: (new Date(2015, 11,  31)),
        text: `###Je n'ai plus d'idées de périodes

        Donc je met un peu n'importe quoi, l'idée c'est de mimer le comportement
        final. Le contenu ici importe peu. Bisous.
        `
    }
];

@Component({
  selector: 'idlmChart-1-1',
  templateUrl: './chart-1-1.component.html',
  styleUrls: ['./chart-1-1.component.scss']
})
export class Chart_1_1Component extends AxedChart implements ScrollableChart {
    @ViewChild('chartPlayground') chartElement: ElementRef;
    // template attributes
    hideFirstContent: boolean = false;
    heightForScrollWatcher:string = "8000px";
    periodText:string = null;
    dataCatalogKey:string="1.1";
    private areaData: any;
    private previousPercentage: number = 0;
    private previousPeriodNumber: number = null;

    private _area:      any;
    private _focusArea: any;
    private _clip:      any;
    private _lines:     any;

    protected yScale: ScaleLinear<any,any>;
    protected xScale: ScaleTime<any,any>;
    private periodsData: Array<Period>;

    private states:any;

    constructor(protected renderer:Renderer, protected dataLoader:DataLoaderService){
        super(renderer, dataLoader);
    }

    draw(){
        this.drawLines();
        this.drawClip();
        this.drawStackedArea(this.areaData.values);
        this.drawAxes();
    }

    initData(){
        for (let i in this.data) {
            let _data = this.data[i];
            _data.values = _data.values.map((d)=>{
                d.date = dateParser(d.date);
                return d;
            });
        }
        this.areaData = this.data['islam'];
        // TODO: une fois les périodes éditorialisées et rajoutées dans les
        // données, les utiliser ici.
        this.periodsData = FAKE_PERIODS;
        this.initStates();
    }

    private initStates(){
        this.states = {
            // lines scale, percentage of line drawing.
            lines:{
                domain: [0, 20],
                range: [2000, 0],
                scale: scaleLinear()
            },
            // removeLine scale is to make "musulman" line dispappear (from top to bottom);
            removeLine:{
                domain: [20, 25],
                range: [0, -1000],
                scale: scaleLinear()
            },
            // areas scroll scale is to make stacked area appears.
            areas:{
                domain: [20, 25],
                range: [0, 100],
                scale: scaleLinear()
            },
            // fourt scroll scale is to focus some specific areas in the graph
            // TODO: change 5 by the actual number of periods to focus on.
            focusPeriods:{
                domain: [25, 100],
                range: range(this.periodsData.length),
                scale: scaleQuantize()
            }
        };
        for(let i in this.states){
            let state = this.states[i];
            state.scale = state.scale
                .domain(state.domain)
                .range(state.range);
        }
    }

    getMaxYValue(){
        return 24000;
    }

    getXValues():any[]{
        let values = [];
        for( let i in this.data){
            for(let d of this.data[i].values){
                values.push(d.date);
            }
        }
        return values;
    }

    private drawLines(){
        let line_fn = line<LineChartNode>()
            .x((d)=>{
                return this.xScale(d.date);
            })
            .y((d)=>{
                return this.yScale(d.value);
            });

        this._lines = this._g.selectAll('.line')
            .data(entries(this.data))
            .enter().append('g').attr('class', 'line');

        this._lines
                .append('path')
                .attr('fill', 'none')
                .attr('d', (d)=>{
                    return line_fn(d.value.values);
                })
                .attr('stroke-dasharray', 2000)
                .attr('stroke-dashoffset', 2000)
                .attr('class', (d)=>{
                    return `line ${d.key}`;
                });
    }

    private stacks(data){
        let stack_fn = stack()
            .keys(['figaro', 'lemonde', 'liberation'])
            .value((d,key)=>{
                return d['sub_values'][key];
            });
        return stack_fn(data);
    }

    private drawStackedArea(data){
        let stacked_data = this.stacks(data);
        // first area draw for the "normal" area
        this._area = this._g.append('g').attr('class', 'area-group regular');
        this._area.selectAll('path.area.regular')
            .data(stacked_data)
            .enter()
                .append('path').attr('class', (d)=>`area regular ${d.key}`)
                .attr('d', this.drawAreaWithPerc(0));

        this._focusArea = this._g.append('g').attr('class', 'area-group focus');
        // 2nd path creation (dedicated for focus)
        this._focusArea.selectAll('path.area.focus')
            .data(stacked_data)
            .enter()
                .append('path').attr('class', (d)=>`area focus ${d.key}`)
                .attr('clip-path', 'url(#focusClip)')
                .style('opacity', 0)
                .attr('d', this.drawAreaWithPerc(100));
    }

    private drawAreaWithPerc(perc:number=0){
        perc = perc / 100;
        return area()
            .y1((d)=>this.yScale(d[1] * perc))
            .y0((d)=>this.yScale(d[0] * perc))
            .x((d,i)=>this.xScale(this.areaData.values[i].date));
    }

    private drawClip(){
        this._clip = this._g.append('clipPath')
            .attr('id', 'focusClip')
            .append('rect')
                .attr('width', 0)
                .attr('height', this.size.inner.height);
    }

    private focusPeriod(period_nb:number){
        this._focusArea.selectAll('.area.focus').style('opacity', 1);
        if(this.previousPeriodNumber != period_nb){
            let period = this.periodsData[period_nb];
            let start_x = this.xScale(period.start);
            let width = this.xScale(period.end) - start_x;
            this._clip.transition().duration(330)
                .attr('width', width)
                .attr('transform', `translate(${start_x}, 0)`);
            this.previousPeriodNumber = period_nb;
            this.periodText = period.text;
        }
    }

    // draws 2 the 2 lines progressively
    private setLinesAt(perc:number){
        let state_perc = this.getStatePercentage(this.states.lines, perc);
        this._g.selectAll('path.line').attr('stroke-dashoffset', state_perc);
    }

    // remove one line progressively
    private translateLineTo(key, perc){
        let state_perc = this.getStatePercentage(this.states.removeLine, perc);
        this._g.select('.line.musulman')
            .attr('transform', `translate(0, ${state_perc})`);
    }

    // make areas more or less big
    private updateAreas(perc){
        let state_perc = this.getStatePercentage(this.states.areas, perc);
        this._area.selectAll('.regular').attr('d', this.drawAreaWithPerc(state_perc));
    }
    /**
     * Focus a specific period (determined with scroll position)
     * @see states.focusPeriods
     * @see focusPeriod
     */
    private setFocusAt(perc){
        let period_nb = this.getStatePercentage(this.states.focusPeriods, perc);
        if(perc > this.states.focusPeriods.domain[0]){
            this.hideFirstContent = true;
            this.focusPeriod(period_nb);
        } else {
            this.hideFirstContent = false;
            this._focusArea.selectAll('.area.focus').style('opacity', 0);
        }
    }

    private getStatePercentage(state:State, perc:number){
        let state_perc = state.range[0];
        if(perc > state.domain[0]){
            state_perc = state.scale(perc);
        }
        if(perc > state.domain[1]){
            state_perc = state.range[1];
        }
        return state_perc;
    }

    onScroll(perc:number){
        if(!this.data){ return; }
        if(this.previousPercentage == perc){ return; }
        // short fail to avoid computation
        // if(perc == 0 || perc == 100){ return; }
        // major steps:
        this.setLinesAt(perc);
        this.translateLineTo('musulman', perc);
        this.updateAreas(perc);
        this.setFocusAt(perc);
        this.previousPercentage = perc;
    }
}