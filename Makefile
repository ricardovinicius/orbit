.DEFAULT_GOAL := help
SUPABASE := pnpm dlx supabase@2.121.0 --workdir apps

.PHONY: help prototype prototype-install prototype-dev web web-install web-dev
.PHONY: web-lint web-lint-fix web-format web-format-check web-check web-typecheck
.PHONY: web-test web-test-watch web-test-e2e web-test-e2e-all web-test-e2e-ui
.PHONY: quality web-quality
.PHONY: docker-up docker-down supabase-start supabase-stop supabase-status

help:
	@echo "make docker-up          Build and start the web container"
	@echo "make docker-down        Stop the web container"
	@echo "make supabase-start     Start the local Supabase stack"
	@echo "make supabase-stop      Stop the local Supabase stack"
	@echo "make supabase-status    Show local Supabase endpoints and keys"
	@echo "make quality            Run all web quality checks"
	@echo "make web                Install dependencies and start the web app"
	@echo "make web-install        Install web app dependencies"
	@echo "make web-dev            Start the web development server"
	@echo "make web-quality        Run all web quality checks"
	@echo "make web-lint           Lint the web app"
	@echo "make web-lint-fix       Fix web app lint issues"
	@echo "make web-format         Format the web app"
	@echo "make web-format-check   Check web app formatting"
	@echo "make web-check          Run web app Biome checks"
	@echo "make web-typecheck      Check web app types"
	@echo "make web-test           Run web app unit tests"
	@echo "make web-test-watch     Run web app unit tests in watch mode"
	@echo "make web-test-e2e       Run web app E2E tests in Chromium"
	@echo "make web-test-e2e-all   Run web app E2E tests in all configured browsers"
	@echo "make web-test-e2e-ui    Open the web app E2E test UI"
	@echo "make prototype          Install dependencies and start the prototype"
	@echo "make prototype-install  Install prototype dependencies"
	@echo "make prototype-dev      Start the prototype development server"

prototype: prototype-install
	$(MAKE) prototype-dev

docker-up:
	docker compose up --build --detach --wait

docker-down:
	docker compose down

supabase-start:
	$(SUPABASE) start

supabase-stop:
	$(SUPABASE) stop

supabase-status:
	$(SUPABASE) status

prototype-install:
	pnpm --dir apps/prototype install --frozen-lockfile

prototype-dev:
	pnpm --dir apps/prototype dev

web: web-install
	$(MAKE) web-dev

web-install:
	pnpm --dir apps/web install --frozen-lockfile

web-dev:
	pnpm --dir apps/web dev

quality: web-quality

web-quality: web-check web-typecheck web-test web-test-e2e

web-lint:
	pnpm --dir apps/web lint

web-lint-fix:
	pnpm --dir apps/web lint:fix

web-format:
	pnpm --dir apps/web format

web-format-check:
	pnpm --dir apps/web format:check

web-check:
	pnpm --dir apps/web check

web-typecheck:
	pnpm --dir apps/web typecheck

web-test:
	pnpm --dir apps/web test

web-test-watch:
	pnpm --dir apps/web test:watch

web-test-e2e:
	pnpm --dir apps/web test:e2e

web-test-e2e-all:
	pnpm --dir apps/web test:e2e:all

web-test-e2e-ui:
	pnpm --dir apps/web test:e2e:ui
