import { Injectable } from '@angular/core';
import {Subject} from "rxjs";
import {bufferToWave} from "./chatbot/audio-helper";
declare var webkitSpeechRecognition: any;
@Injectable({
  providedIn: 'root'
})
export class VoiceRecognitionServiceService {
  private chunks: any[] = [];
  private mediaRecorder: any;
  private audioContext: AudioContext = new AudioContext();
  private audioBlobSubject = new Subject<Blob>();

  audioBlob$ = this.audioBlobSubject.asObservable();

  async startRecording() {
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.mediaRecorder = new MediaRecorder(stream);
    this.mediaRecorder.ondataavailable = (event: any) => this.chunks.push(event.data);
    this.mediaRecorder.start();
  }

  async stopRecording() {
    if (this.mediaRecorder) {
      this.mediaRecorder.onstop = async () => {
        const audioData = await new Blob(this.chunks).arrayBuffer();
        const audioBuffer = await this.audioContext.decodeAudioData(audioData);
        const wavBlob = bufferToWave(audioBuffer, audioBuffer.length);
        this.audioBlobSubject.next(wavBlob);
        this.chunks = [];
      };

      this.mediaRecorder.stop();
    }
  }

  startListening(): Promise<string> {
    return new Promise((resolve, reject) => {
      if ('webkitSpeechRecognition' in window) {
        const vSearch = new webkitSpeechRecognition();
        vSearch.continuous = false;
        vSearch.interimresults = false;
        vSearch.lang = 'fr'; // Change the language to English
        vSearch.start();
        vSearch.onresult = (e: any) => {
          console.log(e);
          const chunks = e.results[0][0].transcript;
          vSearch.stop();
          resolve(chunks);
        };
        vSearch.onerror = (error:any) => {
          reject(error);
        };
      } else {
        alert('Your browser does not support voice recognition!');
        reject(new Error('Browser does not support voice recognition'));
      }
    });
  }

  getResult():any{
    console.log(this.chunks);
    return this.chunks;
  }
}
