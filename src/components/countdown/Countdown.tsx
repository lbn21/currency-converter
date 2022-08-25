import { useEffect, useState } from "react";
import { ACTIONS } from "../converter/Reducer";
import styles from "./Countdown.module.css";

type CountDownTypeProps = {
  seconds: number;
  dispatch: any;
};

const CountdownTimer = ({ seconds, dispatch }: CountDownTypeProps) => {
  const [remainingSeconds, setRemainingSeconds] = useState(seconds);
  const [counterValues, setCounterValues] = useState(getTimerValues(seconds));

  useEffect(() => {
    const interval = setInterval(() => {
      if (remainingSeconds < 0) {
        clearInterval(interval);
        dispatch({
          type: ACTIONS.SET_COUNTDOWN_SHOW,
          payload: {
            show: false,
          },
        });
        dispatch({
          type: ACTIONS.SET_COUNTDOWN_EXPIRED,
          payload: {
            expired: true,
          },
        });
        return;
      }
      setRemainingSeconds(remainingSeconds - 1);
      setCounterValues((prev) => {
        return {
          ...prev,
          ...getTimerValues(remainingSeconds),
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [dispatch, remainingSeconds]);

  return (
    <div className={styles.expireBox}>
      Expires in:
      <div className={styles.countdown}>
        <span className={styles.minutes}>{counterValues.minutes}'</span>
        <span className={styles.seconds}>{counterValues.seconds}''</span>
      </div>
    </div>
  );
};

const getTimerValues = (secondsTotal: number) => {
  // calculate time left
  const minutes = Math.floor(secondsTotal / 60);
  const seconds = secondsTotal - minutes * 60;

  return {
    minutes: `${minutes}`.padStart(2, "0"),
    seconds: `${seconds}`.padStart(2, "0"),
  };
};

export default CountdownTimer;
