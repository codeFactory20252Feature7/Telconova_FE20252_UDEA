package com.telconova.auth.dto;
public class LoginResponse {
    private String mensaje;
    private String token;
    public LoginResponse(String mensaje, String token) { this.mensaje = mensaje; this.token = token; }
    public String getMensaje() { return mensaje; }
    public String getToken() { return token; }
}
