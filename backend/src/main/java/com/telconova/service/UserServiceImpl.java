package com.telconova.service;

import com.telconova.auth.AuthResult;
import com.telconova.model.Usuario;
import com.telconova.repository.UsuarioRepository;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class UserServiceImpl implements UserService {
    private final UsuarioRepository usuarioRepo;
    private final JdbcTemplate jdbcTemplate;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public UserServiceImpl(UsuarioRepository usuarioRepo, JdbcTemplate jdbcTemplate) {
        this.usuarioRepo = usuarioRepo; this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public AuthResult authenticate(String correo, String passwordPlain, String ip, String userAgent) {
        Optional<Usuario> opt = usuarioRepo.findByCorreo(correo);
        if (opt.isEmpty()) {
            try { jdbcTemplate.update("CALL registro_intento_login(?, ?, ?, ?)", correo, false, ip, userAgent); } catch (Exception e) {}
            return new AuthResult(false, "Credenciales incorrectas", null);
        }
        Usuario u = opt.get();
        if ("bloqueado".equals(u.getEstado())) {
            if (u.getFechaBloqueo()!=null && u.getFechaBloqueo().plusMinutes(15).isBefore(LocalDateTime.now())) {
                u.setEstado("activo"); u.setFechaBloqueo(null); usuarioRepo.save(u);
            } else {
                return new AuthResult(false, "Cuenta bloqueada. Intente más tarde.", null);
            }
        }
        if (!passwordEncoder.matches(passwordPlain, u.getPasswordHash())) {
            try { jdbcTemplate.update("CALL registro_intento_login(?, ?, ?, ?)", correo, false, ip, userAgent); } catch (Exception e) {}
            return new AuthResult(false, "Credenciales incorrectas", null);
        }
        try { jdbcTemplate.update("CALL registro_intento_login(?, ?, ?, ?)", correo, true, ip, userAgent); } catch (Exception e) {}
        u.setUltimoLogin(LocalDateTime.now()); usuarioRepo.save(u);
        return new AuthResult(true, "OK", u);
    }
}
