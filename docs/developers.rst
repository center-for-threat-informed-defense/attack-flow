Developers
==========

How To Run Tests
----------------

Requires Python ≥3.7 and `Python Poetry <https://python-poetry.org/>`__.

.. code:: bash

    poetry install
    poetry run pytest --flake8 --cov=src/ --cov-report term-missing
