package com.telconova.controller;

import com.telconova.auth.AuthResult;
import com.telconova.auth.dto.LoginRequest;
import com.telconova.auth.dto.LoginResponse;
import com.telconova.model.Usuario;
import com.telconova.security.JwtProvider;
import com.telconova.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserService userService;
    private final JwtProvider jwtProvider;
    public AuthController(UserService userService, JwtProvider jwtProvider){ this.userService = userService; this.jwtProvider = jwtProvider; }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req, @RequestHeader(value="X-Forwarded-For", required=false) String xff) {
        if (req.getCorreo()==null || req.getContraseña()==null) return ResponseEntity.badRequest().body("Correo y contraseña son obligatorios");
        AuthResult result = userService.authenticate(req.getCorreo(), req.getContraseña(), xff, null);
        if (!result.isSuccess()) return ResponseEntity.status(401).body(result.getMessage());
        Usuario u = result.getUsuario();
        String token = jwtProvider.generateToken(u.getIdUsuario(), u.getCorreo(), u.getRol());
        return ResponseEntity.ok(new LoginResponse("Login exitoso", token));
    }
}
