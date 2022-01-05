precommit:
	pytest --cov=src/ --cov-report term-missing
	python -m attack_flow.scripts.validate_doc \
		schema/attack-flow-2022-01-05-draft.json \
		schema/attack-flow-example.json corpus/*
