import styles from "./Button.module.css";

// component props type
type ButtonTypeProps = {
  handleClick: any;
  caption: string;
  disabled: boolean;
};

const Button = ({ handleClick, caption, disabled }: ButtonTypeProps) => {
  return (
    <button disabled={disabled} className={styles.btn} onClick={handleClick}>
      {caption}
    </button>
  );
};

export default Button;
