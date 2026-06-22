import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Signature} from "./Model/signature";
import {Usertype} from "./Model/usertype";
import {user} from "./mock-api/common/user/data";
import {Role} from "./Model/role";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private httpClient: HttpClient) {
  }
  private baseURL = "https://stb-stages.com/user-service/api/service/user";
  getUserList(): Observable<Usertype[]>{
    return this.httpClient.get<Usertype[]>(`${this.baseURL+'/GetUsers'}`);
  }
  createuser(usertype: Usertype): Observable<Usertype>{
    return this.httpClient.post<Usertype>(`${this.baseURL+'/CreateUser'}/${usertype.password}`, usertype);
  }
    createUser2(user: Usertype, role: string): Observable<any> {
        const url = `/api/CreateUser/${user.password}/${role}`;
        return this.httpClient.post<Usertype>(`${this.baseURL+'/CreateUser'}/${user.password}/${role}`, user);

    }
  getuserById(id: bigint): Observable<Usertype>{
    return this.httpClient.get<Usertype>(`${this.baseURL+"/GetUserById"}/${id}`);
  }
    getuserById2(id: string): Observable<Usertype>{
        return this.httpClient.get<Usertype>(`${this.baseURL+"/GetUserById"}/${id}`);
    }
  updateuser( usertype: Usertype,id: String): Observable<String>{
    return this.httpClient.put<String>(`${this.baseURL+'/UpdateUser'}/${id}`, usertype);
  }
  deleteuser(id: bigint): Observable<Usertype>{
    return this.httpClient.delete<Usertype>(`${this.baseURL+'/DeleteUser'}/${id}`);
  }
  sendMessage(message: string): Observable<string> {
        return this.httpClient.post<string>("http://localhost:8989/"+'query', { message });
  }
  getRolesForUser(userId: string): Observable<Role[]> {
    return this.httpClient.get<Role[]>(`${this.baseURL+'/GetUserroleById'}/${userId}`);
  }
    getUserByEmail(email: string): Observable<Usertype> {
        return this.httpClient.get<Usertype>(`${this.baseURL}/GetUserByEmail/${email}`);
    }

    getChatHistory(sender: string, receiver: string): Observable<any[]> {
        return this.httpClient.get<any[]>(`http://localhost:8088/api/service/chat/GetChatHistory/${sender}/${receiver}`);
    }
    getUsersByRole(roleName: string): Observable<Usertype[]> {
        return this.httpClient.get<Usertype[]>(`https://stb-stages.com/user-service/api/service/user/GetUsersByRole/${roleName}`);


    }


    createCheckoutSession(priceId: string): Observable<{ sessionId: string }> {
        return this.httpClient.post<{ sessionId: string }>(
            `http://localhost:8086/api/payment/create-checkout-session`,
            priceId
        );
    }

    updateEnabledStatus(userId: string, enabled: boolean): Observable<any> {
        return this.httpClient.put(`https://stb-stages.com/user-service/api/service/user/UpdateEnabledStatus/${userId}`, enabled);
    }

    updateUserRole(userId: string, roleName: string): Observable<any> {
        return this.httpClient.put(`${this.baseURL}/UpdateUserRole/${userId}/${roleName}`, {});
    }

    // Send 4-digit verification code to user's email and save in user attributes
    sendVerificationCodeAndSave(email: string): Observable<any> {
        return this.httpClient.post(`${this.baseURL}/SendVerificationCode/${email}`, {});
    }

    // Verify 4-digit code and reset password
    verifyCodeAndResetPassword(email: string, code: string, newPassword: string): Observable<any> {
        const body = {
            email: email,
            verificationCode: code,
            newPassword: newPassword
        };
        return this.httpClient.post(`${this.baseURL}/VerifyCodeAndResetPassword`, body);
    }

}
