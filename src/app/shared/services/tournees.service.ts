import { environment } from './../../../environments/environment';
import { Observable } from 'rxjs';
import { TourneeInterface } from './../interfaces/tournee';
import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { ResaService } from './resa.service';
import { ResaModel } from '../models/resa-model';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TourneesService {
  private resaService: ResaService = new ResaService();

  constructor(private httpClient: HttpClient) {
   }

   // On récupère les tournées côté backend à une date donnée (voir fichiers environnements pour l'uri :)
   public getRemoteTournees(day?: moment.Moment): Observable<any[]> {
     let uri = environment.apiRoot + 'api/client/';
     if (day) {
       uri += day.format('YYYY-MM-DD');
     } else {
       uri += moment().format('YYYY-MM-DD');
     }
     return this.httpClient.get<any[]>(
      uri
    );
  }

  // On vérifie côté backend qu'au moment de réserver, la tournée existe bien et les places également :
  public chooseReservation(date: any, places: any): Observable<any> {
   const uri = environment.apiRoot + 'api/client/choose';
      // on définit les paramètres de la requête :
   const params = new HttpParams()
    .set('date', moment(date).format('YYYY-MM-DD-HH-mm'))
    .set('place', places);

      // On retourne la réponse :
   return this.httpClient.get<any[]>(uri, {observe: 'response', params: params});
  }

  // On poste le résultat de la méthode précédente, ce qui crée un numéro de réservation :
  public addRemoteResa(reservation: any): Observable<any> {
    const uriPost = environment.apiRoot + 'api/client/reservation';
    return this.httpClient.post<any[]>(uriPost, reservation);
  }

  // On confirme la réservation grâce au numéro de réservation précédemment créé :
  public confirmRemoteResa(numResa: string): Observable<any> {
    const uriPost = environment.apiRoot + 'api/client/reservation/confirm/' + numResa;
    return this.httpClient.get<any[]>(uriPost);
  }

  // ----------------------------------------------------------------------------------------------------------- //
  // Fake back-end, utile si pas de back-end :
  public getTournees(): Promise<Array<TourneeInterface>> {
    return new Promise((resolve) => {
      const tournees: Array<TourneeInterface> = new Array<TourneeInterface>();
      const today: moment.Moment = moment();
      this.resaService.getAll().then((resas) => {
        tournees.push(
          {
            hour: today.clone().hour(8).minute(0).second(0),
            dispo: this.setDispos(resas, today.clone().hour(8).minute(0).second(0)),
            resa: 1,
            am: true
          },
          {
            hour: today.clone().hour(11).minute(0).second(0),
            dispo: this.setDispos(resas, today.clone().hour(11).minute(0).second(0)),
            resa: 1,
            am: true
          },
          {
            hour: today.clone().hour(14).minute(0).second(0),
            dispo: this.setDispos(resas, today.clone().hour(14).minute(0).second(0)),
            resa: 1,
            am: false
          },
          {
            hour: today.clone().hour(23).minute(0).second(0),
            dispo: this.setDispos(resas, today.clone().hour(17).minute(0).second(0)),
            resa: 1,
            am: false
          },
        );

        resolve(tournees);
      });

    });
  }
// ----------------------------------------------------------------------------------------------------------- //


// Mise à jour des disponibilités des navettes :
  private setDispos(resas: Array<ResaModel>, tourHour: moment.Moment): number {
    const indice: number = resas.findIndex((obj) => {
      return obj.getTourDate().isSame(tourHour, 'hour');
    });
    if (indice !== -1) {
      return 8 - resas[indice].getPlaces();
    }
    return 8;
  }
}
