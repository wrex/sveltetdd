/**
 * @jest-environment jsdom
 */

import SignUpPage from "./SignUpPage.svelte";
import { render, screen, waitFor } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { rest } from "msw";
import { setupServer } from "msw/node";

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
    let requestBody = {};
    let counter = 0;
    const server = setupServer(
      rest.post("/api/1.0/users", (req, res, ctx) => {
        requestBody = req.body;
        counter++;
        return res(ctx.status(200));
      })
    );

    beforeAll(() => server.listen());

    afterEach(() => {
      counter = 0;
      server.resetHandlers();
    });

    afterAll(() => server.close());

    let button;
    const renderAndFillForm = async () => {
      render(SignUpPage);
      const usernameInput = screen.getByLabelText("Username");
      const emailInput = screen.getByLabelText("Email");
      const pwInput = screen.getByLabelText("Password");
      const confPwInput = screen.getByLabelText("Confirm password");
      button = screen.getByRole("button", { name: "Sign Up" });

      await userEvent.type(usernameInput, "Joe Blow");
      await userEvent.type(emailInput, "user123@example.com");
      await userEvent.type(pwInput, "abc123");
      await userEvent.type(confPwInput, "abc123");
    };

    it("enables the button when passwords match", async () => {
      await renderAndFillForm();
      expect(button).toBeEnabled();
    });

    it("sends username/email/password when signup clicked", async () => {
      await renderAndFillForm();

      await userEvent.click(button);

      // After submitting, a success message should appear
      const message = await screen.findByText(
        "Please check your email to activate your account."
      );

      expect(requestBody).toEqual({
        username: "Joe Blow",
        email: "user123@example.com",
        password: "abc123",
      });
    });

    it("disables button while request is in progress", async () => {
      await renderAndFillForm();

      // Click button **TWICE** (only first should invoke the handler)
      await userEvent.click(button);
      await userEvent.click(button);

      // After submitting, a success message should appear
      const message = await screen.findByText(
        "Please check your email to activate your account."
      );

      expect(counter).toBe(1);
    });

    it("displays a spinner while request is in progress", async () => {
      await renderAndFillForm();

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
      await renderAndFillForm();

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
      server.use(
        rest.post("/api/1.0/users", (req, res, ctx) => {
          return res(ctx.status(400));
        })
      );

      await renderAndFillForm();

      await userEvent.click(button);

      const message = screen.queryByText(
        "Please check your email to activate your account."
      );

      await waitFor(() => {
        expect(message).not.toBeInTheDocument();
      });
    });

    it("hides form after successful sign-up", async () => {
      await renderAndFillForm();

      await userEvent.click(button);

      const form = screen.queryByTestId("sign-up-form");
      await waitFor(() => {
        expect(form).not.toBeInTheDocument();
      });
    });

    it("displays invalid username message for invalid username", async () => {
      server.use(
        rest.post("/api/1.0/users", (req, res, ctx) => {
          return res(
            ctx.status(400),
            ctx.json({
              validationErrors: {
                username: "Username cannot be null",
              },
            })
          );
        })
      );

      // Fills valid data, but server response mocked to return error regardless
      await renderAndFillForm();

      await userEvent.click(button);

      const validationError = await screen.findByText(
        "Username cannot be null"
      );
      expect(validationError).toBeInTheDocument();
    });

    it("hides spinner after response received from server", async () => {
      server.use(
        rest.post("/api/1.0/users", (req, res, ctx) => {
          return res(
            ctx.status(400),
            ctx.json({
              validationErrors: {
                username: "Username cannot be null",
              },
            })
          );
        })
      );

      // Fills valid data, but server response mocked to return error regardless
      await renderAndFillForm();

      await userEvent.click(button);

      // Use validation error to know when response received
      const validationError = await screen.findByText(
        "Username cannot be null"
      );

      const spinner = screen.queryByTestId("spinner");
      expect(spinner).not.toBeInTheDocument();
    });

    it("re-enables the button after response received from server", async () => {
      server.use(
        rest.post("/api/1.0/users", (req, res, ctx) => {
          return res(
            ctx.status(400),
            ctx.json({
              validationErrors: {
                username: "Username cannot be null",
              },
            })
          );
        })
      );

      // Fills valid data, but server response mocked to return error regardless
      await renderAndFillForm();

      await userEvent.click(button);

      // Use validation error to know when response received
      const validationError = await screen.findByText(
        "Username cannot be null"
      );

      expect(button).toBeEnabled();
    });
  });
});
