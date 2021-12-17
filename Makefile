precommit:
	pytest --cov=src/ --cov-report term-missing
	python -m attack_flow.scripts.validate_doc \
		schema/attack-flow-2021-11-03-draft.json \
		schema/attack-flow-example.json corpus/*
