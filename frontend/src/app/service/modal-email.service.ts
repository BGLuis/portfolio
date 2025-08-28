import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ModalEmailService {
    private modalSubject = new Subject<void>();

    openModal() {
        this.modalSubject.next();
    }

    get ModalObservable() {
        return this.modalSubject.asObservable();
    }
}
