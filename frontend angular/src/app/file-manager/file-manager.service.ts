import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { Matiere, Chapitres, Cours } from './file-manager.types';

@Injectable({ providedIn: 'root' })
export class FileManagerService {
    // Private

    private apiUrl = 'http://localhost:8082/api'; // Assuming your Spring Boot backend is running on this URL

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    // Matiere
    getAllMatieres(): Observable<Matiere[]> {
        return this._httpClient.get<Matiere[]>(`${this.apiUrl}/matieres`);
    }

    getMatiereById(id: string): Observable<Matiere> {
        return this._httpClient.get<Matiere>(`${this.apiUrl}/matieres/${id}`);
    }

    createMatiere(matiere: Matiere): Observable<Matiere> {
        return this._httpClient.post<Matiere>(`${this.apiUrl}/matieres`, matiere);
    }

    deleteMatiere(id: string): Observable<void> {
        return this._httpClient.delete<void>(`${this.apiUrl}/matieres/${id}`);
    }

    // Chapitre
    getAllChapitres(): Observable<Chapitres[]> {
        return this._httpClient.get<Chapitres[]>(`${this.apiUrl}/chapitres`);
    }

    getChapitreById(id: string): Observable<Chapitres> {
        return this._httpClient.get<Chapitres>(`${this.apiUrl}/chapitres/${id}`);
    }

    createChapitre(chapitre: Chapitres): Observable<Chapitres> {
        return this._httpClient.post<Chapitres>(`${this.apiUrl}/chapitres`, chapitre);
    }

    deleteChapitre(id: string): Observable<void> {
        return this._httpClient.delete<void>(`${this.apiUrl}/chapitres/${id}`);
    }

    // Cours
    getAllCours(): Observable<Cours[]> {
        return this._httpClient.get<Cours[]>(`${this.apiUrl}/cours`);
    }

    getCoursById(id: string): Observable<Cours> {
        return this._httpClient.get<Cours>(`${this.apiUrl}/cours/${id}`);
    }

    createCours(cours: Cours): Observable<Cours> {
        return this._httpClient.post<Cours>(`${this.apiUrl}/cours`, cours);
    }

    deleteCours(id: string): Observable<void> {
        return this._httpClient.delete<void>(`${this.apiUrl}/cours/${id}`);
    }
    getChapitreByMatiereId(matiereId: string): Observable<Chapitres[]> {
        return this._httpClient.get<Chapitres[]>(`${this.apiUrl}/chapitres/matieres/${matiereId}`);
    }

    addCours(formData: FormData): Observable<any> {
        const url = 'http://localhost:8082/api/cours'; // Update the API endpoint as needed
        return this._httpClient.post(url, formData);
    }
    createMatieree(formData: FormData): Observable<Matiere> {
        return this._httpClient.post<Matiere>('http://localhost:8082/api/matieres', formData);
    }
    getMatieresByClassId(classId: number): Observable<any[]> {
        return this._httpClient.get<any[]>(`http://localhost:8082/api/matieres/class/${classId}`);
    }
}
