import { useEffect, useState } from "react";

import { ACTIONS } from "../converter/Reducer";

import styles from "./Countdown.module.css";

// component props type
type CountDownTypeProps = {
  seconds: number;
  dispatch: any;
};

const CountdownTimer = ({ seconds, dispatch }: CountDownTypeProps) => {
  const [remainingSeconds, setRemainingSeconds] = useState(seconds - 1); // we initially subnstract 1 second to mitagate extra second on intial load

  // state for holding formatted values
  const [counterValues, setCounterValues] = useState(getTimerValues(seconds));

  useEffect(() => {
    // runs every second
    // for better performance we could use animation frames instead
    const timer = setTimeout(() => {
      // check if timer is finished
      if (remainingSeconds < 0) {
        // this will hide the timer
        dispatch({
          type: ACTIONS.SET_COUNTDOWN_SHOW,
          payload: {
            show: false,
          },
        });

        // set timer to expired
        dispatch({
          type: ACTIONS.SET_COUNTDOWN_EXPIRED,
          payload: {
            expired: true,
          },
        });
        return;
      }

      setRemainingSeconds(remainingSeconds - 1); // we substract 1 every second

      // update formatted values
      setCounterValues((prev) => {
        return {
          ...prev,
          ...getTimerValues(remainingSeconds),
        };
      });
    }, 1000);

    return () => clearTimeout(timer); // we clear timeoput on component unmount
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
