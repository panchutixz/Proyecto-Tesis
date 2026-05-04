import { useEffect, useState } from "react";

function App() {
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    fetch("http://localhost:3000/api")
      .then(res => res.json())
      .then(data => setMensaje(data.mensaje));
  }, []);

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "#0f172a",
      color: "#e2e8f0",
      flexDirection: "column"
    }}>
      <h1>Hola 👋</h1>
      <p>Este es el inicio de mi proyecto de tesis</p>
      <p>{mensaje}</p>
    </div>
  );
}

export default App;