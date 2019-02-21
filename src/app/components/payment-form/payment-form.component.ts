import {Component, OnInit, Inject} from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Validators } from '@angular/forms';
import { CreditCardValidator } from 'angular-cc-library';

@Component({
  selector: 'app-payment-form',
  templateUrl: './payment-form.component.html',
  styleUrls: ['./payment-form.component.scss'],
})

export class PaymentFormComponent implements OnInit {
  public paymentForm: FormGroup;

  // Injection du service FormBuider dans le constructeur :
  // tslint:disable-next-line:max-line-length
  constructor(private formBuilder: FormBuilder) {
  }

  ngOnInit() {
    // Création du formulaire via formBuilder + vérification via installation du package Angular cc library (CreditCardValidator)
      this.paymentForm = this.formBuilder.group({
      numeroCB: [
        '', // valeur par défaut
        [CreditCardValidator.validateCCNumber]
      ],
      expirationDate: [
        '',
        [CreditCardValidator.validateExpDate]
      ],
      crypto: [
        '',
        [Validators.required, Validators.minLength(3), Validators.maxLength(3)]
      ]
    });
  }
}
