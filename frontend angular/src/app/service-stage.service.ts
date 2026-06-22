import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Stage} from "./Model/stage";

@Injectable({
  providedIn: 'root'
})
export class ServiceStageService {

    constructor(private httpClient: HttpClient) { }

    private baseURL = "https://esprit-stages.com/stages";

    getstageList(): Observable<Stage[]>{
        return this.httpClient.get<Stage[]>(`${this.baseURL}`);
    }

    createstage(stage: Stage): Observable<Stage>{
        return this.httpClient.post<Stage>(`${this.baseURL}`, stage);
    }

    getstageById(id: bigint): Observable<Stage>{
        return this.httpClient.get<Stage>(`${this.baseURL}/${id}`);
    }

    getstageByIdetd(id: String): Observable<Stage>{
        return this.httpClient.get<Stage>(`${this.baseURL+"/etd"}/${id}`);
    }

    updatestage( stage: Stage): Observable<Stage>{
        return this.httpClient.put<Stage>(`${this.baseURL}`, stage);
    }

    deletestage(id: bigint): Observable<Stage>{
        return this.httpClient.delete<Stage>(`${this.baseURL}/${id}`);
    }
}
