import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Meeting {
  id?: number;
  topic: string;
  description: string;
  roomName: string;
  roomLink: string;
  startTime: string;
  endTime?: string;
  maxParticipants?: number;
  createdBy: string;
  isActive?: boolean;
  participants?: string; // JSON string of participant emails
  isPublic?: boolean;
  currentlyActive?: boolean;
  upcoming?: boolean;
  hasEnded?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface MeetingRequest {
  topic: string;
  description: string;
  startTime: string;
  endTime?: string;
  maxParticipants?: number;
  createdBy: string;
  participants?: string; // JSON string of participant emails
  isPublic?: boolean; // If false, only invited participants can join
}

@Injectable({
    providedIn: 'root'
})
export class MeetServiceService {

    private baseUrl = 'https://stb-stages.com/service-meet/api/meet';

    constructor(private http: HttpClient) {}

    // Create a new meeting
    createMeeting(meetingRequest: MeetingRequest): Observable<Meeting> {
        return this.http.post<Meeting>(`${this.baseUrl}/create`, meetingRequest);
    }

    // Get all scheduled meetings
    getScheduledMeetings(): Observable<Meeting[]> {
        return this.http.get<Meeting[]>(`${this.baseUrl}/scheduled`);
    }

    // Get upcoming meetings
    getUpcomingMeetings(): Observable<Meeting[]> {
        return this.http.get<Meeting[]>(`${this.baseUrl}/upcoming`);
    }

    // Get currently active meetings
    getActiveMeetings(): Observable<Meeting[]> {
        return this.http.get<Meeting[]>(`${this.baseUrl}/active`);
    }

    // Get meeting by ID
    getMeetingById(id: number): Observable<Meeting> {
        return this.http.get<Meeting>(`${this.baseUrl}/id/${id}`);
    }

    // Update meeting
    updateMeeting(id: number, meetingRequest: MeetingRequest): Observable<Meeting> {
        return this.http.put<Meeting>(`${this.baseUrl}/id/${id}`, meetingRequest);
    }

    // Delete meeting
    deleteMeeting(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/id/${id}`);
    }

    // Join meeting by room name
    joinMeeting(roomName: string): Observable<Meeting> {
        return this.http.get<Meeting>(`${this.baseUrl}/join/${roomName}`);
    }

    // Legacy method for backward compatibility
    getMeetingsByClassId(classId: number): Observable<Meeting[]> {
        // This can be implemented if you add class filtering to the backend
        return this.getScheduledMeetings();
    }

    // Check if user can access a meeting
    checkMeetingAccess(roomName: string, userEmail: string): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/access/${roomName}?userEmail=${userEmail}`);
    }
}
