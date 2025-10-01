package com.telconova.controller;

import com.telconova.model.OrdenTrabajo;
import com.telconova.model.HistorialAsignacion;
import com.telconova.repository.OrdenTrabajoRepository;
import com.telconova.repository.TecnicoRepository;
import com.telconova.repository.HistorialAsignacionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Optional;

@RestController
@RequestMapping("/api/ordenes")
public class OrdenController {
    private final OrdenTrabajoRepository ordenRepo;
    private final TecnicoRepository tecnicoRepo;
    private final HistorialAsignacionRepository historialRepo;

    public OrdenController(OrdenTrabajoRepository ordenRepo, TecnicoRepository tecnicoRepo, HistorialAsignacionRepository historialRepo) {
        this.ordenRepo = ordenRepo;
        this.tecnicoRepo = tecnicoRepo;
        this.historialRepo = historialRepo;
    }

    @PostMapping("/asignar/manual")
    public ResponseEntity<?> asignarManual(@RequestParam Integer idOrden, @RequestParam Integer idTecnico, @RequestParam Integer idSupervisor) {
        Optional<OrdenTrabajo> o = ordenRepo.findById(idOrden);
        if (!o.isPresent()) return ResponseEntity.badRequest().body("Orden no encontrada");
        Optional<com.telconova.model.Tecnico> t = tecnicoRepo.findById(idTecnico);
        if (!t.isPresent()) return ResponseEntity.badRequest().body("Técnico no encontrado");

        OrdenTrabajo orden = o.get();
        orden.setIdTecnico(idTecnico);
        orden.setIdSupervisor(idSupervisor);
        orden.setEstado("asignada");
        orden.setFechaAsignacion(LocalDateTime.now());
        ordenRepo.save(orden);

        HistorialAsignacion h = new HistorialAsignacion();
        h.setIdOrden(idOrden);
        h.setIdTecnico(idTecnico);
        h.setIdSupervisor(idSupervisor);
        h.setTipoAsignacion("manual");
        h.setFecha(LocalDateTime.now());
        historialRepo.save(h);

        // update tecnico carga_actual ++ (simple approach)
        com.telconova.model.Tecnico tec = t.get();
        Integer carga = tec.getCargaActual()!=null?tec.getCargaActual():0;
        tec.setCargaActual(carga+1);
        tecnicoRepo.save(tec);

        return ResponseEntity.ok("Asignación realizada");
    }
}
