import {ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import {UserService} from "../user.service";
import {VoiceRecognitionServiceService} from "../voice-recognition-service.service";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-chatbot',
  standalone: true,
    imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.scss'
})
export class ChatbotComponent  implements OnInit{
    isRecording = false;
    audioURL: string | null = null;
    @ViewChild('audioPlayer') audioPlayer!: ElementRef<HTMLAudioElement>;
    messages: string[] = [];
    newMessage!: string;
    synthesis: any;
    recognizedText: string = '';
    constructor(private dialogflowService: UserService,private audioRecordingService: VoiceRecognitionServiceService, private cd: ChangeDetectorRef) {



        this.synthesis = window.speechSynthesis;
    }

    sendMessage() {
        if (this.newMessage.trim()) {
            this.messages.push(`You: ${this.newMessage}`);
            const utterance = new SpeechSynthesisUtterance( String(this.newMessage)  );
            this.synthesis.speak(utterance);

            this.dialogflowService.sendMessage(this.newMessage).subscribe(
                response => {
                    // Handle successful response
                    console.log(response);
                },
                error => {
                    // Handle error
                    console.error('Error:', error.error.text);
                    this.messages.push(`Bot: ${error.error.text}`);
                    const utterance = new SpeechSynthesisUtterance( String(error.error.text)  );
                    this.synthesis.speak(utterance);
                }
            );
            this.newMessage = '';
        }
    }

    startRecognition(): void {

    }

    stopRecognition(): void {

    }

    ngOnInit() {
        this.audioRecordingService.audioBlob$.subscribe(blob => {
            this.audioURL = window.URL.createObjectURL(blob);
            this.audioPlayer.nativeElement.src = this.audioURL;
            this.cd.detectChanges();
        });
    }

    startRecording() {
        this.isRecording = true;
        this.audioRecordingService.startRecording();
    }

    stopRecording() {
        this.isRecording = false;
        this.audioRecordingService.stopRecording();
    }

    async startListening(): Promise<void> {
        try {
            this.recognizedText = await this.audioRecordingService.startListening();
            this.messages.push(`You: ${this.recognizedText}`);
            this.dialogflowService.sendMessage(this.recognizedText).subscribe(
                response => {
                    // Handle successful response
                    console.log(response);
                },
                error => {
                    // Handle error
                    console.error('Error:', error.error.text);
                    this.messages.push(`Bot: ${error.error.text}`);
                    const utterance = new SpeechSynthesisUtterance(String(error.error.text));
                    this.synthesis.speak(utterance);
                }
            );
        } catch (error) {
            // Handle error
            console.error('Error starting listening:', error);
            // Additional error handling if needed
        }
    }


}
