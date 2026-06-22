export class Usertype {
    self: string | null;
    id: string;
    password: string | null;

    origin: string | null;
    createdTimestamp: number;
    username: string;
    enabled: boolean;
    totp: boolean;
    emailVerified: boolean;
    firstName: string;
    lastName: string;
    email: string;
    federationLink: string | null;
    serviceAccountClientId: string | null;
    attributes: {[key: string]: string[]};
    credentials: any | null;
    disableableCredentialTypes: any[];
    requiredActions: any[];
    federatedIdentities: any | null;
    realmRoles: any | null;
    clientRoles: any | null;
    clientConsents: any | null;
    notBefore: number;
    applicationRoles: any | null;
    socialLinks: any | null;
    groups: any | null;
    stage: any | null;
    access: {
        manageGroupMembership: boolean;
        view: boolean;
        mapRoles: boolean;
        impersonate: boolean;
        manage: boolean;
    };
    userProfileMetadata: any | null;

}
