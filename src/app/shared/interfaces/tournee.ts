import * as moment from 'moment';

export interface TourneeInterface {
  hour?: moment.Moment;
  am?: boolean;
  dispo?: number;
  resa?: number;
}
