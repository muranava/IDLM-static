import { Directive, ElementRef, Renderer, OnInit } from '@angular/core';
import { select } from 'd3-selection';

let svg_html = '<svg class="external-link" x="0px" y="0px" viewBox="0 0 15 15" enable-background="new 0 0 10 10" xml:space="preserve"><g transform="translate(-81,-3)"><path d="M 94.584,5.302 C 94.402,5.116 94.15,5 93.871,5 L 82.587,5 c -0.552,0 -1,0.448 -1,1 0,0.552 0.448,1 1,1 l 8.911,0 -12.107881,12.186499 c -0.389,0.392 -0.387,1.025 0.005,1.414 0.195,0.194 0.45,0.291 0.705,0.291 0.257,0 0.514,-0.099 0.709,-0.295 L 92.886,8.44 l 0,8.858 c 0,0.552 0.448,1 1,1 0.552,0 1,-0.448 1,-1 l 0,-11.283 c 0,-0.28 -0.116,-0.532 -0.302,-0.713 z"/></g></svg>';

@Directive({
  selector: '[idlmLink]'
})
export class LinkDirective implements OnInit {
    native: HTMLElement;
    constructor(el:ElementRef, renderer:Renderer){
        this.native = el.nativeElement;
    }
    ngOnInit(){
        select(this.native).append('span').html(svg_html);
    }

}
