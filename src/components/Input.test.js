/**
 * @jest-environment jsdom
 */

import Input from "./Input.svelte";
import { render, screen } from "@testing-library/svelte";

describe("input component", () => {
  it("has is-invalid class when validationMsg is set", () => {
    const { container } = render(Input, { validationMsg: "Invalid input" });
    const input = container.querySelector("input");
    expect(input.classList).toContain("is-invalid");
  });

  it("has invalid-feedback class when validationMsg is set", () => {
    const { container } = render(Input, { validationMsg: "Invalid input" });
    const span = container.querySelector("span");
    expect(span.classList).toContain("invalid-feedback");
  });
});

it("does not have is-invalid class for valid input", () => {
  const { container } = render(Input);
  const input = container.querySelector("input");
  expect(input.classList).not.toContain("is-invalid");
});

it("does not display validation message initially", () => {
  render(Input);
  const validationAlert = screen.queryByRole("alert");
  expect(validationAlert).not.toBeInTheDocument();
});
