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

  const getResult = () => {
    let result = daily_nicotine_mgs_smoking / final_nicotine_mg;
    return result < 1 ? 1 : Math.floor(result);
  };

  return (
    <div className={classes.container}>
      <form className={classes.formContainer} noValidate autoComplete="off">
        <h1>Calcula tus mezclas de nicotina</h1>
        {/* <div>
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
        </div> */}
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
          /* Gracias a :https://stackblitz.com/edit/material-ui-custom-outline-color*/
          InputLabelProps={{
            classes: {
              root: classes.cssLabel,
              focused: classes.cssFocused
            }
          }}
          InputProps={{
            classes: {
              root: classes.cssOutlinedInput,
              focused: classes.cssFocused,
              notchedOutline: classes.notchedOutline
            },
            inputMode: "numeric"
          }}
        />
        {/* TODO: Aqui preguntamos por el tipo de tabaco que fuma para buscar
          tablas en el futuro */}

        {daily_nicotine_mgs_smoking && (
          <p style={{ marginLeft: "1em" }}>
            Tu media de nicotina diaria es de:{" "}
            <strong>{daily_nicotine_mgs_smoking}mg</strong> (miligramos)
          </p>
        )}
        <FormControl variant="outlined" className={classes.formControl}>
          <InputLabel
            ref={inputLabel}
            htmlFor="outlined-age-simple"
            className={classes.label}
          >
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
            <p style={{ marginLeft: "1em" }}>
              La cantidad del nicotina ha sido ajustada por el algoritmo a{" "}
              <strong>
                {nicokit_mg_recommended ? (
                  nicokit_mg_recommended + "mg/ml"
                ) : (
                  <i>Indica nº cigarrillos al día primero</i>
                )}
              </strong>
            </p>
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
          InputLabelProps={{
            classes: {
              root: classes.cssLabel,
              focused: classes.cssFocused
            }
          }}
          InputProps={{
            classes: {
              root: classes.cssOutlinedInput,
              focused: classes.cssFocused,
              notchedOutline: classes.notchedOutline
            },
            inputMode: "numeric"
          }}
        />
        {final_nicotine_mg && (
          <>
            <div className={classes.results}>
              <h3>Te queda un líquido total de {final_total_volumen} ml.</h3>
              <h3>
                Con una concentración de {final_nicotine_mg} mg/ml de nicotina
              </h3>
              <h3>
                Para un total de <strong>{getResult}ml</strong>
                diarios
              </h3>
            </div>
          </>
        )}
      </form>
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  container: {
    display: "flex",
    flexDirection: "column",
    margin: "20px",
    alignItems: "flex-end",
    paddingRight: "8%",
    [theme.breakpoints.up("lg")]: {
      paddingRight: "18%"
    },
    [theme.breakpoints.down("lg")]: {
      paddingRight: "8%"
    },
    [theme.breakpoints.down("md")]: {
      paddingRight: "2%"
    },
    paddingTop: "28em",
    backgroundImage: `url(${require("./../img/full-beard-men-snapback-865876.jpg")})`,
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center center",
    minHeight: 1000
  },

  formContainer: {
    display: "flex",
    flexDirection: "column",
    // alignItems: "center",
    // paddingRight: "8em",
    maxWidth: "800px",

    [theme.breakpoints.down("sm")]: {
      color: "white",
      backgroundColor: "#0000002e" // rgba(49, 49, 58, 0.058823529411764705)
    },
    backgroundColor: "#31313a0f" // rgba(49, 49, 58, 0.058823529411764705)

    // "align-items": "center"
    // flexWrap: "wrap"
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1)
    // color: "rgb(55, 54, 152)"
  },
  dense: {
    marginTop: theme.spacing(2)
  },
  label: {
    color: "white",
    fontSize: "1.2em"
  },
  cssLabel: {
    color: "white",
    fontSize: "1.2em"
  },

  cssOutlinedInput: {
    "&$cssFocused $notchedOutline": {
      borderColor: `white !important`
    }
  },

  cssFocused: {},

  notchedOutline: {
    borderWidth: "1px",
    borderColor: "white !important"
  },
  menu: {
    width: 200
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120
  },
  results: {
    alignSelf: "center",
    width: "100%",
    color: "#dad7d9" /*"#b412e9"*/,
    backgroundColor: "rgba(49, 49, 58, 0.3)"
  }
}));

export default NicotineCalculator;

// Foto de Victor Soldevilla en Pexels,
// https://www.pexels.com/es-es/@victor-soldevilla-296093?utm_content=attributionCopyText&utm_medium=referral&utm_source=pexels
