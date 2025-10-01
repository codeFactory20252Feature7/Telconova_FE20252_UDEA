package com.telconova.repository;

import com.telconova.model.Tecnico;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface TecnicoRepository extends JpaRepository<Tecnico, Integer> {
    Optional<Tecnico> findByIdUsuario(Integer idUsuario);
}
