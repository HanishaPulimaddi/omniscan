# hashing.py
# -----------------------------------
# Plain text mode (NO bcrypt)
# -----------------------------------

def hash_password(password: str) -> str:
    """
    In plain text mode, return password as-is.
    Only for development/testing.
    """
    return password


def verify_password(plain_password: str, stored_password: str) -> bool:
    """
    Compare passwords directly in plain text.
    """
    return plain_password == stored_password
