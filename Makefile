ROOTDIR := $(dir $(abspath $(lastword $(MAKEFILE_LIST))))
SOURCEDIR = docs/
BUILDDIR = docs/_build

.PHONY: docs

docs:
	sphinx-build -M html "$(SOURCEDIR)" "$(BUILDDIR)"

docs-server:
	sphinx-autobuild -a "$(SOURCEDIR)" "$(BUILDDIR)"

docs-pdf:
	poetry export --dev --without-hashes -f requirements.txt -o docs/requirements.txt
	docker run --rm -v "$(PWD)/docs":/docs sphinxdoc/sphinx-latexpdf:4.3.1 \
		bash -c "pip install -r requirements.txt && sphinx-build -M latexpdf /docs /docs/_build"
	rm docs/requirements.txt

test:
	pytest --cov=src/ --cov-report=term-missing

test-ci:
	pytest --cov=src/ --cov-report=xml

validate:
	af validate \
		schema/attack-flow-2022-01-05-draft.json \
		schema/attack-flow-example.json \
		corpus/*.json

docker-build:
	docker build . -t attack-flow-builder:latest

docker-run:
	docker run --rm -p 8080:80 attack-flow-builder:latest
