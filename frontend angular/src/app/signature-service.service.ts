import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";
import {Signature} from "./Model/signature";

@Injectable({
  providedIn: 'root'
})
export class SignatureServiceService {

    constructor(private httpClient: HttpClient) {

    }

    private baseURL = "https://esprit-stages.com/signatures";

    getsignatureList(): Observable<Signature[]>{
        return this.httpClient.get<Signature[]>(`${this.baseURL}`);
    }

    createsignature(signature: Signature): Observable<Signature>{
        return this.httpClient.post<Signature>(`${this.baseURL}`, signature);
    }

    getsignatureById(id: bigint): Observable<Signature>{
        return this.httpClient.get<Signature>(`${this.baseURL+"/find"}/${id}`);
    }

    updatesignature( signature: Signature): Observable<Signature>{
        return this.httpClient.put<Signature>(`${this.baseURL}`, signature);
    }

    deletesignature(id: bigint): Observable<Signature>{
        return this.httpClient.delete<Signature>(`${this.baseURL}/${id}`);
    }
}
