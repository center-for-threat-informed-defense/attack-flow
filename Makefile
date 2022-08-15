ROOTDIR := $(dir $(abspath $(lastword $(MAKEFILE_LIST))))
SOURCEDIR = docs/
BUILDDIR = docs/_build/

.PHONY: docs

docs:
	sphinx-build -M dirhtml "$(SOURCEDIR)" "$(BUILDDIR)"

docs-examples:
	mkdir -p docs/extra/corpus
	cp -r corpus.af1/*.json docs/extra/corpus
	ls -1 corpus.af1/*.json | sed 's/corpus\.af1\/\(.*\)\.json/\1/' | xargs -I {} af graphviz "corpus.af1/{}.json" "docs/extra/corpus/{}.dot"
	ls -1 docs/extra/corpus/*.dot | xargs -I {} dot -Tpng -O -q1 "{}"

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
		schema/attack-flow-2022-01-05-draft.json \
		schema/attack-flow-example.json \
		corpus/*.json
