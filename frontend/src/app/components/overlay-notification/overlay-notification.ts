import { Component, inject, OnDestroy, OnInit, ViewChild, ElementRef } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';
import { ModalEmailService } from '../../service/modal-email.service';
import { Subscription, Subject, takeUntil } from 'rxjs';
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
  private subscriptions = new Subscription();
  private destroy$ = new Subject<void>();
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
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      message: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  private loadTranslations(): void {
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
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
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
    this.loadTranslations();
    this.subscriptions.add(
      this.modalEmailService.ModalObservable.subscribe(() => {
        this.showModal = true;
      })
    );
    this.subscriptions.add(
      this.translateService.onLangChange().subscribe(() => this.loadTranslations())
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }

  closeModal(): void {
    this.showModal = false;
  }

  submit(): void {
    if (this.form.invalid) return;
    emailjs.send(
      environment.email.serviceID,
      environment.email.templateID,
      this.form.value,
      { publicKey: environment.email.publicKey }
    )
      .then(
        () => {},
        (error) => {
          console.log('FAILED...', (error as EmailJSResponseStatus).text);
        },
      );
    this.closeModal();
  }
}

