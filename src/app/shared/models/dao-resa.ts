import { Subscription } from 'rxjs';
import { DaoInterface } from './../interfaces/dao/dao-interface';
import { ResaModel } from './resa-model';
import { ResaService } from '../services/resa.service';
import { TourneesService } from '../services/tournees.service';
import * as moment from 'moment';

export class DaoResa implements DaoInterface<ResaModel> {
  private resas: Array<ResaModel> = new Array<ResaModel>();
  private resaService: ResaService = new ResaService();
  private resa: ResaModel;
  private tourneeService: TourneesService;
  private resaNumber: string;
  private resaSubscription: Subscription;

  // On passe un objet TourneeService en paramètre pour pouvoir l'utiliser en dehors lorsque qu'on crèe un daoResa :
  public constructor(resaModel: ResaModel, tourneeService: TourneesService) {
    this.resa = resaModel;
    this.tourneeService = tourneeService;
  }

  public find(id: number): ResaModel {
    const index: number = this.resas.findIndex(
      (obj: ResaModel) => {
        return obj.getId() === id;
      }
    );
    return index !== -1 ? this.resas[index] : null;
  }


  findAll(): void | ResaModel[] {
    return this.resas;
  }


  findBy(property: string, value: any): void | ResaModel[] {
  }


// --------------------------------------------------------------------------------------- //
public addRemoteResa(resaTemporaire?: any): ResaModel {
  this.resaService.getAll().then((resas) => {
    resas.push(this.resa);

    this.resaService.persist(resas);
  });
  // Création de l'objet attendu par l'api côté backend :

  if (resaTemporaire) {
    this.tourneeService.addRemoteResa(resaTemporaire).subscribe((result) => {
      this.resaNumber = result.numResa;
      this.tourneeService.confirmRemoteResa(this.resaNumber).subscribe((result) => {
      });
    });
  }
  return this.resa;
}

// --------------------------------------------------------------------------------------- //







   update(): ResaModel {
    this.resas[this.resas.indexOf(this.resa)] = this.resa;
    this.resaService.persist(this.resas);
    return this.resa;
  }


  remove(): ResaModel {
    this.resas.splice(this.resas.indexOf(this.resa), 1);
    return this.resa;
  }


}
