import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {DemandeStage} from "./Model/demande-stage";
import {Cardss} from "./Model/cardss";

@Injectable({
  providedIn: 'root'
})
export class CardssService {
    constructor(private httpClient: HttpClient) { }
        private baseURL = "http://localhost:8084/cards";
    getcardList(): Observable<Cardss[]>{
        return this.httpClient.get<Cardss[]>(`${this.baseURL}`);
    }
    createcards(cardss: Cardss): Observable<Cardss>{
        return this.httpClient.post<Cardss>(`${this.baseURL}`, cardss);
    }
    getcardById(id: bigint): Observable<Cardss>{
        return this.httpClient.get<Cardss>(`${this.baseURL}/${id}`);
    }
    getcardBytitleId(id: bigint): Observable<Cardss[]>{
        return this.httpClient.get<Cardss[]>(`${this.baseURL+"/liste"}/${id}`);
    }
    updatecard( cardss: Cardss): Observable<Cardss>{
        return this.httpClient.put<Cardss>(`${this.baseURL}`, cardss);
    }
    deletecard(id: bigint): Observable<Cardss>{
        return this.httpClient.delete<Cardss>(`${this.baseURL}/${id}`);
    }
}
