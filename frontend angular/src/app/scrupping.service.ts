import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject, Observable} from "rxjs";
import {Stage} from "./Model/stage";
import {Category, Scrupping} from "./offre/scrupping/scrupping.types";

@Injectable({
  providedIn: 'root'
})
export class ScruppingService {
  private _categories: BehaviorSubject<Category[] | null> = new BehaviorSubject(null);
  private _course: BehaviorSubject<Scrupping | null> = new BehaviorSubject(null);
  private _courses: BehaviorSubject<Scrupping[] | null> = new BehaviorSubject(null);
  constructor(private httpClient: HttpClient) { }

  private baseURL = "http://localhost:8686/scrape/jobs";


  get categories$(): Observable<Category[]>
  {
    return this._categories.asObservable();
  }

  /**
   * Getter for courses
   */
  get courses$(): Observable<Scrupping[]>
  {
    return this._courses.asObservable();
  }
  scrupp(): Observable<Scrupping[]>{
    return this.httpClient.get<Scrupping[]>(`${this.baseURL}`);
  }

  getOFFREList(): Observable<Scrupping[]>{
    return this.httpClient.get<Scrupping[]>(`${this.baseURL+'/all'}`);
  }

}
