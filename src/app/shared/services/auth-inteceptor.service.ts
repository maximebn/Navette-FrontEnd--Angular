import { Injectable } from '@angular/core';
import { HttpRequest, HttpInterceptor, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptorService implements HttpInterceptor {

    constructor() { }

    // Exemple d'implémentation d'un service intercepteur

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
      // Récupérer le token utilisateur
      const currentUser: any = {};
      currentUser.token = 'blablablabla1234567890';
      console.log('Ajoute l\'entête avec le token utilisateur');

      // Clonage : bonne pratique (pour conservation de la requête entrante) mais pas obligatoire :
      request = request.clone({
        setHeaders: {
        Authorization: `Bearer ${currentUser.token}`
        }
      });
      return next.handle(request);
    }
}
