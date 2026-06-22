import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {catchError, Observable, throwError} from "rxjs";

export interface QcmWithResponses {
    qcm: {
        id: number;
        title: string;
        description: string;
        timerInSeconds: number;
        questions: {
            id: number;
            content: string;
            options: string[];
            correctAnswer: string;
        }[];
    };
    responses: {
        studentId: string;
        score: number;
    }[];
}



export interface Question {
    id?: number;
    content: string;
    options: string[];
    correctAnswer?: string; // Omitted for students
}

export interface Qcm {
    id?: number;
    title: string;
    description: string;
    timerInSeconds: number;
    questions: Question[];
    classId: number;  // Add classId here

}

export interface Response {
    id?: number;
    qcmId: number;
    studentId: number;
    studentAnswers: { [key: number]: string }; // questionId -> answer
    score?: number;
}

@Injectable({
    providedIn: 'root',
})
export class QcmService {
    private baseUrl = 'http://localhost:8181/api/qcms'; // Adjust if necessary

    constructor(private http: HttpClient) {}

    // Create a new QCM
    createQcm(qcm: Qcm): Observable<Qcm> {
        return this.http.post<Qcm>(this.baseUrl, qcm);
    }

    // Get all QCMs
    getAllQcms(): Observable<Qcm[]> {
        return this.http.get<Qcm[]>(this.baseUrl);
    }

    // Get a specific QCM by ID
    getQcmById(id: number): Observable<Qcm> {
        return this.http.get<Qcm>(`${this.baseUrl}/${id}`);
    }

    // Submit a response for a QCM
    submitResponse(qcmId: number, studentId: String, studentAnswers: { [key: number]: string }): Observable<Response> {
        return this.http.post<Response>(`${this.baseUrl}/${qcmId}/responses?studentId=${studentId}`, studentAnswers);
    }

    getQcmresponseById(id: number): Observable<QcmWithResponses> {
        return this.http.get<QcmWithResponses>(`${this.baseUrl}/responses/${id}`);
    }
    deleteQcmById(qcmId: number): Observable<string> {
        return this.http.delete(`${this.baseUrl}/${qcmId}`, { responseType: 'text' });
    }
    updateQcm(qcmId: number, qcmData: any): Observable<string> {
        return this.http.put<string>(`${this.baseUrl}/${qcmId}`, qcmData);
    }

    getQcmsByClass(classId: number): Observable<Qcm[]> {
        return this.http.get<Qcm[]>(`${this.baseUrl}/class/${classId}`);
    }
    getResponseForStudent(qcmId: number, studentId: string): Observable<Response> {
        return this.http.get<Response>(`${this.baseUrl}/${qcmId}/responses/${studentId}`);
    }
}
