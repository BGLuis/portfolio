import { Component, ElementRef, forwardRef, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IconsComponent } from '../icons/icons';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-input[type="text"], app-input[type="email"]',
  imports: [IconsComponent, NgClass],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextInput),
      multi: true,
    },
  ],
  standalone: true,
  templateUrl: './text-input.html',
  styleUrl: './text-input.scss'
})
export class TextInput implements ControlValueAccessor {
  @Output() focus: EventEmitter<void> = new EventEmitter<void>();
  @Output() blur: EventEmitter<void> = new EventEmitter<void>();
  @ViewChild('input') inputRef!: ElementRef<HTMLInputElement>;
  @Input() id!: string;
  @Input() type: string = 'text';
  @Input() placeholder: string = '';
  @Input() value: string = '';
  @Input() errors: any = null;
  @Input() touched: boolean = false;
  @Input() rightIcon: string | null = null;
  @Input() leftIcon: string | null = null;
  @Input() leftIconClick?: () => void;
  @Input() rightIconClick?: () => void;
  isFocused: boolean = false;
  firstLostFocus: boolean = false;
  inputErrorMessages: {
    [key: string]: string;
  } = {
      required: 'Este campo é obrigatório',
      email: 'Insira um endereço de e-mail válido',
      minlength: 'Não pode ser menor que {{requiredLength}} caracteres',
      maxlength: 'Não pode ser maior que {{requiredLength}} caracteres',
      minUppercase: 'Deve conter pelo menos {{requiredLength}} letra(s) maiúscula(s)',
      minNumber: 'Deve conter pelo menos {{requiredLength}} número(s)',
      minSymbol: 'Deve conter pelo menos {{requiredLength}} símbolo(s)',
    }

  onLeftIconClick(event: MouseEvent): void {
    event.stopPropagation();
    if (this.leftIconClick) {
      this.leftIconClick();
    }
  }

  onRightIconClick(event: MouseEvent): void {
    event.stopPropagation();
    if (this.rightIconClick) {
      this.rightIconClick();
    }
  }

  onFocus(): void {
    this.isFocused = true;
    this.focus.emit();
  }

  onBlur(value: string): void {
    this.isFocused = false;
    this.firstLostFocus = true;
    this.blur.emit();
  }
  setDisabledState?(isDisabled: boolean): void {}
  onTouched(): void {
    this.touched = true;
  }
  writeValue(value: string): void {
    this.value = value || '';
  }
  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  onInput(event: Event): void {
    this.touched = true;
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
  }
  onChange(value: string): void {
    this.touched = true;
  }

  getInputElement(): HTMLInputElement | null {
    return this.inputRef?.nativeElement || null;
  }

  errorMessages(): string[] {
    if (this.errors && this.firstLostFocus && this.touched) {
      const errorKeys = Object.keys(this.errors);
      if (errorKeys.length > 0) {
        const messages = errorKeys.map(key => {
          const message = this.inputErrorMessages[key];

          if (message) {
            if (typeof this.errors[key] === 'object' && this.errors[key] !== null) {
              for (const prop in this.errors[key]) {
                if (this.errors[key].hasOwnProperty(prop)) {
                  return message.replace(`{{${prop}}}`, this.errors[key][prop] || '');
                }
              }
            }
            return message;
          }
          else if (typeof this.errors[key] === 'string') {
            return this.errors[key];
          }

          return 'error ' + key;
        });
        return messages.filter(msg => msg !== '');
      }
    }
    return [];
  }
}
