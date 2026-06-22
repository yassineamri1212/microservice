import { Injectable } from '@angular/core';
import {interval, map, Observable, take} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class TimerService {
    startTimer(durationInSeconds: number): Observable<number> {
        return interval(1000).pipe(
            take(durationInSeconds),
            map((elapsedTime) => durationInSeconds - elapsedTime - 1)
        );
    }
}
