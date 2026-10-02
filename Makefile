.DEFAULT_GOAL := help

.PHONY: help prototype prototype-install prototype-dev

help:
	@echo "make prototype          Install dependencies and start the prototype"
	@echo "make prototype-install  Install prototype dependencies"
	@echo "make prototype-dev      Start the prototype development server"

prototype: prototype-install
	$(MAKE) prototype-dev

prototype-install:
	pnpm --dir apps/prototype install --frozen-lockfile

prototype-dev:
	pnpm --dir apps/prototype dev
