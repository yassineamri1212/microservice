import { Component, AfterViewInit, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import flatpickr from 'flatpickr';
import { CommonModule } from "@angular/common";
import { MeetServiceService, Meeting, MeetingRequest } from "../../meet-service.service";
import { Router } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { ClasseService } from "../../classe.service";
import { UserService } from "../../user.service";
import { Usertype } from "../../Model/usertype";
import { Role } from "../../Model/role";
import { NotificationserviceService, NotificationType, MeetingNotificationRequest } from "../../notificationservice.service";

// Interface for user with role information
interface UserWithRole {
    user: Usertype;
    roles: Role[];
    primaryRole?: string;
    avatar?: string;
    hasAvatarImage?: boolean;
}

@Component({
    selector: 'app-meeting-calendar',
    templateUrl: './meeting-calendar.component.html',
    styleUrls: ['./meeting-calendar.component.scss'],
    imports: [CommonModule, FormsModule],
    standalone: true,
})
export class MeetingCalendarComponent implements AfterViewInit, OnInit {
    selectedDate: string = '';
    meetings: Meeting[] = [];
    filteredMeetings: Meeting[] = [];
    
    // Form fields for new meeting
    newMeetingTopic: string = '';
    newMeetingDescription: string = '';
    newMeetingDuration: number = 60;
    newMeetingTime: string = ''; // Will be set in ngOnInit
    selectedClassId: number | null = null;
    
    // Participant management
    isPublicMeeting: boolean = true;
    participantEmails: string = '';
    selectedParticipants: string[] = [];
    availableUsers: UserWithRole[] = []; // Dynamic user list with roles
    isLoadingUsers: boolean = false;
    
    // Current user information
    currentUserEmail: string = '';
    currentUserName: string = '';
    currentUserRole: string = 'User'; // Track current user's role
    
    classes: { id: number, name: string }[] = [];
    showModal: boolean = false;
    isLoading: boolean = false;
    error: string = '';

    constructor(
        private router: Router, 
        private meetService: MeetServiceService, 
        private cdRef: ChangeDetectorRef, 
        private ngZone: NgZone,
        private classeservice: ClasseService,
        private userService: UserService,
        private notificationService: NotificationserviceService
    ) {}

    ngOnInit(): void {
        this.newMeetingTime = this.getCurrentTime(); // Initialize with current time
        this.initializeCurrentUser(); // Initialize current user info
        this.loadMeetings();
        this.loadClasses();
        this.loadUsers();
    }

    // Initialize current user information from sessionStorage
    private initializeCurrentUser(): void {
        this.currentUserEmail = sessionStorage.getItem('email') || '';
        this.currentUserName = this.getCurrentUserDisplayName();
        
        // Load current user's role
        this.loadCurrentUserRole();
        
        console.log('Current user initialized:', {
            email: this.currentUserEmail,
            name: this.currentUserName
        });
    }

    ngAfterViewInit(): void {
        const calendarElement = document.querySelector('#calendar') as HTMLElement;

        if (calendarElement) {
            flatpickr(calendarElement, {
                inline: true,
                enableTime: false,
                dateFormat: 'Y-m-d',
                defaultDate: new Date(),
                appendTo: calendarElement,
                onChange: (selectedDates: Date[], dateStr: string) => {
                    this.selectedDate = dateStr;
                    this.filterMeetings();
                },
            });

            this.ngZone.run(() => {
                this.selectedDate = flatpickr.formatDate(new Date(), 'Y-m-d');
                this.filterMeetings();
                this.cdRef.detectChanges();
            });
        }
    }

    // Fetch the meetings from the backend
    loadMeetings(): void {
        this.isLoading = true;
        this.meetService.getScheduledMeetings().subscribe({
            next: (meetings: Meeting[]) => {
                // Filter out any invalid meetings
                this.meetings = meetings.filter(meeting => 
                    meeting && 
                    meeting.startTime && 
                    typeof meeting.startTime === 'string'
                );
                this.filterMeetings();
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading meetings:', error);
                this.error = 'Failed to load meetings';
                this.meetings = []; // Reset to empty array on error
                this.filteredMeetings = [];
                this.isLoading = false;
            }
        });
    }

    // Fetch the list of classes from the backend
    loadClasses(): void {
        this.classeservice.getAllClasses().subscribe({
            next: (classes: { id: number, name: string }[]) => {
                this.classes = classes;
            },
            error: (error) => {
                console.error('Error loading classes:', error);
            }
        });
    }

    // Fetch all users with their roles
    loadUsers(): void {
        this.isLoadingUsers = true;
        this.userService.getUserList().subscribe({
            next: (users: Usertype[]) => {
                // For each user, get their roles
                const userPromises = users.map(user => 
                    this.userService.getRolesForUser(user.id).subscribe({
                        next: (roles: Role[]) => {
                            const userWithRole: UserWithRole = {
                                user: user,
                                roles: roles,
                                primaryRole: this.getPrimaryRole(roles),
                                avatar: this.generateAvatarInitials(user),
                                hasAvatarImage: this.hasAvatarImage(user)
                            };
                            this.availableUsers.push(userWithRole);
                        },
                        error: (error) => {
                            console.error('Error loading roles for user:', user.email, error);
                            // Add user without roles if role loading fails
                            const userWithRole: UserWithRole = {
                                user: user,
                                roles: [],
                                primaryRole: 'User',
                                avatar: this.generateAvatarInitials(user),
                                hasAvatarImage: this.hasAvatarImage(user)
                            };
                            this.availableUsers.push(userWithRole);
                        }
                    })
                );
                this.isLoadingUsers = false;
            },
            error: (error) => {
                console.error('Error loading users:', error);
                this.isLoadingUsers = false;
            }
        });
    }

    // Load current user's role
    private loadCurrentUserRole(): void {
        if (!this.currentUserEmail) {
            this.currentUserRole = 'User';
            return;
        }

        // Find current user in available users or load directly
        const currentUser = this.availableUsers.find(u => u.user.email === this.currentUserEmail);
        if (currentUser) {
            this.currentUserRole = currentUser.primaryRole || 'User';
        } else {
            // Load user data directly if not in available users yet
            this.userService.getUserList().subscribe({
                next: (users: Usertype[]) => {
                    const user = users.find(u => u.email === this.currentUserEmail);
                    if (user) {
                        this.userService.getRolesForUser(user.id).subscribe({
                            next: (roles: Role[]) => {
                                this.currentUserRole = this.getPrimaryRole(roles);
                            },
                            error: () => {
                                this.currentUserRole = 'User';
                            }
                        });
                    } else {
                        this.currentUserRole = 'User';
                    }
                },
                error: () => {
                    this.currentUserRole = 'User';
                }
            });
        }
    }

    // Send meeting invitation notifications to all participants
    private sendMeetingInvitationNotifications(meeting: Meeting, participantEmails: string[]): void {
        const meetingDate = this.formatMeetingDate(meeting.startTime);
        const meetingTime = this.formatMeetingTime(meeting.startTime);
        
        let notificationRecipients: string[] = [];
        
        if (meeting.isPublic) {
            // For public meetings, notify all available users except the organizer
            notificationRecipients = this.availableUsers
                .map(userWithRole => userWithRole.user.email)
                .filter(email => email && email !== this.currentUserEmail);
        } else {
            // For private meetings, only notify specified participants except the organizer
            notificationRecipients = participantEmails.filter(email => 
                email.trim() && email.trim() !== this.currentUserEmail
            );
        }

        const meetingType = meeting.isPublic ? 'public' : 'private';
        const baseMessage = meeting.isPublic 
            ? `A new public meeting "${meeting.topic}" has been scheduled for ${meetingDate} at ${meetingTime}. Anyone can join this meeting. Organized by ${this.currentUserName} (${this.currentUserRole}).`
            : `You have been invited to a meeting "${meeting.topic}" scheduled for ${meetingDate} at ${meetingTime}. Organized by ${this.currentUserName} (${this.currentUserRole}).`;

        notificationRecipients.forEach(recipientEmail => {
            const notification: MeetingNotificationRequest = {
                userEmail: recipientEmail.trim(),
                title: `Meeting ${meeting.isPublic ? 'Announcement' : 'Invitation'}: ${meeting.topic}`,
                message: baseMessage,
                senderEmail: this.currentUserEmail || 'system@stb.com.tn',
                senderName: this.currentUserName || 'System',
                notificationType: 'info',
                actionUrl: `/meetings/${meeting.roomName}`,
                icon: 'fa-calendar',
                priority: 'normal'
            };

            console.log('Sending notification:', notification);

            this.notificationService.sendMeetingNotification(notification).subscribe({
                next: (response) => {
                    console.log(`Meeting ${meetingType} notification sent to ${recipientEmail}:`, response);
                },
                error: (error) => {
                    console.error(`Failed to send meeting ${meetingType} notification to ${recipientEmail}:`, error);
                    console.error('Error details:', error.error);
                }
            });
        });

        console.log(`Meeting ${meetingType} notifications sent to ${notificationRecipients.length} recipients`);
    }

    // Helper method to format meeting date for notifications
    private formatMeetingDate(startTime: string): string {
        if (!startTime || typeof startTime !== 'string') {
            return 'Invalid date';
        }
        
        try {
            const date = new Date(startTime);
            if (isNaN(date.getTime())) {
                return 'Invalid date';
            }
            return date.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        } catch (error) {
            console.warn('Error formatting meeting date:', startTime, error);
            return 'Invalid date';
        }
    }

    filterMeetings(): void {
        this.filteredMeetings = this.meetings.filter((meeting) => {
            // Check if meeting and startTime exist and are valid
            if (!meeting || !meeting.startTime || typeof meeting.startTime !== 'string') {
                return false;
            }
            
            try {
                const meetingDate = meeting.startTime.split('T')[0];
                const isCorrectDate = meetingDate === this.selectedDate;
                
                // Only show meetings where current user is a participant
                const isUserParticipant = this.isCurrentUserParticipant(meeting);
                
                return isCorrectDate && isUserParticipant;
            } catch (error) {
                console.warn('Error parsing meeting date:', meeting, error);
                return false;
            }
        });
    }

    // Check if current user is a participant in the meeting
    private isCurrentUserParticipant(meeting: Meeting): boolean {
        if (!this.currentUserEmail) {
            return false; // If no current user email, don't show any meetings
        }

        // Check if user is the creator
        if (meeting.createdBy === this.currentUserEmail) {
            return true;
        }

        // Check if it's a public meeting (everyone can join)
        if (meeting.isPublic) {
            return true;
        }

        // Check if user is in the participants list
        if (meeting.participants && typeof meeting.participants === 'string') {
            const participantEmails = meeting.participants.split(',')
                .map(email => email.trim())
                .filter(email => email);
            
            return participantEmails.includes(this.currentUserEmail);
        }

        return false;
    }

    joinMeeting(roomName: string): void {
        this.router.navigate(['/meetings', roomName]);
    }

    // Show modal to add a new meeting
    showAddMeetingModal(): void {
        if (this.selectedDate) {
            this.showModal = true;
            this.resetForm();
            // Automatically add current user to participants for private meetings
            this.autoAddCurrentUser();
        }
    }

    // Close the modal
    closeModal(): void {
        this.showModal = false;
        this.resetForm();
    }

    // Reset form fields
    resetForm(): void {
        this.newMeetingTopic = '';
        this.newMeetingDescription = '';
        this.newMeetingDuration = 60;
        this.newMeetingTime = this.getCurrentTime();
        this.selectedClassId = null;
        this.isPublicMeeting = true;
        this.participantEmails = '';
        this.selectedParticipants = [];
        this.error = '';
        
        // Note: Current user will be auto-added when switching to private meeting
    }

    // Submit the new meeting form
    submitNewMeeting(): void {
        if (this.newMeetingTopic && this.selectedDate && this.newMeetingDescription) {
            this.isLoading = true;
            
            // Combine date and time for startTime
            const startTime = `${this.selectedDate}T${this.newMeetingTime}:00`;
            
            // Calculate endTime based on duration
            const startDateTime = new Date(startTime);
            const endDateTime = new Date(startDateTime.getTime() + (this.newMeetingDuration * 60 * 1000));
            const endTime = endDateTime.toISOString().slice(0, 19); // Format: YYYY-MM-DDTHH:mm:ss
            
            // Prepare participants list with current user automatically included
            let participants = '';
            let allParticipants: string[] = [];
            
            // Always include current user email if available
            if (this.currentUserEmail) {
                allParticipants.push(this.currentUserEmail);
            }
            
            if (!this.isPublicMeeting) {
                // Add manually entered participants
                if (this.participantEmails.trim()) {
                    const manualParticipants = this.participantEmails.trim().split(',')
                        .map(email => email.trim())
                        .filter(email => email && email !== this.currentUserEmail); // Avoid duplicates
                    allParticipants = allParticipants.concat(manualParticipants);
                }
                
                // Add selected participants from user list
                if (this.selectedParticipants.length > 0) {
                    const selectedEmails = this.selectedParticipants.filter(email => email !== this.currentUserEmail); // Avoid duplicates
                    allParticipants = allParticipants.concat(selectedEmails);
                }
                
                // Remove duplicates and create final participants string
                allParticipants = [...new Set(allParticipants)];
                participants = allParticipants.join(',');
            } else {
                // For public meetings, still include current user in participants for tracking
                participants = this.currentUserEmail;
            }
            
            const meetingRequest: MeetingRequest = {
                topic: this.newMeetingTopic,
                description: this.newMeetingDescription,
                startTime: startTime,
                endTime: endTime,
                maxParticipants: 50, // Default value
                createdBy: this.currentUserEmail || 'admin@company.com', // Use current user email
                participants: participants,
                isPublic: this.isPublicMeeting
            };

            this.meetService.createMeeting(meetingRequest).subscribe({
                next: (meeting: Meeting) => {
                    console.log('Meeting created successfully:', meeting);
                    
                    // Send invitation notifications to participants
                    // For public meetings, allParticipants will contain only the organizer
                    // For private meetings, allParticipants will contain all participants including organizer
                    this.sendMeetingInvitationNotifications(meeting, allParticipants);
                    
                    this.closeModal();
                    this.loadMeetings();
                    this.isLoading = false;
                },
                error: (error) => {
                    console.error('Error creating meeting:', error);
                    this.error = 'Failed to create meeting. Please try again.';
                    this.isLoading = false;
                }
            });
        } else {
            this.error = 'Please fill in all required fields.';
        }
    }

    // Generate a unique room name
    private generateRoomName(topic: string): string {
        const cleanTopic = topic.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const timestamp = Date.now();
        return `${cleanTopic}-${timestamp}`;
    }

    // Format date for display
    // Format date for display
    formatMeetingTime(startTime: string): string {
        if (!startTime || typeof startTime !== 'string') {
            return 'Invalid time';
        }
        
        try {
            const date = new Date(startTime);
            if (isNaN(date.getTime())) {
                return 'Invalid time';
            }
            return date.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
            });
        } catch (error) {
            console.warn('Error formatting meeting time:', startTime, error);
            return 'Invalid time';
        }
    }

    // Check if meeting is starting soon (within 15 minutes)
    isMeetingStartingSoon(startTime: string): boolean {
        if (!startTime || typeof startTime !== 'string') {
            return false;
        }
        
        try {
            const meetingTime = new Date(startTime);
            if (isNaN(meetingTime.getTime())) {
                return false;
            }
            const now = new Date();
            const diffMinutes = (meetingTime.getTime() - now.getTime()) / (1000 * 60);
            return diffMinutes <= 15 && diffMinutes >= 0;
        } catch (error) {
            console.warn('Error checking meeting start time:', startTime, error);
            return false;
        }
    }

    // Get current time formatted as HH:mm
    private getCurrentTime(): string {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    // Toggle meeting visibility
    toggleMeetingVisibility(): void {
        if (this.isPublicMeeting) {
            // Clear participants when switching to public
            this.selectedParticipants = [];
            this.participantEmails = '';
        } else {
            // Automatically add current user when switching to private
            this.autoAddCurrentUser();
        }
    }

    // Automatically add current user to participants
    private autoAddCurrentUser(): void {
        if (this.currentUserEmail && !this.isPublicMeeting) {
            // Add current user if not already in the list
            if (!this.selectedParticipants.includes(this.currentUserEmail)) {
                this.selectedParticipants.push(this.currentUserEmail);
                console.log('Current user automatically added to participants:', this.currentUserEmail);
            }
        }
    }

    // Add participant to selected list
    addParticipant(userWithRole: UserWithRole): void {
        const userEmail = userWithRole.user.email;
        if (!this.selectedParticipants.includes(userEmail)) {
            this.selectedParticipants.push(userEmail);
        } else {
            // Remove if already selected (but don't remove current user)
            if (userEmail !== this.currentUserEmail) {
                this.removeParticipant(userEmail);
            }
        }
    }

    // Remove participant from selected list
    removeParticipant(participantEmail: string): void {
        // Prevent removing current user (they should always be included)
        if (participantEmail === this.currentUserEmail) {
            console.log('Cannot remove current user from participants - they are the organizer');
            return;
        }
        this.selectedParticipants = this.selectedParticipants.filter(p => p !== participantEmail);
    }

    // Helper method to get primary role from roles array
    getPrimaryRole(roles: Role[]): string {
        if (!roles || roles.length === 0) return 'User';
        
        // Priority order for roles
        const rolePriority = ['admin', 'teacher', 'instructor', 'student', 'user'];
        
        for (const priority of rolePriority) {
            const foundRole = roles.find(role => 
                role.name.toLowerCase().includes(priority)
            );
            if (foundRole) {
                return this.capitalizeFirstLetter(priority);
            }
        }
        
        // Return first role if no priority match
        return this.capitalizeFirstLetter(roles[0].name);
    }

    // Helper method to generate avatar initials
    generateAvatar(user: Usertype): string {
        if (!user.firstName && !user.lastName) {
            return user.email.charAt(0).toUpperCase();
        }
        
        const firstInitial = user.firstName ? user.firstName.charAt(0).toUpperCase() : '';
        const lastInitial = user.lastName ? user.lastName.charAt(0).toUpperCase() : '';
        
        return firstInitial + lastInitial;
    }

    // Helper method to generate avatar initials (alias for consistency)
    generateAvatarInitials(user: Usertype): string {
        return this.generateAvatar(user);
    }

    // Check if user has an avatar image
    hasAvatarImage(user: Usertype): boolean {
        return !!(user.attributes?.avatar && user.attributes.avatar.length > 0);
    }

    // Get avatar image path
    getAvatarImagePath(user: Usertype): string {
        if (this.hasAvatarImage(user)) {
            return `assets/images/avatars/${user.attributes!.avatar![0]}`;
        }
        return '';
    }

    // Helper method to capitalize first letter
    private capitalizeFirstLetter(string: string): string {
        return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    }

    // Check if user is selected as participant
    isUserSelected(userEmail: string): boolean {
        return this.selectedParticipants.includes(userEmail);
    }

    // Get role color for UI
    getRoleColor(role: string): string {
        switch (role.toLowerCase()) {
            case 'admin': return '#f44336'; // Red
            case 'teacher': case 'instructor': return '#2196f3'; // Blue
            case 'student': return '#4caf50'; // Green
            default: return '#9e9e9e'; // Grey
        }
    }

    // Format selected date for display
    formatSelectedDate(dateStr: string): string {
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        } catch (error) {
            return dateStr;
        }
    }

    // Get day of week for selected date
    getDayOfWeek(dateStr: string): string {
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-US', { weekday: 'short' });
        } catch (error) {
            return '';
        }
    }

    // Check if meeting is in the past
    isPastMeeting(startTime: string): boolean {
        if (!startTime || typeof startTime !== 'string') {
            return false;
        }
        
        try {
            const meetingTime = new Date(startTime);
            const now = new Date();
            return meetingTime.getTime() < now.getTime();
        } catch (error) {
            return false;
        }
    }

    // Calculate meeting duration
    calculateDuration(startTime: string, endTime: string): string {
        try {
            const start = new Date(startTime);
            const end = new Date(endTime);
            const diffMs = end.getTime() - start.getTime();
            const diffMinutes = Math.floor(diffMs / (1000 * 60));
            
            if (diffMinutes < 60) {
                return `${diffMinutes} min`;
            } else {
                const hours = Math.floor(diffMinutes / 60);
                const minutes = diffMinutes % 60;
                return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
            }
        } catch (error) {
            return 'N/A';
        }
    }

    // Get participant count from participants string
    getParticipantCount(participants: string): number {
        if (!participants || !participants.trim()) {
            return 0;
        }
        return participants.split(',').filter(p => p.trim()).length;
    }

    // Copy meeting link to clipboard
    copyMeetingLink(roomName: string): void {
        const meetingUrl = `${window.location.origin}/meetings/${roomName}`;
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(meetingUrl).then(() => {
                console.log('Meeting link copied to clipboard');
                // You could show a toast notification here
            }).catch(err => {
                console.error('Failed to copy meeting link:', err);
            });
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = meetingUrl;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            console.log('Meeting link copied to clipboard (fallback)');
        }
    }

    // Get display name for current user
    getCurrentUserDisplayName(): string {
        const firstName = sessionStorage.getItem('firstName') || '';
        const lastName = sessionStorage.getItem('lastName') || '';
        const username = sessionStorage.getItem('username') || '';
        
        if (firstName && lastName) {
            return `${firstName} ${lastName}`;
        } else if (username) {
            return username;
        } else {
            return 'Current User';
        }
    }

    // Get current user's role in a specific meeting
    getCurrentUserRoleInMeeting(meeting: Meeting): string {
        if (!this.currentUserEmail) {
            return 'Unknown';
        }

        // Check if user is the creator/organizer
        if (meeting.createdBy === this.currentUserEmail) {
            return 'Organizer';
        }

        // Check if it's a public meeting
        if (meeting.isPublic) {
            return 'Participant (Public)';
        }

        // Check if user is in the participants list
        if (meeting.participants && typeof meeting.participants === 'string') {
            const participantEmails = meeting.participants.split(',')
                .map(email => email.trim())
                .filter(email => email);
            
            if (participantEmails.includes(this.currentUserEmail)) {
                return 'Invited Participant';
            }
        }

        return 'Participant';
    }

    // Get role color for meeting role
    getMeetingRoleColor(meeting: Meeting): string {
        const role = this.getCurrentUserRoleInMeeting(meeting);
        switch (role) {
            case 'Organizer': return '#667eea';
            case 'Invited Participant': return '#48bb78';
            case 'Participant (Public)': return '#38b2ac';
            default: return '#9e9e9e';
        }
    }

    // Check if current user can delete a meeting (is the organizer)
    canDeleteMeeting(meeting: Meeting): boolean {
        return this.currentUserEmail === meeting.createdBy;
    }

    // Delete meeting
    deleteMeeting(meeting: Meeting): void {
        if (!this.canDeleteMeeting(meeting)) {
            alert('You can only delete meetings you created.');
            return;
        }

        const confirmMessage = `Are you sure you want to delete the meeting "${meeting.topic}"?\n\nThis action cannot be undone.`;
        
        if (confirm(confirmMessage)) {
            this.meetService.deleteMeeting(meeting.id!)
                .subscribe({
                    next: () => {
                        // Remove the meeting from the local array
                        this.meetings = this.meetings.filter(m => m.id !== meeting.id);
                        this.filterMeetings();
                        
                        // Show success message
                        alert('Meeting deleted successfully!');
                    },
                    error: (error) => {
                        console.error('Error deleting meeting:', error);
                        alert('Failed to delete meeting. Please try again.');
                    }
                });
        }
    }
}
