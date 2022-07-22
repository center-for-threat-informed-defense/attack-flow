ROOTDIR := $(dir $(abspath $(lastword $(MAKEFILE_LIST))))
SOURCEDIR = docs/
BUILDDIR = docs/_build

.PHONY: docs

docs:
	sphinx-build -M html "$(SOURCEDIR)" "$(BUILDDIR)"

docs-examples:
	cp -r corpus/*.json docs/extra/corpus
	poetry run ls -1 corpus/*.json | sed 's/corpus\/\(.*\)\.json/\1/' | xargs -I {} af graphviz corpus/{}.json docs/extra/corpus/{}.dot
	ls -1 docs/extra/corpus/*.dot | xargs dot -Tpng -O

docs-schema:
	poetry run af doc-schema schema/attack-flow-2022-01-05-draft.json docs/standard.rst

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
