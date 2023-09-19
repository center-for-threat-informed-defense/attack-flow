ROOTDIR := $(dir $(abspath $(lastword $(MAKEFILE_LIST))))
SOURCEDIR = docs/
BUILDDIR = docs/_build/

.PHONY: help
help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}' | sort

.PHONY: docs
docs: ## Build Sphinx documentation
	sphinx-build -M dirhtml "$(SOURCEDIR)" "$(BUILDDIR)"

docs-server: ## Run the Sphinx dev server
	sphinx-autobuild -b dirhtml -a "$(SOURCEDIR)" "$(BUILDDIR)"

src/attack_flow_builder/dist/cli.common.js: src/attack_flow_builder/src/cli.ts
	cd src/attack_flow_builder && env VUE_CLI_SERVICE_CONFIG_PATH="${ROOTDIR}src/attack_flow_builder/vue.cli.config.js" npx vue-cli-service build --target lib --name cli --formats commonjs --no-clean src/cli.ts

docs-examples: src/attack_flow_builder/dist/cli.common.js ## Build example flows
	mkdir -p docs/extra/corpus
	cp corpus/*.afb docs/extra/corpus
	node src/attack_flow_builder/dist/cli.common.js --verbose corpus/*.afb
	cp corpus/*.json docs/extra/corpus
	ls -1 corpus/*.json | sed 's/corpus\/\(.*\)\.json/\1/' | xargs -t -I {} af graphviz "corpus/{}.json" "docs/extra/corpus/{}.dot"
	ls -1 docs/extra/corpus/*.dot | xargs -t -I {} dot -Tpng -O -q1 "{}"
	ls -1 corpus/*.json | sed 's/corpus\/\(.*\)\.json/\1/' | xargs -t -I {} af mermaid "corpus/{}.json" "docs/extra/corpus/{}.mmd"
	ls -1 corpus/*.json | sed 's/corpus\/\(.*\)\.json/\1/' | xargs -t -I {} mmdc -i "docs/extra/corpus/{}.mmd" -o "docs/extra/corpus/{}.mmd.png"
	af doc-examples corpus/ docs/example_flows.rst

docs-matrix: ## Build the Navigator visualization JS code
	mkdir -p docs/extra/matrix
	cp src/matrix-viz/* docs/extra/matrix/

docs-schema: ## Build the schema documentation
	af doc-schema stix/attack-flow-schema-2.0.0.json stix/attack-flow-example.json docs/language.rst

docs-pdf: ## Build Sphinx documentation in PDF format.
	poetry export --dev --without-hashes -f requirements.txt -o docs/requirements.txt
	docker run --rm -v "$(PWD)/docs":/docs sphinxdoc/sphinx-latexpdf:4.3.1 \
		bash -c "pip install -r requirements.txt && sphinx-build -M latexpdf /docs /docs/_build"
	rm docs/requirements.txt

test: ## Run Python tests
	pytest --cov=src/ --cov-report=term-missing

test-ci: ## Run Python tests with XML coverage.
	pytest --cov=src/ --cov-report=xml

validate: src/attack_flow_builder/dist/cli.common.js ## Validate all flows in the corpus.
	mkdir -p docs/extra/corpus
	cp corpus/*.afb docs/extra/corpus
	node src/attack_flow_builder/dist/cli.common.js --verbose corpus/*.afb
	af validate \
		stix/attack-flow-example.json \
		corpus/*.json

docker-build: ## Build the Docker image.
	docker build . -t attack-flow-builder:latest

docker-run: ## Run the Docker image.
	docker run --rm -p 8080:80 attack-flow-builder:latest
