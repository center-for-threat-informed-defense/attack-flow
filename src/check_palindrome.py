import argparse


def is_palindrome(text):
    """Tests whether the text is a palindrome. Does so by reversing the
    string and testing for equality.

    :returns: True if the text is a palindrome, false otherwise
    """
    return text == text[::-1]


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Takes an input string and determines if its a palindrome')
    parser.add_argument('text', help='The text to test for palindromicity')
    args = parser.parse_args()
    print(f'Testing {args.text} for palindromicity...')
    is_palindrome = is_palindrome(args.text)
    print(f'Is palindrome: {is_palindrome}.')
