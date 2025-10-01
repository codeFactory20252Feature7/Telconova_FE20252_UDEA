package com.telconova.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "orden_trabajo")
public class OrdenTrabajo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idOrden;

    @Column(name = "id_cliente", nullable = false)
    private Integer idCliente;

    @Column(name = "id_servicio", nullable = false)
    private Integer idServicio;

    private String prioridad;
    private String estado;

    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaProgramada;
    private LocalDateTime fechaAsignacion;

    @Column(name = "id_tecnico")
    private Integer idTecnico;

    @Column(name = "id_supervisor")
    private Integer idSupervisor;

    private String direccionEjecucion;

    @Column(columnDefinition = "TEXT")
    private String observaciones;

    // getters and setters
    public Integer getIdOrden() { return idOrden; }
    public void setIdOrden(Integer idOrden) { this.idOrden = idOrden; }
    public Integer getIdCliente() { return idCliente; }
    public void setIdCliente(Integer idCliente) { this.idCliente = idCliente; }
    public Integer getIdServicio() { return idServicio; }
    public void setIdServicio(Integer idServicio) { this.idServicio = idServicio; }
    public String getPrioridad() { return prioridad; }
    public void setPrioridad(String prioridad) { this.prioridad = prioridad; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }
    public LocalDateTime getFechaProgramada() { return fechaProgramada; }
    public void setFechaProgramada(LocalDateTime fechaProgramada) { this.fechaProgramada = fechaProgramada; }
    public LocalDateTime getFechaAsignacion() { return fechaAsignacion; }
    public void setFechaAsignacion(LocalDateTime fechaAsignacion) { this.fechaAsignacion = fechaAsignacion; }
    public Integer getIdTecnico() { return idTecnico; }
    public void setIdTecnico(Integer idTecnico) { this.idTecnico = idTecnico; }
    public Integer getIdSupervisor() { return idSupervisor; }
    public void setIdSupervisor(Integer idSupervisor) { this.idSupervisor = idSupervisor; }
    public String getDireccionEjecucion() { return direccionEjecucion; }
    public void setDireccionEjecucion(String direccionEjecucion) { this.direccionEjecucion = direccionEjecucion; }
    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }
}
