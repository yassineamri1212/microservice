import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Offre} from "./Model/offre";

@Injectable({
    providedIn: 'root'
})
export class OffreService {


    constructor(private httpClient: HttpClient) { }

    private baseURL = "https://esprit-stages.com/offres";

    getoffreList(): Observable<Offre[]>{
        return this.httpClient.get<Offre[]>(`${this.baseURL}`);
    }

    createoffre(offre: Offre): Observable<Offre>{
        return this.httpClient.post<Offre>(`${this.baseURL}`, offre);
    }

    getoffreById(id: bigint): Observable<Offre>{
        return this.httpClient.get<Offre>(`${this.baseURL}/${id}`);
    }

    updateoffre( suivie: Offre): Observable<Offre>{
        return this.httpClient.put<Offre>(`${this.baseURL}`, suivie);
    }

    deleteoffre(id: bigint): Observable<Offre>{
        return this.httpClient.delete<Offre>(`${this.baseURL}/${id}`);
    }
}
