import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";


interface Classe {
    id: number;
    name: string;
    eleves: any[];
    professors: any[];

}

interface Eleve {
    id: number;
    keycloakUserId: string;
    nom: string;
    email: string;
}

// professeur.model.ts
export class Professeur {
    keycloakUserId: string;  // Keycloak user ID
    name: string;
    email: string;
    classes: Classe[];
}

    @Injectable({
    providedIn: 'root'
})
export class ClasseService {

    private baseUrl: string = 'http://localhost:8087/api/classes'; // Your API base URL

    constructor(private http: HttpClient) { }

    // Get all classes
    getAllClasses(): Observable<Classe[]> {
        return this.http.get<Classe[]>(`${this.baseUrl}`);
    }

    getClasseById(classeId: number): Observable<Classe> {
        return this.http.get<Classe>(`${this.baseUrl}/${classeId}`);
    }
    // Create a new class
    createClasse(classe: Classe): Observable<Classe> {
        return this.http.post<Classe>(`${this.baseUrl}`, classe);
    }

    // Add a student (eleve) to a class
    addEleveToClasse(classeId: number, keycloakUserId: string): Observable<Eleve> {
        return this.http.post<Eleve>(`${this.baseUrl}/${classeId}/eleves/${keycloakUserId}`, {});
    }
    assignProfessorToClass(classeId: number, keycloakUserId: string): Observable<Professeur> {
        return this.http.post<Professeur>(`${this.baseUrl}/${classeId}/professors/${keycloakUserId}`, {});
    }
    getClassesByProfessorId(keycloakUserId: string): Observable<Classe[]> {
        return this.http.get<Classe[]>(`${this.baseUrl}/professors/${keycloakUserId}`);
    }

    getClasseByEleveId(eleveId: String): Observable<Classe> {
        return this.http.get<Classe>(`http://localhost:8087/api/classes/eleves/${eleveId}`);
    }
        updateClasseName(classeId: number, newName: string): Observable<Classe> {
            return this.http.put<Classe>(`${this.baseUrl}/${classeId}`, { newName });
        }

        // Delete a class
        deleteClasse(classeId: number): Observable<void> {
            return this.http.delete<void>(`${this.baseUrl}/${classeId}`);
        }

}
