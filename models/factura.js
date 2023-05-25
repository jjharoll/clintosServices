class Factura {
    constructor(id, cliente, monto, fecha) {
      this.id = id;
      this.cliente = cliente;
      this.monto = monto;
      this.fecha = fecha;
      this.estado = 'recibido'; // Estado inicial
    }
  
    // Método para cambiar el estado de la factura
    cambiarEstado(estado) {
      this.estado = estado;
    }
  
    // Método para obtener el estado actual de la factura
    obtenerEstado() {
      return this.estado;
    }
  }
  
  module.exports = Factura;
  