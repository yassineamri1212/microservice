import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Suivie} from "./Model/suivie";

@Injectable({
  providedIn: 'root'
})
export class SuivieService {


    constructor(private httpClient: HttpClient) { }

    private baseURL = "https://esprit-stages.com/suivies";

    getsuivieList(): Observable<Suivie[]>{
        return this.httpClient.get<Suivie[]>(`${this.baseURL}`);
    }

    createsuivie(suivie: Suivie): Observable<Suivie>{
        return this.httpClient.post<Suivie>(`${this.baseURL}`, suivie);
    }

    getsuivieById(id: bigint): Observable<Suivie>{
        return this.httpClient.get<Suivie>(`${this.baseURL}/${id}`);
    }

    updatesuivie( suivie: Suivie): Observable<Suivie>{
        return this.httpClient.put<Suivie>(`${this.baseURL}`, suivie);
    }

    deleteSuivie(id: bigint): Observable<Suivie>{
        return this.httpClient.delete<Suivie>(`${this.baseURL}/${id}`);
    }
}
