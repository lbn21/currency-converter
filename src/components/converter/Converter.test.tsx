import { fireEvent, render, screen } from "@testing-library/react";
import Converter from "./Converter";

test("renders Convert with 'Convert' button", () => {
  render(<Converter />);
  const loader = screen.getByText(/Please wait../i);
  expect(loader).toBeInTheDocument();
});

test("renders Convert with countries loaded via API", async () => {
  render(<Converter />);
  await screen.findByText("Convert");
  const button = screen.getAllByText(/British Pound Sterling/i);
  expect(button[0]).toBeInTheDocument();
});

test("renders Convert with invalid amount put into input field eg. 20.0.0", async () => {
  render(<Converter />);
  await screen.findByText("Convert");
  const button = screen.getAllByText(/British Pound Sterling/i);
  expect(button[0]).toBeInTheDocument();
  const input = screen.getByPlaceholderText(/eg. 100/i);
  fireEvent.change(input, { target: { value: "20.0.0" } });
  const errorMsg = screen.getByText(/20.0.0 is not a valid number/i);
  expect(errorMsg).toBeInTheDocument();
});

test("renders Convert with valid amount put into input field eg. 100", async () => {
  render(<Converter />);
  await screen.findByText("Convert");
  const button = screen.getAllByText(/British Pound Sterling/i);
  expect(button[0]).toBeInTheDocument();
  const input = screen.getByPlaceholderText(/eg. 100/i);
  fireEvent.change(input, { target: { value: "100" } });
  const errorMsg = screen.queryByText(/100 is not a valid number/i);
  expect(errorMsg).toBeNull();
});

test("renders Convert with both currencies being the same", async () => {
  window.alert = jest.fn(() => ({})); // provide an empty implementation for window.alert
  render(<Converter />);
  await screen.findByText("Convert");
  const button = screen.getAllByText(/British Pound Sterling/i);
  expect(button[0]).toBeInTheDocument();
  const input = screen.getByPlaceholderText(/eg. 100/i);
  fireEvent.change(input, { target: { value: "100" } });
  const convertBtn = screen.getByRole("button", { name: "Convert" });
  fireEvent.click(convertBtn);
  const alertMock = jest.spyOn(window, "alert").mockImplementation();
  expect(alertMock).toHaveBeenCalledTimes(1);
});
