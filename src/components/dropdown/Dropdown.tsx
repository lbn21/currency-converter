import { useEffect, useState } from "react";
import { ACTIONS, Country, Currency } from "../converter/Reducer";
import styles from "./Dropdown.module.css";

type DropdownTypeProps = {
  countries: Country[];
  selected: Currency;
  dispatch: any;
  disabled: boolean;
};

const Dropdown = ({
  countries,
  selected,
  dispatch,
  disabled,
}: DropdownTypeProps) => {
  const country = countries.find((c) => c.code === selected.code);

  const [search, setSearch] = useState("");
  const [show, setShow] = useState(false);
  const [countriesNew, setCountriesNew] = useState({
    countries: [...countries],
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleClick = (country: Country) => {
    dispatch({
      type: selected.type,
      payload: { code: country.code },
    });
    dispatch({
      type: ACTIONS.SET_COUNTDOWN_SHOW,
      payload: {
        show: false,
      },
    });
    setShow((prev) => !prev);
    setSearch("");
  };

  useEffect(() => {
    const newList = countries.filter((c) => {
      return (
        c.code.toLocaleLowerCase().indexOf(search.toLocaleLowerCase()) > -1
      );
    });
    setCountriesNew({
      countries: [...newList],
    });
  }, [search, countries]);

  return (
    <>
      <button
        disabled={disabled}
        className={`${styles.countryButton} ${styles.toggle}`}
        onClick={() => setShow((prev) => !prev)}
      >
        <div className={styles.info}>
          <img
            className={styles.flag}
            src={country?.flag}
            width="20"
            alt={country?.name}
          />
          <span className={styles.code}>{country?.code}</span>
          <span className={styles.name}>{country?.name}</span>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="1rem"
          height="1rem"
          className={styles.chevron}
          viewBox="0 0 16 16"
        >
          <path d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z" />
        </svg>
      </button>
      <div className={`${styles.list} ${show ? styles.show : ""}`}>
        <input
          type="text"
          className={styles.search}
          onChange={handleSearch}
          value={search}
          placeholder="Search Currency"
        />
        <div className={styles.countriesContainer}>
          {countriesNew.countries?.map((country) => {
            return (
              <button
                onClick={() => handleClick({ ...country })}
                key={country.code}
                className={`${styles.countryButton} ${
                  selected.code === country.code ? styles.selected : ""
                }`}
              >
                <div className={styles.info}>
                  <img
                    className={styles.flag}
                    src={country.flag}
                    width="20"
                    alt={country.name}
                    loading="lazy"
                  />
                  <span className={styles.code}>{country?.code}</span>
                  <span className={styles.name}>{country?.name}</span>
                </div>
              </button>
            );
          })}
          {countriesNew.countries?.length === 0 && (
            <p className={styles.noResults}>
              No results. Please try different currency
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default Dropdown;
