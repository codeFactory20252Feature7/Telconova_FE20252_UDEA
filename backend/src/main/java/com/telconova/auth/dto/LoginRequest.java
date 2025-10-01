package com.telconova.auth.dto;
public class LoginRequest {
    private String correo;
    private String contraseña;
    public String getCorreo() { return correo; }
    public void setCorreo(String correo) { this.correo = correo; }
    public String getContraseña() { return contraseña; }
    public void setContraseña(String contraseña) { this.contraseña = contraseña; }
}
