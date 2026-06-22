import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ReclamationService {


    private apiUrl = `http://localhost:8083/api/reclamations`;  // Adjust the API URL as needed

    constructor(private http: HttpClient) { }
    createReclamation(reclamation: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}`, reclamation);  // Send the new reclamation to the backend
    }
    // Get all reclamations
    getAllReclamations(): Observable<any> {
        return this.http.get<any>(this.apiUrl);
    }

    // Get a reclamation by ID
    getReclamationById(id: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${id}`);
    }

    // Add a reply to a reclamation
    replyToReclamation(reclamationId: number, content: string): Observable<any> {
        const body = { content: content };
        return this.http.post<any>(`${this.apiUrl}/${reclamationId}/reply`, body);
    }

    // Delete a reply
    deletereclamation(replyId: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/${replyId}`);
    }

    // Update the reclamation status if needed
    // (e.g., changing the status back to 'not replied' after deleting a reply)
    updateReclamationStatus(reclamationId: number, status: string): Observable<any> {
        const body = { status: status };
        return this.http.patch<any>(`${this.apiUrl}/${reclamationId}`, body);
    }
}
