/**
 * @jest-environment jsdom
 */

import SignUpPage from "./SignUpPage.svelte";
import { render, screen, waitFor } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { setupServer } from "msw/node";
import { rest } from "msw";

describe("Sign Up page", () => {
  describe("layout", () => {
    it("has a Sign Up header", () => {
      render(SignUpPage);
      const header = screen.getByRole("heading", { name: "Sign Up" });
      expect(header).toBeInTheDocument();
    });

    it("has a username input element", () => {
      render(SignUpPage);
      const input = screen.getByLabelText("Username");
      expect(input).toBeInTheDocument();
    });

    it("has an email input element", () => {
      render(SignUpPage);
      const input = screen.getByLabelText("Email");
      expect(input).toBeInTheDocument();
    });

    it("has a password input element", () => {
      render(SignUpPage);
      const input = screen.getByLabelText("Password");
      expect(input).toBeInTheDocument();
    });

    it("has a password type for password element", () => {
      render(SignUpPage);
      const input = screen.getByLabelText("Password");
      expect(input.type).toBe("password");
    });

    it("has a confirm password input element", () => {
      render(SignUpPage);
      const input = screen.getByLabelText("Confirm password");
      expect(input).toBeInTheDocument();
    });

    it("has a password type for confirm password element", () => {
      render(SignUpPage);
      const input = screen.getByLabelText("Confirm password");
      expect(input.type).toBe("password");
    });

    it("has a Sign Up button", () => {
      render(SignUpPage);
      const button = screen.getByRole("button", { name: "Sign Up" });
      expect(button).toBeInTheDocument();
    });

    it("disables the Sign Up button initially", () => {
      render(SignUpPage);
      const button = screen.getByRole("button", { name: "Sign Up" });
      expect(button).toBeDisabled();
    });
  });

  describe("interactions", () => {
    const renderAndFillForm = async () => {
      render(SignUpPage);
      const usernameInput = screen.getByLabelText("Username");
      const emailInput = screen.getByLabelText("Email");
      const pwInput = screen.getByLabelText("Password");
      const confPwInput = screen.getByLabelText("Confirm password");

      await userEvent.type(usernameInput, "Joe Blow");
      await userEvent.type(emailInput, "user123@example.com");
      await userEvent.type(pwInput, "abc123");
      await userEvent.type(confPwInput, "abc123");
    };

    it("enables the button when passwords match", async () => {
      await renderAndFillForm();
      const button = screen.getByRole("button", { name: "Sign Up" });
      expect(button).toBeEnabled();
    });

    it("sends username/email/password when signup clicked", async () => {
      let requestBody = {};
      const server = setupServer(
        rest.post("/api/1.0/users", (req, res, ctx) => {
          requestBody = req.body;
          return res(ctx.status(200));
        })
      );

      server.listen();
      await renderAndFillForm();

      const button = screen.getByRole("button", { name: "Sign Up" });

      await userEvent.click(button);

      await server.close();

      expect(requestBody).toEqual({
        username: "Joe Blow",
        email: "user123@example.com",
        password: "abc123",
      });
    });

    it("disables button while request is in progress", async () => {
      let requestBody = {};
      let counter = 0;
      const server = setupServer(
        rest.post("/api/1.0/users", (req, res, ctx) => {
          counter++;
          requestBody = req.body;
          return res(ctx.status(200));
        })
      );

      server.listen();
      await renderAndFillForm();

      const button = screen.getByRole("button", { name: "Sign Up" });

      // Click button **TWICE** (only first should invoke the handler)
      await userEvent.click(button);
      await userEvent.click(button);

      await server.close();

      expect(counter).toBe(1);
    });

    it("displays a spinner while request is in progress", async () => {
      const server = setupServer(
        rest.post("/api/1.0/users", (req, res, ctx) => {
          return res(ctx.status(200));
        })
      );

      server.listen();
      await renderAndFillForm();

      const button = screen.getByRole("button", { name: "Sign Up" });
      await userEvent.click(button);

      const spinner = screen.getByTestId("spinner");
      expect(spinner).toBeInTheDocument();
    });

    it("does not display a spinner unless a request is in progress", async () => {
      await renderAndFillForm();
      const spinner = screen.queryByTestId("spinner");
      expect(spinner).not.toBeInTheDocument();
    });

    it("displays 'please activate' message after successful signup", async () => {
      const server = setupServer(
        rest.post("/api/1.0/users", (req, res, ctx) => {
          return res(ctx.status(200));
        })
      );

      server.listen();
      await renderAndFillForm();

      const button = screen.getByRole("button", { name: "Sign Up" });
      await userEvent.click(button);

      const message = await screen.findByText(
        "Please check your email to activate your account."
      );
      expect(message).toBeInTheDocument();
    });

    it("does not display activation message before request", async () => {
      await renderAndFillForm();
      const message = screen.queryByText(
        "Please check your email to activate your account."
      );
      expect(message).not.toBeInTheDocument();
    });

    it("does not display 'please activate' after failed request", async () => {
      // return 400 Bad Request
      const server = setupServer(
        rest.post("/api/1.0/users", (req, res, ctx) => {
          return res(ctx.status(400));
        })
      );

      server.listen();
      await renderAndFillForm();

      const button = screen.getByRole("button", { name: "Sign Up" });
      await userEvent.click(button);

      await server.close();

      const message = screen.queryByText(
        "Please check your email to activate your account."
      );
      expect(message).not.toBeInTheDocument();
    });
  });
});
