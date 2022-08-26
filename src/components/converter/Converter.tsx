import { useEffect, useReducer, useState } from "react";
import axios, { CancelTokenSource } from "axios";

import reducer, { ACTIONS, ConverterState, Country } from "./Reducer";
import Button from "../button/Button";
import Dropdown from "./../dropdown/Dropdown";
import CountdownTimer from "../countdown/Countdown";

import styles from "./Converter.module.css";

// DEFAULTS - these could be feteched from some kind
// of contect/config API
const ENDPOINTS = {
  countries: "https://openexchangerates.org/api/currencies.json",
  rates: "https://api.exchangerate-api.com/v4/latest/",
};
const DEFAULT_COUNTRY = "GBP";
const COUNTDOWN_MINUTES_IN_SECONDS = 10 * 60;
const CURRENCY_NOT_SUPPORTED_ERROR = "This currency is not supported yet";
const CURRENCY_THE_SAME_ERROR = "Make sure both carrencies are not the same";
const GET_COUNTRIES_ERROR = "Error occured. Refresh page to try again";

// Main state for the converter
const INITIAL_STATE: ConverterState = {
  baseCurrency: {
    code: DEFAULT_COUNTRY,
    amount: 0,
    type: ACTIONS.SET_BASE_CURRENCY_CODE,
  },
  targetCurrency: {
    code: DEFAULT_COUNTRY,
    amount: 0,
    type: ACTIONS.SET_TARGET_CURRENCY_CODE,
  },
  countries: [],
  countdown: {
    show: false,
    expired: false,
  },
};

// this will store axios cancel token
let source: CancelTokenSource;

const Converter = () => {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE); // we use reduer for better controll

  source = axios.CancelToken.source();

  const [amountInput, setAmountInput] = useState({ value: "", valid: true }); // hook to manage the amount input

  // another hook to set pending API.
  // this could be done via interceptor which will globally set pending state
  const [pendingConvert, setPendingConvert] = useState(false);

  // when currency swap button is clicked we handle it here
  const handleSwap = () => {
    dispatch({ type: ACTIONS.SWAP_CURRENCIES });

    // we reset the timer
    dispatch({
      type: ACTIONS.RESET_COUNTDOWN,
    });
  };

  const handleConvert = () => {
    // check if both currencies are the same in this case we show error to the user
    if (state.baseCurrency.code === state.targetCurrency.code) {
      alert(CURRENCY_THE_SAME_ERROR);
      return;
    }

    // if we hjave active API we do nothing
    if (pendingConvert) return;
    setPendingConvert(true);

    //call API for rates to perfom conversion
    axios
      .get(`${ENDPOINTS.rates}${state.baseCurrency.code}`, {
        cancelToken: source.token,
      }) //eg. https://api.exchangerate-api.com/v4/latest/GBP
      .then((res) => {
        setPendingConvert(false); // request finished
        const rates = res.data.rates;
        const rate = rates[state.targetCurrency.code];

        // if rate is not available for base currency we show error
        if (!rate) {
          alert(
            `${state.targetCurrency.code} -> ${CURRENCY_NOT_SUPPORTED_ERROR}`
          );
          return;
        }

        const baseCurrencyAmount = +amountInput.value;

        // we use the rate from API to calculate target currency amount
        const targetCurrencyAmount =
          baseCurrencyAmount * rates[state.targetCurrency.code];

        // we set base currency amount
        dispatch({
          type: ACTIONS.SET_BASE_CURRENCY_AMOUNT,
          payload: { amount: baseCurrencyAmount },
        });

        // we set target currency amount
        dispatch({
          type: ACTIONS.SET_TARGET_CURRENCY_AMOUNT,
          payload: { amount: targetCurrencyAmount },
        });

        // we show the countdown timer
        dispatch({
          type: ACTIONS.SET_COUNTDOWN_SHOW,
          payload: {
            show: true,
          },
        });

        // we reset the timer expiration flag
        dispatch({
          type: ACTIONS.SET_COUNTDOWN_EXPIRED,
          payload: {
            expired: false,
          },
        });
      })
      .catch((error) => {
        setPendingConvert(false); // when error happens we have to remove pending flag

        // when we have 404 error it means that the base currency is not supported
        // we catch this error and show specific error message
        if (error?.response.status === 404) {
          alert(
            `${state.baseCurrency.code} -> ${CURRENCY_NOT_SUPPORTED_ERROR}`
          );
        }
      });
  };

  // we validate users input
  const handleAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim(); // spaces removed for consistency

    // we store the input in state
    setAmountInput((prev) => {
      return {
        ...prev,
        value: value,
      };
    });

    // check if input is empty
    // in this case we reset the validity to true
    // empty input means initial state
    if (typeof value === "string" && value.length === 0) {
      setAmountInput((prev) => {
        return {
          ...prev,
          valid: true,
        };
      });
      return;
    }

    // check if valid format provided for amount eg. "21.5.2" will not be valid
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

    // at this point we have a valid amount
    setAmountInput((prev) => {
      return {
        ...prev,
        valid: true,
      };
    });

    // we can show the timer
    dispatch({
      type: ACTIONS.SET_COUNTDOWN_SHOW,
      payload: {
        show: false,
      },
    });
  };

  // initial component mounted logic
  useEffect(() => {
    // we fetch the countries from API to be used in both dropdowns
    axios
      .get(ENDPOINTS.countries, { cancelToken: source.token })
      .then((res) => {
        const countries: Country[] = res.data;

        // set countries in state
        dispatch({
          type: ACTIONS.SET_COUNTRIES,
          payload: { countries: countries },
        });
      })
      .catch((errors) => {
        alert(GET_COUNTRIES_ERROR);
      });

    //cleanup function
    return () => {
      // this code will trigger in react stric mode in development
      // I leave this commented out
      // if (source) {
      //   source.cancel("Component got unmounted");
      // }
      // also this is our main component and this code will not do antyhing
      // however it real world this we would be able to navigate away to another page
    };
  }, []);

  if (state.countries.length === 0) {
    return <h1>Please wait..</h1>; // initial loading screen while we wait for countries to be fetched
  } else {
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
          {!amountInput.valid && (
            <div
              className={`${styles.msg} ${
                !amountInput.valid ? styles.show : ""
              }`}
            >
              {amountInput.value} is not a valid number
            </div>
          )}
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
              {state.baseCurrency.amount} {state.baseCurrency.code} is
              equivalent to {state.targetCurrency.amount}{" "}
              {state.targetCurrency.code}
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
            state.countdown.show
          }
          caption={pendingConvert ? "Please wait.." : "Convert"}
          handleClick={handleConvert}
        />
      </div>
    );
  }
};

export default Converter;
