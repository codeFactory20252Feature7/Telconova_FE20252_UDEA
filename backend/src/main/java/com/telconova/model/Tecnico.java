package com.telconova.model;

import jakarta.persistence.*;

@Entity
@Table(name = "tecnico")
public class Tecnico {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idTecnico;

    @Column(name = "id_usuario", nullable = false, unique = true)
    private Integer idUsuario;

    private String zona;
    private Boolean disponibilidad;
    private Integer cargaActual;
    private Double calificacionPromedio;
    private Double latitud;
    private Double longitud;
    private Boolean activo;

    // getters and setters
    public Integer getIdTecnico() { return idTecnico; }
    public void setIdTecnico(Integer idTecnico) { this.idTecnico = idTecnico; }
    public Integer getIdUsuario() { return idUsuario; }
    public void setIdUsuario(Integer idUsuario) { this.idUsuario = idUsuario; }
    public String getZona() { return zona; }
    public void setZona(String zona) { this.zona = zona; }
    public Boolean getDisponibilidad() { return disponibilidad; }
    public void setDisponibilidad(Boolean disponibilidad) { this.disponibilidad = disponibilidad; }
    public Integer getCargaActual() { return cargaActual; }
    public void setCargaActual(Integer cargaActual) { this.cargaActual = cargaActual; }
    public Double getCalificacionPromedio() { return calificacionPromedio; }
    public void setCalificacionPromedio(Double calificacionPromedio) { this.calificacionPromedio = calificacionPromedio; }
    public Double getLatitud() { return latitud; }
    public void setLatitud(Double latitud) { this.latitud = latitud; }
    public Double getLongitud() { return longitud; }
    public void setLongitud(Double longitud) { this.longitud = longitud; }
    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }
}
