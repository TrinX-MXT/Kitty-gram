package ru.yandex.practicum.catsgram.exception;

public class ParameterNotValidException extends IllegalArgumentException {

    private final String parametr;
    private final String reason;

    public ParameterNotValidException(String parametr, String reason) {
        super(reason);
        this.parametr = parametr;
        this.reason = reason;
    }

    public String getReason() {
        return reason;
    }

    public String getParameter() {
        return parametr;
    }
}
