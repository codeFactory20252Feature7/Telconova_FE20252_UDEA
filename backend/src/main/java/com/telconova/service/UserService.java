package com.telconova.service;

import com.telconova.auth.AuthResult;

public interface UserService {
    AuthResult authenticate(String correo, String passwordPlain, String ip, String userAgent);
}
