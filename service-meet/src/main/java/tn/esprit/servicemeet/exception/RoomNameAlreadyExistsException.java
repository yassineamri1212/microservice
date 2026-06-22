package tn.esprit.servicemeet.exception;

public class RoomNameAlreadyExistsException extends RuntimeException {
    public RoomNameAlreadyExistsException(String message) {
        super(message);
    }
    
    public RoomNameAlreadyExistsException(String message, Throwable cause) {
        super(message, cause);
    }
}
