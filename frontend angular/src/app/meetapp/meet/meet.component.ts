import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MeetServiceService, MeetingRequest, Meeting } from "../../meet-service.service";
import { ActivatedRoute } from '@angular/router';  // Import to access route params

@Component({
    selector: 'app-meet',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './meet.component.html',
    styleUrls: ['./meet.component.scss']
})

export class MeetComponent implements OnInit {
    selectedDeviceId: string | null = null;
    videoDevices: MediaDeviceInfo[] = [];
    jitsiApi: any;  // Reference to Jitsi API
    videoTrack: any; // Video track for face landmark detection
    isVideoTrackStopped: boolean = false;  // Track the status of the video track
    roomName: string = '';  // Store roomName passed through route params

    constructor(
        private meetService: MeetServiceService,
        private route: ActivatedRoute  // Inject ActivatedRoute to read the roomName from the route params
    ) {}

    ngOnInit(): void {
        // Get the roomName from the route parameter
        this.route.paramMap.subscribe(params => {
            this.roomName = params.get('roomName') ?? '';  // Get roomName passed in the route
            console.log('Joining room:', this.roomName);

            if (this.roomName) {
                // Try to join existing meeting by roomName
                this.joinExistingMeeting(this.roomName);
            } else {
                // Generate a unique room name if none provided
                this.roomName = `room-${Date.now()}`;
                this.initCameraSelection(this.roomName);
            }
        });
    }

    // Get available camera devices and let user select one
    private initCameraSelection(roomName: string): void {
        navigator.mediaDevices.enumerateDevices()
            .then(devices => {
                this.videoDevices = devices.filter(device => device.kind === 'videoinput');

                // Automatically select the first video device if none is selected
                if (this.videoDevices.length > 0 && !this.selectedDeviceId) {
                    this.selectedDeviceId = this.videoDevices[0].deviceId;
                }

                // Once the camera is selected, initialize Jitsi with the selected camera
                this.initJitsi(roomName);
            })
            .catch(err => {
                console.error('Error getting devices:', err);
            });
    }

    private initJitsi(roomName: string): void {
        const domain = 'meet.jit.si';
        const options = {
            roomName: roomName,
            width: '100%',
            height: '100%',
            parentNode: document.getElementById('jitsi-container'),
            configOverwrite: {
                constraints: {
                    video: {
                        deviceId: this.selectedDeviceId, // Use the selected camera device ID
                        width: { ideal: 1280 }, // Set a default resolution for the video
                        height: { ideal: 720 },
                    },
                    audio: {
                        autoGainControl: true,  // Enable auto gain control
                        echoCancellation: true, // Enable echo cancellation
                        noiseSuppression: true, // Enable noise suppression
                        deviceId: { exact: '445aa8d4cca059a34e74d80c6f6b98733e11789802d1e248da98e055b93a458f' }, // Replace with the correct audio device ID
                    },
                },
            },
            interfaceConfigOverwrite: {},
        };

        this.jitsiApi = new (window as any).JitsiMeetExternalAPI(domain, options);

        // Wait for the video track to be fully initialized
        this.jitsiApi.addEventListener('videoTrackAdded', (event: any) => {
            console.log('Video track added:', event);
            this.videoTrack = event.videoTrack;  // Store the video track for later
            // Start face landmark detection once the video track is ready
            this.startFaceLandmarkDetection(event);
        });
    }

    // Example method to start face landmark detection
    private startFaceLandmarkDetection(videoTrack: any): void {
        if (videoTrack && videoTrack.isReady()) { // Check if the track is ready
            console.log('Starting face landmark detection...');
            // Pass the video track to the worker for processing (this can be a separate process)
        } else {
            console.error('Video track is not ready!');
            // Optionally, retry after a delay or provide fallback logic
            setTimeout(() => this.startFaceLandmarkDetection(videoTrack), 1000);  // Retry after 1 second
        }
    }

    // Method to stop face landmark detection
    private stopFaceLandmarkDetection(): void {
        if (this.videoTrack) {
            console.log('Stopping face landmark detection...');
            // Here, stop face landmark detection
            // This may involve stopping the worker or other related processes.
        }
    }

    // Method to stop video and keep the camera active
    private stopTrackingAndKeepCamera(): void {
        if (this.videoTrack) {
            console.log('Stopping tracking but keeping the camera on...');
            // Stop face landmark detection and tracking, but leave the camera stream active
            this.stopFaceLandmarkDetection();

            // Ensure the video track remains active in Jitsi
            this.jitsiApi.executeCommand('toggleVideo');  // This will keep the video stream active in Jitsi
            this.isVideoTrackStopped = false;  // Ensure the track is still active
        }
    }

    // New Method to Restart the Video Track if it Stops
    private restartVideoTrackIfStopped(): void {
        if (this.isVideoTrackStopped && this.videoTrack) {
            console.log('Video track stopped, restarting...');
            // Manually restart the video track if stopped
            // Here, you can reinitialize or resume the video stream manually
            this.jitsiApi.executeCommand('toggleVideo'); // To toggle video, this will restart it
            this.isVideoTrackStopped = false;  // Track is now active again
        }
    }

    // Try to join an existing meeting by roomName
    private joinExistingMeeting(roomName: string): void {
        // Use the roomName directly for Jitsi
        console.log('Joining existing meeting with room:', roomName);
        this.initCameraSelection(roomName);
    }
}
