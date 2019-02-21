import { DaoResa } from './../../shared/models/dao-resa';
import { ResaModel } from './../../shared/models/resa-model';

import { TourneesService } from './../../shared/services/tournees.service';
import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { TourneeInterface } from './../../shared/interfaces/tournee';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSnackBar} from '@angular/material';
import { PaymentDialogComponent } from './../payment-dialog/payment-dialog.component';

import * as moment from 'moment';
import { ResaService } from 'src/app/shared/services/resa.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tour-list',
  templateUrl: './tour-list.component.html',
  styleUrls: ['./tour-list.component.scss']
})
export class TourListComponent implements OnInit, OnDestroy {
  public tournees: Array<TourneeInterface>;
  public progress: boolean = true;

  // Déclaration de variables utiles à l'affichage :
  // Date de la premièretournée
  public tourDate: moment.Moment;

  // Date de la tournée courante :
  public firstTourDate: moment.Moment;

  // Booléens sur date maxi et minisu calendrier des tournées :
  public isMaxDate: boolean;
  public isMinDate: boolean;

  // Objet Subscription
  private tourSubscription: Subscription;

  public resaTemporaire: any;

  // Constructeur
  constructor(
    private tourneeService: TourneesService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  // Initialisation angular : on fait appel à apicall pour intialiser l'affichage des tournées :
  ngOnInit(): void {
    this.apiCall();
  }

  // On détruit la souscription aux observables dès qu'ils ont été utilisés
  // (on libère les observables afin d'alléger l'utilisation des ressources) :
  ngOnDestroy(): void {
    this.tourSubscription.unsubscribe();
  }

  // ------------------------------------------------------------------------------------------------------ //
  // Méthode de récupération des tournées du jour :
  private apiCall(tourDate?: moment.Moment): void {
        this.tourSubscription = this.tourneeService.getRemoteTournees(tourDate).subscribe((tournees) => {
        this.tourDate = this.tourDate ? this.tourDate : moment(tournees[0].hour);
        this.firstTourDate = moment(tournees[0].hour);

        console.log('nombre de tournees :' + tournees.length);
        this.tournees = tournees.map((tour) => {
          const time: moment.Moment =  moment(tour.horaire, 'YYYY-MM-DD HH:mm');
          const heure: number = parseInt(time.format('HH'), 10);
          const matin: boolean = (heure < 13 ) ? true : false;
          const tournee: TourneeInterface = {
            hour: time,
            dispo: Number(tour.placeDispo),
            resa: 1,
            am: matin
          };
          return tournee;
        });
    });
  }

 // Récupération des tournée du jour suivant :
 public nextDay() {
  this.tourDate = this.tourDate.clone().add(1, 'day');
  if (this.tourDate.isSame(this.firstTourDate.clone().add(7, 'day'), 'day')) {
    this.isMaxDate = true;
    this.snackBar.open('Attention, l\'homme a plus de prévoyance à mesure qu\'il a moins de mémoire, revenez plus tard !', 'Fermer');
  }
  this.isMinDate = false;
  this.apiCall(this.tourDate);
}

// Récupération des tournée du jour précédent :
public previousDay() {
  this.tourDate = this.tourDate.clone().subtract(1, 'day');
  if (this.tourDate.isSame(this.firstTourDate.clone(), 'day')) {
    this.isMinDate = true;
    this.snackBar.open('Attention, nous y travaillons, mais remonter le temps n\'est toujours pas à notre portée ! ', 'Compris');
  }

  console.log(this.tourDate);
  console.log(this.firstTourDate);
  console.log(this.isMinDate);

  this.isMaxDate = false;
  this.apiCall(this.tourDate);
}

// ------------------------------------------------------------------------------------- //

private apiCallChoose(tour: TourneeInterface) {
const resp = this.tourneeService.chooseReservation(tour.hour, tour.resa).subscribe(response => {
    this.resaTemporaire = response;
    if (response.status === 200) {
      this.openPaymentDialog(tour);
    }
});
}

// ------------------------------------------------------------------------------------- //
  // Méthode de désactivation du bouton de réservation :
  public isDisabled(tour: TourneeInterface): boolean {
    const today: moment.Moment = moment();
    return tour.hour.isBefore(today, 'minute') || tour.dispo === 0;
  }

  public receivePlaces(places: any): void {
    console.log('Places demandées : ' + places.places);
    this.tournees[this.tournees.indexOf(places.tour)].resa = places.places;
  }

  // Méthode d'ouverture de la boite de dialogue pour le paiement :
  public openPaymentDialog(tour: TourneeInterface): void {
    const dialogRef = this.dialog.open(PaymentDialogComponent, {
      width: '900px',
      data: tour
    });

    // Après avoir fermé la boîté de dialogue (donc cliqué sur Payer) :
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const resa: ResaModel = (new ResaModel())
          .setDateResa(moment())
          .setPlaces(tour.resa)
          .setTourDate(tour.hour);

        const daoResa: DaoResa = new DaoResa(resa, this.tourneeService);
        daoResa.addRemoteResa(this.resaTemporaire.body);

        this.tournees[this.tournees.indexOf(tour)].dispo = this.tournees[this.tournees.indexOf(tour)].dispo - tour.resa;
        this.tournees[this.tournees.indexOf(tour)].resa = 1;

        // Affiche le toast... Material Mode
        this.snackBar.open('Votre réservation a bien été prise en compte.', 'Fermer');
      }
    });
  }
}
