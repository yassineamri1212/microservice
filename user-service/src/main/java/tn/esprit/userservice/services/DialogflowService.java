package tn.esprit.userservice.services;

import com.google.api.gax.core.FixedCredentialsProvider;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.dialogflow.v2.*;
import org.springframework.stereotype.Service;

import java.io.FileInputStream;
import java.io.IOException;
import java.util.UUID;

@Service
public class DialogflowService {

    private static final String PROJECT_ID = "akrempfeprojectchat-kcfl";

    public String detectIntentTexts(String text) throws IOException {
        SessionsSettings sessionsSettings = SessionsSettings.newBuilder()
                .setCredentialsProvider(
                        FixedCredentialsProvider.create(
                                GoogleCredentials.fromStream(new FileInputStream("C:/Users/akrem/Desktop/akrempfeprojectchat-kcfl-0f7e440f9c54.json"))))
                .build();
        try (SessionsClient sessionsClient = SessionsClient.create(sessionsSettings)) {
            SessionName session = SessionName.of(PROJECT_ID,UUID.randomUUID().toString() );

            TextInput.Builder textInput = TextInput.newBuilder().setText(text).setLanguageCode("fr");

            QueryInput queryInput = QueryInput.newBuilder().setText(textInput).build();

            DetectIntentResponse response = sessionsClient.detectIntent(session, queryInput);
            return response.getQueryResult().getFulfillmentText();
        }
    }
}