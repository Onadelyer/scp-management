import pytest

def test_always_pass():
    """
    This test will always pass
    """
    assert True

def test_simple_math():
    """
    A simple math test that will always pass
    """
    assert 2 + 2 == 4
    
def test_string_operation():
    """
    A simple string test that will always pass
    """
    assert "hello" + " world" == "hello world" 