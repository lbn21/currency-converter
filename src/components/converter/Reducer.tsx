import { CODES } from "../../data/codes";

export const ACTIONS = {
  SET_COUNTRIES: "set-countries",
  SET_RATES: "set-rates",
  SET_BASE_CURRENCY_CODE: "set-base-currency-code",
  SET_TARGET_CURRENCY_CODE: "set-target-currency-code",
  SET_BASE_CURRENCY_AMOUNT: "set-base-currency-amount",
  SET_TARGET_CURRENCY_AMOUNT: "set-target-currency-amount",
  SWAP_CURRENCIES: "swap-currencies",
  SET_COUNTDOWN_SHOW: "set-countdown-show",
  SET_COUNTDOWN_EXPIRED: "set-countdown-expired",
  RESET_COUNTDOWN: "reset-countdown",
};

export type Action = {
  type: string;
  payload?: any;
};

export type Country = {
  code: string;
  name: string;
  flag: string;
};

export type Currency = {
  amount: number;
  code: string;
  type: string;
};

export type Countdown = {
  show: boolean;
  expired: boolean;
};

export type ConverterState = {
  baseCurrency: Currency;
  targetCurrency: Currency;
  countries: Country[];
  countdown: Countdown;
};

// our reducer function responsible for state management
const reducer = (state: ConverterState, action: Action): ConverterState => {
  switch (action.type) {
    case ACTIONS.SET_COUNTRIES: // countries from API are set to state
      const countries: Country[] = [];
      const codes = CODES;
      for (const code in action.payload.countries) {
        if (
          Object.prototype.hasOwnProperty.call(action.payload.countries, code)
        ) {
          // check if country flag is available
          const countryCode = code.slice(0, 2).toLocaleLowerCase();
          let flag = "https://via.placeholder.com/30x20/e0e0e0/000000";
          if (Object.prototype.hasOwnProperty.call(codes, countryCode)) {
            // not all codes are available on flagcdn API
            //we have flag avaialable
            flag = `https://flagcdn.com/w20/${countryCode}.png`;
          }
          const country: Country = {
            code: code,
            name: action.payload.countries[code],
            flag: flag,
          };
          countries.push(country);
        }
      }
      return { ...state, countries: countries };
    case ACTIONS.SET_BASE_CURRENCY_CODE:
      return {
        ...state,
        baseCurrency: {
          ...state.baseCurrency,
          code: action.payload.code,
        },
      };
    case ACTIONS.SET_TARGET_CURRENCY_CODE:
      return {
        ...state,
        targetCurrency: {
          ...state.targetCurrency,
          code: action.payload.code,
        },
      };
    case ACTIONS.SET_BASE_CURRENCY_AMOUNT:
      return {
        ...state,
        baseCurrency: {
          ...state.baseCurrency,
          amount: action.payload.amount.toFixed(2), // formatting number to 2 decimal places
        },
      };
    case ACTIONS.SET_TARGET_CURRENCY_AMOUNT:
      return {
        ...state,
        targetCurrency: {
          ...state.targetCurrency,
          amount: action.payload.amount.toFixed(2), // formatting number to 2 decimal places
        },
      };
    case ACTIONS.SWAP_CURRENCIES:
      const baseTmp = { ...state.baseCurrency };
      const targetTmp = { ...state.targetCurrency };
      return {
        ...state,
        baseCurrency: { ...state.baseCurrency, code: targetTmp.code },
        targetCurrency: { ...state.targetCurrency, code: baseTmp.code },
      };
    case ACTIONS.SET_COUNTDOWN_SHOW:
      return {
        ...state,
        countdown: { ...state.countdown, show: action.payload.show },
      };
    case ACTIONS.SET_COUNTDOWN_EXPIRED:
      return {
        ...state,
        countdown: { ...state.countdown, expired: action.payload.expired },
      };
    case ACTIONS.RESET_COUNTDOWN:
      return {
        ...state,
        countdown: { show: false, expired: false },
      };
    default:
      return state; // if no action found simply just return the current state
  }
};

export default reducer;
