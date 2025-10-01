package com.telconova.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "historial_asignacion")
public class HistorialAsignacion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idAsignacion;

    @Column(name = "id_orden", nullable = false)
    private Integer idOrden;

    @Column(name = "id_tecnico", nullable = false)
    private Integer idTecnico;

    @Column(name = "id_supervisor", nullable = false)
    private Integer idSupervisor;

    private LocalDateTime fecha;

    private String tipoAsignacion;

    private String motivo;

    @Column(columnDefinition = "json")
    private String algoritmoMetadata;

    // getters and setters
    public Integer getIdAsignacion() { return idAsignacion; }
    public void setIdAsignacion(Integer idAsignacion) { this.idAsignacion = idAsignacion; }
    public Integer getIdOrden() { return idOrden; }
    public void setIdOrden(Integer idOrden) { this.idOrden = idOrden; }
    public Integer getIdTecnico() { return idTecnico; }
    public void setIdTecnico(Integer idTecnico) { this.idTecnico = idTecnico; }
    public Integer getIdSupervisor() { return idSupervisor; }
    public void setIdSupervisor(Integer idSupervisor) { this.idSupervisor = idSupervisor; }
    public LocalDateTime getFecha() { return fecha; }
    public void setFecha(LocalDateTime fecha) { this.fecha = fecha; }
    public String getTipoAsignacion() { return tipoAsignacion; }
    public void setTipoAsignacion(String tipoAsignacion) { this.tipoAsignacion = tipoAsignacion; }
    public String getMotivo() { return motivo; }
    public void setMotivo(String motivo) { this.motivo = motivo; }
    public String getAlgoritmoMetadata() { return algoritmoMetadata; }
    public void setAlgoritmoMetadata(String algoritmoMetadata) { this.algoritmoMetadata = algoritmoMetadata; }
}
