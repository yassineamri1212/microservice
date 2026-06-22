import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {DemandeStage} from "./Model/demande-stage";

@Injectable({
  providedIn: 'root'
})
export class DemandeService {
    constructor(private httpClient: HttpClient) { }

    private baseURL = "https://esprit-stages.com/demandeStages";

    getdemandeList(): Observable<DemandeStage[]>{
        return this.httpClient.get<DemandeStage[]>(`${this.baseURL}`);
    }

    createdemande(demandeStage: DemandeStage): Observable<DemandeStage>{
        return this.httpClient.post<DemandeStage>(`${this.baseURL}`, demandeStage);
    }

    getdemandeById(id: bigint): Observable<DemandeStage>{
        return this.httpClient.get<DemandeStage>(`${this.baseURL}/${id}`);
    }

    updatedemande( demandeStage: DemandeStage): Observable<DemandeStage>{
        return this.httpClient.put<DemandeStage>(`${this.baseURL}`, demandeStage);
    }

    deletedemande(id: bigint): Observable<DemandeStage>{
        return this.httpClient.delete<DemandeStage>(`${this.baseURL}/${id}`);
    }
}
