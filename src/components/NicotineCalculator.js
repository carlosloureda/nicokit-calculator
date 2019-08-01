import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";

/* El volumne que damos por defecto al nicokit */
const NICOKIT_VOLUMEN = 10; //ml

const mgs_per_day_smoking = daily_cigarrettes_count => {
  const NICOTINE_BY_CIGARRETTE = 16 / 20;
  return daily_cigarrettes_count
    ? round_decimals(daily_cigarrettes_count * NICOTINE_BY_CIGARRETTE, 1)
    : null;
};

const calculate_nicokit = daily_cigarrettes_count => {
  if (daily_cigarrettes_count <= 10) return 6;
  else if (daily_cigarrettes_count > 10 && daily_cigarrettes_count < 23)
    return 12;
  else if (daily_cigarrettes_count >= 23) return 18;
};

const round_decimals = (num, decimals) =>
  Math.round((num * Math.pow(10, decimals)) / Math.pow(10, decimals));

const reducer = (state, action) => {
  if (action.type === "handle_change_input") {
    return {
      ...state,
      [action.field]: action.value
    };
  } else if (action.type === "handle_daily_cigarrettes_count") {
    return {
      ...state,
      [action.field]: action.value,
      daily_nicotine_mgs_smoking:
        action.field === "daily_cigarrettes_count"
          ? mgs_per_day_smoking(action.value)
          : null,
      nicokit_mg:
        action.field === "daily_cigarrettes_count"
          ? calculate_nicokit(action.value)
          : action.field === "nicokit_mg"
          ? action.value
          : null,
      nicokit_mg_recommended:
        action.field === "daily_cigarrettes_count"
          ? calculate_nicokit(action.value)
          : state.nicokit_mg_recommended
    };
  } else if (action.type === "reset_input") {
    return {
      ...state,
      [action.field]: ""
    };
  } else if (action.type === "calculate_final_volume") {
    let final_volumen =
      Number(state.non_nicotine_liquid_ml) + Number(NICOKIT_VOLUMEN);
    return {
      ...state,
      final_total_volumen: final_volumen,
      final_nicotine_mg: round_decimals(
        (state.nicokit_mg * NICOKIT_VOLUMEN) / final_volumen,
        1
      )
    };
  } else {
    throw new Error("Action not supported on NicotineCalculator reducer");
  }
};

