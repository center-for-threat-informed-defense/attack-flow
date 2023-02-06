ROOTDIR := $(dir $(abspath $(lastword $(MAKEFILE_LIST))))
SOURCEDIR = docs/
BUILDDIR = docs/_build/

.PHONY: docs

docs:
	sphinx-build -M dirhtml "$(SOURCEDIR)" "$(BUILDDIR)"

docs-examples:
	mkdir -p docs/extra/corpus
	cp corpus/*.afb docs/extra/corpus
	cp corpus/*.json docs/extra/corpus
	ls -1 corpus/*.json | sed 's/corpus\/\(.*\)\.json/\1/' | xargs -I {} af graphviz "corpus/{}.json" "docs/extra/corpus/{}.dot"
	ls -1 docs/extra/corpus/*.dot | xargs -I {} dot -Tpng -O -q1 "{}"
	ls -1 corpus/*.json | sed 's/corpus\/\(.*\)\.json/\1/' | xargs -I {} af mermaid "corpus/{}.json" "docs/extra/corpus/{}.mmd"
	ls -1 corpus/*.json | sed 's/corpus\/\(.*\)\.json/\1/' | xargs -I {} mmdc -i "docs/extra/corpus/{}.mmd" -o "docs/extra/corpus/{}.mmd.png"
	af doc-examples corpus/ docs/example_flows.rst

docs-matrix:
	mkdir -p docs/extra/matrix
	cp src/matrix-viz/* docs/extra/matrix/

docs-schema:
	af doc-schema stix/attack-flow-schema-2.0.0.json stix/attack-flow-example.json docs/language.rst

docs-server:
	sphinx-autobuild -b dirhtml -a "$(SOURCEDIR)" "$(BUILDDIR)"

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
		stix/attack-flow-example.json \
		corpus/*.json

docker-build:
	docker build . -t attack-flow-builder:latest

docker-run:
	docker run --rm -p 8080:80 attack-flow-builder:latest
