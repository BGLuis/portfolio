import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { IconsComponent } from '../icons/icons';

@Component({
  selector: 'app-button',
  imports: [IconsComponent],
  templateUrl: './button.html',
  styleUrl: './button.scss'
})
export class Button {
  @ViewChild('button') buttonRef!: ElementRef<HTMLButtonElement>;
  @Input() id!: string;
  @Input() type: string = 'text';
  @Input() rightIcon: string | null = null;
  @Input() leftIcon: string | null = null;
}
