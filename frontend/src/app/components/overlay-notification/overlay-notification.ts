import { Component, inject, OnDestroy, OnInit, ViewChild, ElementRef } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';
import { ModalEmailService } from '../../service/modal-email.service';
import { Subscription } from 'rxjs';
import { IconsComponent } from '../icons/icons';
import { TextInput } from '../text-input/text-input';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from '../button/button';
import { TranslateService } from '../../service/translate.service';
import emailjs, { type EmailJSResponseStatus } from '@emailjs/browser';

@Component({
  selector: 'app-overlay-notification',
  imports: [CommonModule, IconsComponent, TextInput, ReactiveFormsModule, Button],
  templateUrl: './overlay-notification.html',
  styleUrl: './overlay-notification.scss'
})
export class OverlayNotification implements OnInit, OnDestroy {
  @ViewChild('contactForm', { static: false }) contactForm!: ElementRef<HTMLFormElement>;
  private modalEmailService = inject(ModalEmailService);
  private translateService = inject(TranslateService);
  private subscription: Subscription | undefined;
  public showModal = false;
  public contactLinks = environment.contactLinks;

  public contactText = {
    title: '',
    mail: '',
    phone: '',
    linkedin: '',
    or: '',
    sendMessage: '',
    name: '',
    email: '',
    message: '',
    send: ''
  };

  public form: FormGroup;
  constructor(
    private readonly fb: FormBuilder,
  ) {
    this.form = this.fb.group(
      {
        name: ['', [Validators.required, Validators.email]],
        email: ['', [Validators.required, Validators.minLength(3)]],
        message: ['', [Validators.required, Validators.minLength(5)]]
      },
    );
    this.loadTranslations();
    this.translateService.onLangChange().subscribe(() => this.loadTranslations());
  }

  private loadTranslations() {
    this.translateService.get([
      'ui.contact.title',
      'ui.contact.mail',
      'ui.contact.phone',
      'ui.contact.linkedin',
      'ui.contact.or',
      'ui.contact.sendMessage',
      'ui.contact.name',
      'ui.contact.email',
      'ui.contact.message',
      'ui.contact.send'
    ]).subscribe((res: any) => {
      this.contactText = {
        title: res['ui.contact.title'],
        mail: res['ui.contact.mail'],
        phone: res['ui.contact.phone'],
        linkedin: res['ui.contact.linkedin'],
        or: res['ui.contact.or'],
        sendMessage: res['ui.contact.sendMessage'],
        name: res['ui.contact.name'],
        email: res['ui.contact.email'],
        message: res['ui.contact.message'],
        send: res['ui.contact.send']
      };
    });
  }

  ngOnInit(): void {
    this.subscription = this.modalEmailService.ModalObservable.subscribe(() => {
      this.showModal = true;
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  closeModal() {
    this.showModal = false;
  }

  submit() {
    if (this.form.invalid) return;
    if (!this.contactForm) return;
    emailjs.sendForm(environment.email.serviceID,
      environment.email.templateID,
      this.contactForm.nativeElement,
      {
        publicKey: environment.email.publicKey,
      }
    )
      .then(
        () => {
          alert('email enviado com sucesso')
          console.log('SUCCESS!');
        },
        (error) => {
          alert('falha ao enviar o email')
          console.log('FAILED...', (error as EmailJSResponseStatus).text);
        },
      );
    this.closeModal();
  }
}

