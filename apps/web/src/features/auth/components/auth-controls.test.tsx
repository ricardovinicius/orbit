import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { signOut, startGoogleSignIn } from "../actions";
import { GoogleSignInButton } from "./google-sign-in-button";
import { SignOutButton } from "./sign-out-button";

vi.mock("../actions", () => ({ startGoogleSignIn: vi.fn(), signOut: vi.fn() }));
it("announces pending sign-in, prevents duplicate submissions, and allows retry", async () => {
  let finish: (value: { error: string }) => void = () => {};
  vi.mocked(startGoogleSignIn)
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    )
    .mockResolvedValue({ error: "Try again" });
  render(<GoogleSignInButton next="/week?day=1" />);
  const user = userEvent.setup();
  const button = screen.getByRole("button", { name: /continue with google/i });
  await user.click(button);
  await user.click(button);
  expect(button).toBeDisabled();
  expect(screen.getByRole("status")).toHaveTextContent("Taking you to Google");
  expect(startGoogleSignIn).toHaveBeenCalledTimes(1);
  finish({ error: "Try again" });
  expect(await screen.findByRole("alert")).toHaveTextContent("Try again");
  await user.click(button);
  expect(startGoogleSignIn).toHaveBeenCalledTimes(2);
  expect(startGoogleSignIn).toHaveBeenCalledWith("/week?day=1");
});
it("keeps sign-out retryable when revocation fails", async () => {
  vi.mocked(signOut).mockResolvedValue({ error: "Could not sign out" });
  render(<SignOutButton />);
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: "Sign out" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Could not sign out",
  );
  await waitFor(() =>
    expect(screen.getByRole("button", { name: "Sign out" })).toBeEnabled(),
  );
});
