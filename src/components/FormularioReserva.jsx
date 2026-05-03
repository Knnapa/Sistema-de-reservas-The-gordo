// Placeholder temporal - Karen completará este componente
function FormularioReserva({ mesa, onCerrar, onExito }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "30px",
          borderRadius: "12px",
        }}
      >
        <h2>Reservar Mesa #{mesa.numero}</h2>
        <p>Formulario en construcción...</p>
        <button onClick={onCerrar}>Cerrar</button>
      </div>
    </div>
  );
}

export default FormularioReserva;
