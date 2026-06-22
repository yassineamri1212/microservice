export const environment = {
    production: false,
    keycloak: {
        // Replace these values with your Keycloak configuration
        url: 'http://localhost:8086',
        realm: 'esprit',
        clientId: 'test',
        postLogoutRedirectUri: 'http://localhost:4200/login', // Adjust to your app's redirect URI

    }
    ,
    admin: {
        username: 'admin',
        password: 'admin',
        clientId: 'admin',
    },
};
