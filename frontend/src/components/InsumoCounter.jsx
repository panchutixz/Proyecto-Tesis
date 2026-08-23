import { FiMinus, FiPlus } from "react-icons/fi";

const MIN_VALOR = 0;
const MAX_VALOR = 99;

/**
 * Contador circular reutilizable para seleccionar cantidad de un insumo.
 *
 * Props:
 *  - nombre:      string  → nombre del insumo (ej: "Papel higiénico")
 *  - disponible:  number  → stock actual en el almacén (solo referencia visual)
 *  - valor:       number  → cantidad actualmente seleccionada
 *  - onChange:    (nuevoValor: number) => void
 */
const InsumoCounter = ({ nombre, disponible, valor, onChange }) => {
  const decrementar = () => {
    if (valor > MIN_VALOR) onChange(valor - 1);
  };

  const incrementar = () => {
    if (valor < MAX_VALOR) onChange(valor + 1);
  };

  return (
    <div className="insumo-counter-card">
      <p className="insumo-counter-nombre">{nombre}</p>
      <p className="insumo-counter-disponible">Disponible: {disponible}</p>

      <div className="insumo-counter-row">
        <button
          type="button"
          className="insumo-counter-btn minus"
          onClick={decrementar}
          disabled={valor <= MIN_VALOR}
          aria-label={`Disminuir cantidad de ${nombre}`}
        >
          <FiMinus />
        </button>

        <span className="insumo-counter-valor">{valor}</span>

        <button
          type="button"
          className="insumo-counter-btn plus"
          onClick={incrementar}
          disabled={valor >= MAX_VALOR}
          aria-label={`Aumentar cantidad de ${nombre}`}
        >
          <FiPlus />
        </button>
      </div>
    </div>
  );
};

export default InsumoCounter;