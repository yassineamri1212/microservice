import {AfterViewInit, Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import {Signature} from "../../../Model/signature";
import {SignatureServiceService} from "../../../signature-service.service";
import {Router} from "@angular/router";
import {UserService} from "../../../user.service";
import {Usertype} from "../../../Model/usertype";
import {CdkScrollable} from "@angular/cdk/overlay";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatTableModule} from "@angular/material/table";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatSelectModule} from "@angular/material/select";
import {MatSnackBarModule, MatSnackBar} from "@angular/material/snack-bar";
import {FormsModule} from "@angular/forms";
import {ServiceStageService} from "../../../service-stage.service";
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-showusers',
  standalone: true,
  imports: [CommonModule, CdkScrollable, MatButtonModule, MatIconModule, MatTableModule,
           MatFormFieldModule, MatInputModule, MatSelectModule, MatSnackBarModule, FormsModule],
  templateUrl: './showusers.component.html',
  styleUrl: './showusers.component.scss'
})
export class ShowusersComponent implements OnInit,AfterViewInit{
  displayedColumns: string[] = [ 'username', 'firstName', 'lastName', 'email','enable','role', 'action'];
  ELEMENT_DATA!: Usertype[];
  users!: Usertype[];
  filteredUsers!: Usertype[];

  dataSource= this.ELEMENT_DATA;

  // Filter properties
  searchTerm: string = '';
  selectedRole: string = '';
  selectedStatus: string = '';
  showFilters: boolean = false;
  
  // Cache the current user role to avoid repeated session storage access
  private currentUserRole: string | null = null;
  
  // Cached display values to avoid method calls in template
  public usersDisplayContext: string = 'Users';
  public usersFilterDescription: string = 'Showing users';
  public addUserButtonText: string = 'Add User';
  public availableRoles: Array<{value: string, label: string}> = [];

  statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'true', label: 'Enabled' },
    { value: 'false', label: 'Disabled' }
  ];

  constructor(private userService: UserService,
              private router: Router,private stageservice: ServiceStageService,
              private snackBar: MatSnackBar) { }
  gotoadduser(){
    this.router.navigate(['User/adduser']);
  }
  ngOnInit(): void {
    this.initializeDisplayValues();
    this.getusers();
  }

  // Initialize cached display values
  private initializeDisplayValues(): void {
    this.currentUserRole = this.getCurrentUserRole();
    
    if (this.currentUserRole === 'bank_officer') {
      this.usersDisplayContext = 'All Users';
      this.usersFilterDescription = 'Showing all users in the system (Bank and CNSS)';
      this.addUserButtonText = 'Add Bank Agent';
      this.availableRoles = [
        { value: '', label: 'All Roles' },
        { value: 'bank_agent', label: 'Bank Agent' },
        { value: 'bank_officer', label: 'Bank Officer' },
        { value: 'cnss_agent', label: 'CNSS Agent' },
        { value: 'cnss_officer', label: 'CNSS Officer' }
      ];
    } else if (this.currentUserRole === 'cnss_officer') {
      this.usersDisplayContext = 'CNSS Users';
      this.usersFilterDescription = 'Showing only CNSS agents and officers';
      this.addUserButtonText = 'Add CNSS Agent';
      this.availableRoles = [
        { value: '', label: 'All Roles' },
        { value: 'cnss_agent', label: 'CNSS Agent' },
        { value: 'cnss_officer', label: 'CNSS Officer' }
      ];
    } else {
      this.usersDisplayContext = 'Users';
      this.usersFilterDescription = 'Showing users';
      this.addUserButtonText = 'Add User';
      this.availableRoles = [
        { value: '', label: 'All Roles' },
        { value: 'bank_agent', label: 'Bank Agent' },
        { value: 'bank_officer', label: 'Bank Officer' },
        { value: 'cnss_agent', label: 'CNSS Agent' },
        { value: 'cnss_officer', label: 'CNSS Officer' }
      ];
    }
  }

  ngAfterViewInit(): void {
    this.dataSource = this.filteredUsers || this.users;
  }

  // Get current user's role
  private getCurrentUserRole(): string | null {
    const rolesString = sessionStorage.getItem('roles');
    
    if (rolesString) {
      try {
        const resourceAccess = JSON.parse(rolesString);
        const roles = resourceAccess.angular?.roles || [];

        if (roles.includes('bank_officer')) {
          return 'bank_officer';
        } else if (roles.includes('cnss_officer')) {
          return 'cnss_officer';
        }
      } catch (error) {
        console.error('Error parsing roles from session storage:', error);
      }
    }
    return null;
  }

  // Apply role-based filtering to users
  private applyRoleBasedFiltering(users: Usertype[]): Usertype[] {
    // Use cached role if available, otherwise get it
    const currentUserRole = this.currentUserRole || this.getCurrentUserRole();

    if (currentUserRole === 'bank_officer') {
      // Bank officers can see all users
      return users;
    } else if (currentUserRole === 'cnss_officer') {
      // CNSS officers can only see CNSS agents and officers
      const filteredUsers = users.filter(user => {
        const userRole = user.realmRoles?.name;
        return userRole === 'cnss_agent' || userRole === 'cnss_officer';
      });
      console.log('CNSS officer - filtered users count:', filteredUsers.length);
      return filteredUsers;
    }

    // Default: return all users (fallback)
    return users;
  }

  private getusers(){
    console.log('Current user role:', this.currentUserRole);

    this.userService.getUserList().subscribe(data => {
      // Create an array of role requests for all users
      const roleRequests = data.map(item => 
        this.userService.getRolesForUser(item.id)
      );

      // Wait for all role requests to complete
      forkJoin(roleRequests).subscribe(rolesResults => {
        // Assign roles to each user
        data.forEach((item, index) => {
          item.realmRoles = rolesResults[index][0];
        });

        this.users = data;

        // Now apply role-based filtering with complete role data
        const roleFilteredUsers = this.applyRoleBasedFiltering(data);
        this.filteredUsers = roleFilteredUsers;
        this.dataSource = roleFilteredUsers;

        this.applyFilters();
        console.log('Total users loaded:', data.length);
        console.log('Users visible to current role:', roleFilteredUsers.length);
      });
    });
  }

  applyFilters() {
    if (!this.users) return;

    // Start with role-based filtered users
    const roleFilteredUsers = this.applyRoleBasedFiltering(this.users);

    this.filteredUsers = roleFilteredUsers.filter(user => {
      // Search term filter
      const matchesSearch = !this.searchTerm ||
        user.username?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.firstName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(this.searchTerm.toLowerCase());

      // Role filter
      const matchesRole = !this.selectedRole ||
        user.realmRoles?.name === this.selectedRole;

      // Status filter
      const matchesStatus = !this.selectedStatus ||
        user.enabled?.toString() === this.selectedStatus;

      return matchesSearch && matchesRole && matchesStatus;
    });

    this.dataSource = this.filteredUsers;
  }

  onSearchChange() {
    this.applyFilters();
  }

  onRoleFilterChange() {
    this.applyFilters();
  }

  onStatusFilterChange() {
    this.applyFilters();
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedRole = '';
    this.selectedStatus = '';
    this.applyFilters();
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  toggleUserStatus(user: Usertype) {
    const newStatus = !user.enabled;
    const statusText = newStatus ? 'enabled' : 'disabled';

    this.userService.updateEnabledStatus(user.id, newStatus).subscribe({
      next: (response) => {
        console.log('Status update response:', response);
        user.enabled = newStatus;
        const message = response?.message || `User ${statusText} successfully`;
        this.snackBar.open(message, 'Close', { duration: 3000 });
        // Update the data source
        this.dataSource = [...this.filteredUsers];
      },
      error: (error) => {
        console.error('Error updating user status:', error);
        let errorMessage = `Error ${newStatus ? 'enabling' : 'disabling'} user`;

        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.error && typeof error.error === 'string') {
          errorMessage = error.error;
        } else if (error.message) {
          errorMessage = error.message;
        }

        this.snackBar.open(errorMessage, 'Close', { duration: 3000 });
      }
    });
  }



  updatesignature(id: bigint){
    this.router.navigate(['User/edituser', id]);
  }

  deleteUser(id: bigint){
    this.userService.deleteuser(id).subscribe( data => {
      console.log(data);
      this.getusers();
    })
  }

  editUser(user: Usertype){
    this.router.navigate(['User/edituser', user.id]);
  }

  editUserRole(user: Usertype){
    this.router.navigate(['editrole', user.id]);
  }

  // Check if the current user can add users (Officers only)
  canAddUsers(): boolean {
    const rolesString = sessionStorage.getItem('roles');
    if (rolesString) {
      try {
        const resourceAccess = JSON.parse(rolesString);
        const roles = resourceAccess.angular?.roles || [];
        return roles.includes('bank_officer') || roles.includes('cnss_officer');
      } catch (error) {
        console.error('Error parsing roles from session storage:', error);
        return false;
      }
    }
    return false;
  }

  // Get the text for the Add User button based on current role
  getAddUserButtonText(): string {
    return this.addUserButtonText;
  }

  // Navigate to add user page
  navigateToAddUser(): void {
    this.router.navigate(['/User/adduser']);
  }
}
