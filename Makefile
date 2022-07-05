precommit:
	pytest --flake8 --cov=src/ --cov-report term-missing
	python -m attack_flow.scripts.validate_doc \
		schema/attack-flow-2022-01-05-draft.json \
		schema/attack-flow-example.json corpus/*.json

docker-build:
	docker build . -t attack-flow-builder:latest

docker-run:
	docker run --rm -p 8080:80 attack-flow-builder:latest
