import { useEffect, useReducer, useState } from "react";
import axios from "axios";

import reducer, { ACTIONS, ConverterState, Country } from "./Reducer";
import { ENDPOINTS } from "../../data/endpoints";
import Button from "../button/Button";
import Dropdown from "./../dropdown/Dropdown";
import styles from "./Converter.module.css";
import CountdownTimer from "../countdown/Countdown";

const DEFAULT_COUNTRY = "GBP";
const COUNTDOWN_MINUTES_IN_SECONDS = 10 * 60;
const CURRENCY_NOT_SUPPORTED_ERROR = "This currency is not supported yet";

const initialState: ConverterState = {
  baseCurrency: {
    code: "",
    amount: 0,
    type: ACTIONS.SET_BASE_CURRENCY_CODE,
  },
  targetCurrency: {
    code: "",
    amount: 0,
    type: ACTIONS.SET_TARGET_CURRENCY_CODE,
  },
  countries: [],
  countdown: {
    show: false,
    expired: false,
  },
};

const Converter = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const [amountInput, setAmountInput] = useState({ value: "", valid: true });
  const [pendingConvert, setPendingConvert] = useState(false);

  const handleSwap = () => {
    dispatch({ type: ACTIONS.SWAP_CURRENCIES });
    dispatch({
      type: ACTIONS.RESET_COUNTDOWN,
    });
  };

  const handleConvert = () => {
    if (pendingConvert) return;
    setPendingConvert(true);
    //call API for rates
    axios
      .get(`${ENDPOINTS.rates}${state.baseCurrency.code}`)
      .then((res) => {
        setPendingConvert(false);
        const rates = res.data.rates;
        const rate = rates[state.targetCurrency.code];

        if (!rate) {
          alert(
            `${state.targetCurrency.code} -> ${CURRENCY_NOT_SUPPORTED_ERROR}`
          );
          return;
        }

        const baseCurrencyAmount = +amountInput.value;
        const targetCurrencyAmount =
          baseCurrencyAmount * rates[state.targetCurrency.code];
        dispatch({
          type: ACTIONS.SET_BASE_CURRENCY_AMOUNT,
          payload: { amount: baseCurrencyAmount },
        });
        dispatch({
          type: ACTIONS.SET_TARGET_CURRENCY_AMOUNT,
          payload: { amount: targetCurrencyAmount },
        });
        dispatch({
          type: ACTIONS.SET_COUNTDOWN_SHOW,
          payload: {
            show: true,
          },
        });
        dispatch({
          type: ACTIONS.SET_COUNTDOWN_EXPIRED,
          payload: {
            expired: false,
          },
        });
      })
      .catch((error) => {
        setPendingConvert(false);
        if (error?.response.status === 404) {
          alert(
            `${state.baseCurrency.code} -> ${CURRENCY_NOT_SUPPORTED_ERROR}`
          );
        }
      });
  };

  const handleAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim(); //we trim spaces
    setAmountInput((prev) => {
      return {
        ...prev,
        value: value,
      };
    });

    //check if input is empty
    if (typeof value === "string" && value.length === 0) {
      setAmountInput((prev) => {
        return {
          ...prev,
          valid: true,
        };
      });
      return;
    }

    //check if valid format
    const regex = new RegExp(/^[+-]?([0-9]+\.?[0-9]*|\.[0-9]+)$/); //regex to check if decimal number provided
    const valid = regex.test(value);
    if (!valid) {
      setAmountInput((prev) => {
        return {
          ...prev,
          valid: false,
        };
      });
      return;
    }

    //once we are here amount is in desired format
    setAmountInput((prev) => {
      return {
        ...prev,
        valid: true,
      };
    });
    dispatch({
      type: ACTIONS.SET_COUNTDOWN_SHOW,
      payload: {
        show: false,
      },
    });
  };

  //fetch data from API on component mount
  useEffect(() => {
    axios
      .get(ENDPOINTS.countries)
      .then((res) => {
        const countries: Country[] = res.data;

        //set countries
        dispatch({
          type: ACTIONS.SET_COUNTRIES,
          payload: { countries: countries },
        });

        //set base currency
        dispatch({
          type: ACTIONS.SET_BASE_CURRENCY_CODE,
          payload: { code: DEFAULT_COUNTRY },
        });

        //set target currency
        dispatch({
          type: ACTIONS.SET_TARGET_CURRENCY_CODE,
          payload: { code: DEFAULT_COUNTRY },
        });
      })
      .catch((errors) => {
        console.log(errors);
      });

    //cleanup function
    return () => {};
  }, []);

  return (
    <div className={styles.converterModal}>
      <div className={styles.formGroup}>
        <label htmlFor="amount">Amount</label>
        <div className={styles.inputGroup}>
          <input
            id="amount"
            type="text"
            placeholder="eg. 100"
            readOnly={pendingConvert}
            onChange={handleAmount}
          />
          <button className={styles.swap} onClick={handleSwap}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              className={styles.icon}
              viewBox="0 0 16 16"
            >
              <path d="M1 11.5a.5.5 0 0 0 .5.5h11.793l-3.147 3.146a.5.5 0 0 0 .708.708l4-4a.5.5 0 0 0 0-.708l-4-4a.5.5 0 0 0-.708.708L13.293 11H1.5a.5.5 0 0 0-.5.5zm14-7a.5.5 0 0 1-.5.5H2.707l3.147 3.146a.5.5 0 1 1-.708.708l-4-4a.5.5 0 0 1 0-.708l4-4a.5.5 0 1 1 .708.708L2.707 4H14.5a.5.5 0 0 1 .5.5z" />
            </svg>
          </button>
        </div>
        <div
          className={`${styles.msg} ${!amountInput.valid ? styles.show : ""}`}
        >
          {amountInput.value} is not a valid number
        </div>
      </div>
      <div className={styles.dropdowns}>
        <Dropdown
          disabled={pendingConvert}
          countries={state.countries}
          selected={state.baseCurrency}
          dispatch={dispatch}
        />
        <Dropdown
          disabled={pendingConvert}
          countries={state.countries}
          selected={state.targetCurrency}
          dispatch={dispatch}
        />
      </div>
      {state.countdown.show && (
        <div className={styles.convertTimer}>
          <h3>
            {state.baseCurrency.amount} {state.baseCurrency.code} is equivalent
            to {state.targetCurrency.amount} {state.targetCurrency.code}
          </h3>
          <CountdownTimer
            seconds={COUNTDOWN_MINUTES_IN_SECONDS}
            dispatch={dispatch}
          />
        </div>
      )}
      {state.countdown.expired && (
        <h3 className={styles.expired}>Expired. Try again.</h3>
      )}
      <Button
        disabled={
          !amountInput.valid ||
          amountInput.value?.trim().length === 0 ||
          pendingConvert ||
          state.countdown.show ||
          state.baseCurrency.code === state.targetCurrency.code
        }
        caption={pendingConvert ? "Please wait.." : "Convert"}
        handleClick={handleConvert}
      />
    </div>
  );
};

export default Converter;
