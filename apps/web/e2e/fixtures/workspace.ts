import { test as base } from "@playwright/test";
import { authenticate, createAccount } from "../helpers/accounts";

export { expect } from "@playwright/test";

export const test = base.extend<{ workspaceSession: undefined }>({
  workspaceSession: [
    async ({ context }, use) => {
      const account = await createAccount();
      try {
        await authenticate(context, account);
        await use(undefined);
      } finally {
        await account.cleanup();
      }
    },
    { auto: true },
  ],
});
