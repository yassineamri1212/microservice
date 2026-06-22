package tn.esprit.servicemeet;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class ErrorResponse {
    private String code;
    private String message;
    private int status;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime timestamp;

    // Constructor with single message (existing)
    public ErrorResponse(String error) {
        this.code = "ERROR";
        this.message = error;
        this.status = 500;
        this.timestamp = LocalDateTime.now();
    }

    // Constructor with all fields (for GlobalExceptionHandler)
    public ErrorResponse(String code, String message, int status, LocalDateTime timestamp) {
        this.code = code;
        this.message = message;
        this.status = status;
        this.timestamp = timestamp;
    }
}
