import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Component, Inject, OnInit } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { TourneeInterface } from './../../shared/interfaces/tournee';
import { CreditCardValidator } from 'angular-cc-library';

import * as moment from 'moment';

@Component({
  selector: 'app-payment-dialog',
  templateUrl: './payment-dialog.component.html',
  styleUrls: ['./payment-dialog.component.scss']
})
export class PaymentDialogComponent implements OnInit {

  public paymentForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<PaymentDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public tour: TourneeInterface
  ) { }

  // Getters typescript mode
  public get cardNumber(): AbstractControl {
    return this.paymentForm.controls.cardNumber;
  }
  public get crypto(): AbstractControl {
    return this.paymentForm.controls.crypto;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
    if ( !this.tour.hasOwnProperty('resa')) {
      this.tour.resa = 1; }
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

