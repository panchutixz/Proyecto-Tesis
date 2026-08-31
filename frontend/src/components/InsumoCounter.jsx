import { FiMinus, FiPlus } from "react-icons/fi";

const MIN_VALOR = 0;
const MAX_VALOR = 99;

const InsumoCounter = ({ nombre, disponible, valor, onChange }) => {
  const maxPermitido = Math.min(MAX_VALOR, Number(disponible) || MAX_VALOR);

  const clamp = (n) => Math.max(MIN_VALOR, Math.min(maxPermitido, n));

  const decrementar = () => onChange(clamp(valor - 1));
  const incrementar = () => onChange(clamp(valor + 1));

  const handleInputChange = (e) => {
    const soloDigitos = e.target.value.replace(/[^0-9]/g, "");
    onChange(soloDigitos === "" ? 0 : clamp(Number(soloDigitos)));
  };

  const handleBlur = (e) => {
    if (e.target.value === "") onChange(0);
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

        <input
          type="text"
          inputMode="numeric"
          maxLength={2}
          className="insumo-counter-valor"
          value={valor}
          onChange={handleInputChange}
          onBlur={handleBlur}
          aria-label={`Cantidad de ${nombre}`}
        />

        <button
          type="button"
          className="insumo-counter-btn plus"
          onClick={incrementar}
          disabled={valor >= maxPermitido}
          aria-label={`Aumentar cantidad de ${nombre}`}
        >
          <FiPlus />
        </button>
      </div>
    </div>
  );
};

export default InsumoCounter;