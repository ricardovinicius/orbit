.DEFAULT_GOAL := help

.PHONY: help prototype prototype-install prototype-dev web web-install web-dev

help:
	@echo "make web                Install dependencies and start the web app"
	@echo "make web-install        Install web app dependencies"
	@echo "make web-dev            Start the web development server"
	@echo "make prototype          Install dependencies and start the prototype"
	@echo "make prototype-install  Install prototype dependencies"
	@echo "make prototype-dev      Start the prototype development server"

prototype: prototype-install
	$(MAKE) prototype-dev

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
