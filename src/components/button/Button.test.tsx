import { fireEvent, render, screen } from "@testing-library/react";
import Button from "./Button";

test("renders button with 'Test Button' text", () => {
  const handleClick = jest.fn();

  render(
    <Button
      handleClick={handleClick}
      disabled={false}
      caption={"Test Button"}
    />
  );
  const buttonElement = screen.getByText(/Test Button/i);
  expect(buttonElement).toBeInTheDocument();
});

test("clicks button", () => {
  const handleClick = jest.fn();

  render(
    <Button
      handleClick={handleClick}
      disabled={false}
      caption={"Test Button"}
    />
  );
  fireEvent.click(screen.getByText(/Test Button/i));
  expect(handleClick).toHaveBeenCalledTimes(1);
});