const NicotineCalculator = ({ params }) => {
  const [state, dispatch] = React.useReducer(reducer, {
    daily_cigarrettes_count: 0,
    daily_nicotine_mgs_smoking: null,
    nicokit_mg: 0,
    non_nicotine_liquid_ml: 0,
    final_total_volumen: "",
    final_nicotine_mg: ""
  });
  const {
    daily_cigarrettes_count,
    daily_nicotine_mgs_smoking,
    nicokit_mg,
    nicokit_mg_recommended, // valor que calcula nuestro sistema
    non_nicotine_liquid_ml,
    final_total_volumen,
    final_nicotine_mg
  } = state;
  const classes = useStyles();

  /* Calculemos resultado final */
  React.useEffect(() => {
    if (daily_cigarrettes_count && nicokit_mg && non_nicotine_liquid_ml) {
      dispatch({ type: "calculate_final_volume" });
    }
  }, [daily_cigarrettes_count, nicokit_mg, non_nicotine_liquid_ml]);

  const inputLabel = React.useRef(null);
  const [labelWidth, setLabelWidth] = React.useState(0);
  React.useEffect(() => {
    setLabelWidth(inputLabel.current.offsetWidth);
  }, []);

  const handleChange = (e, field) => {
    dispatch({ type: "handle_change_input", field, value: e.target.value });
  };
  const handleDailyCigarretes = (e, field) => {
    dispatch({
      type: "handle_daily_cigarrettes_count",
      field,
      value: e.target.value
    });
  };
  const handleFocus = (e, field) => {
    dispatch({ type: "reset_input", field });
  };

  return (
    <div className={classes.container}>
      <h1>Calcula tus mezclas de nicotina</h1>
      <form className={classes.formContainer} noValidate autoComplete="off">
        <div>
          <p>
            A continuación tienes una calculadora para calcular la cantidad de
            nicotina (mg/ml) que debes comprar de nicokit.{" "}
          </p>
          <p>
            Esta herramienta es una utilidad que está en progreso de desarrollo.
          </p>
          <p>
            Tomad los resultados como una orientación y comentarlo con vuestra
            tienda.
          </p>
        </div>
        <TextField
          label="¿Cuantos cigarrillos al día fumas?"
          type="number"
          className={classes.textField}
          value={daily_cigarrettes_count}
          onChange={e => handleDailyCigarretes(e, "daily_cigarrettes_count")}
          onFocus={e =>
            !daily_cigarrettes_count
              ? handleFocus(e, "daily_cigarrettes_count")
              : null
          }
          margin="normal"
          variant="outlined"
        />
        {/* TODO: Aqui preguntamos por el tipo de tabaco que fuma para buscar
          tablas en el futuro */}
        <div />
        {daily_nicotine_mgs_smoking && (
          <p>
            Tu media de nicotina diaria es de:{" "}
            <strong>{daily_nicotine_mgs_smoking}mg</strong> (miligramos)
          </p>
        )}
        <FormControl variant="outlined" className={classes.formControl}>
          <InputLabel ref={inputLabel} htmlFor="outlined-age-simple">
            ¿De cuantos mg/ml quieres el nicokit?
          </InputLabel>
          <Select
            value={nicokit_mg}
            onChange={e => handleChange(e, "nicokit_mg")}
            input={
              <OutlinedInput
                labelWidth={labelWidth}
                name="age"
                id="outlined-age-simple"
              />
            }
          >
            <MenuItem value={0}>0</MenuItem>
            <MenuItem value={6}>6</MenuItem>
            <MenuItem value={12}>12</MenuItem>
            <MenuItem value={18}>18</MenuItem>
          </Select>
        </FormControl>
        {nicokit_mg_recommended && (
          <div>
            <p>
              La cantidad del nicotine ha sido ajustada por nuestro algoritmo a{" "}
              <strong>
                {nicokit_mg_recommended ? (
                  nicokit_mg_recommended + "mg/ml"
                ) : (
                  <i>Indica nº cigarrillos al día primero</i>
                )}
              </strong>
              , pero puedes cambiarla. Como norma general se sigue esta tabla
              para la cantidad de nicotina:
            </p>
            <ul>
              <li>&lt;10 cigarrillos al día: 6 mg o 12 mg</li>
              <li>20 cigarrillos al día: 12 mg o 18 mg</li>
              <li>>20 cigarrillos al día: 18 mg</li>
            </ul>
          </div>
        )}
        <TextField
          label="De cuantos ml es el tu líquido (libre de nicotina)"
          type="number"
          className={classes.textField}
          value={non_nicotine_liquid_ml}
          onChange={e => handleChange(e, "non_nicotine_liquid_ml")}
          onFocus={e =>
            !non_nicotine_liquid_ml
              ? handleFocus(e, "non_nicotine_liquid_ml")
              : null
          }
          margin="normal"
          variant="outlined"
        />
        {/* <p>
          Asumimmos venta de nicokits de 10 ml y envases de liquidos de 25, 50 o
          100 ml
        </p> */}
        {final_nicotine_mg && (
          <>
            <h1>
              Te queda un líquido total de {final_total_volumen} ml con una
              concentración de {final_nicotine_mg} mg/ml de nicotina
            </h1>
            <p>
              Por lo que al día deberías podrías llegar a vapear hasta unos{" "}
              <strong>
                {Math.floor(daily_nicotine_mgs_smoking / final_nicotine_mg)}
                ml
              </strong>{" "}
              (mililitros)
            </p>
          </>
        )}
      </form>
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  container: {
    display: "flex",
    "flex-direction": "column",
    margin: "20px",
    alignItems: "center"
  },
  formContainer: {
    display: "flex",
    "flex-direction": "column",
    "max-width": "800px"

    // "align-items": "center"
    // flexWrap: "wrap"
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1)
  },
  dense: {
    marginTop: theme.spacing(2)
  },
  menu: {
    width: 200
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120
  }
}));

export default NicotineCalculator;
