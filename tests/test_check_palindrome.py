import pytest

import check_palindrome


@pytest.mark.parametrize('text,result', [
    ('', True),
    ('a', True),
    ('ab', False),
    ('a man a plan a canal panama', False)
])
def test_is_palindrome_returns_correct_value(text, result):
    # Act
    is_palindrome = check_palindrome.is_palindrome(text)

    # Assert
    assert is_palindrome == result


def test_is_palindrome_raises_typeerror_on_none():
    # Arrange
    none_text = None

    # Act / Assert
    with pytest.raises(TypeError):
        check_palindrome.is_palindrome(none_text)


def test_is_palindrome_raises_typeerror_on_int():
    # Arrange
    number = 55

    # Act / Assert
    with pytest.raises(TypeError):
        check_palindrome.is_palindrome(number)
