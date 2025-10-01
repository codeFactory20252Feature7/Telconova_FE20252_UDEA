package com.telconova.service;

import com.telconova.model.Usuario;

public class AuthResult {
    private boolean success;
    private String message;
    private Usuario usuario;
    public AuthResult(boolean success, String message, Usuario usuario) {
        this.success = success; this.message = message; this.usuario = usuario;
    }
    public boolean isSuccess() { return success; }
    public String getMessage() { return message; }
    public Usuario getUsuario() { return usuario; }
}
