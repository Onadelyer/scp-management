from setuptools import setup, find_packages

setup(
    name="scp-management-backend",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "fastapi",
        "uvicorn",
        "sqlalchemy",
        "pydantic",
        "passlib[bcrypt]",
        "python-jose",
        "psycopg2-binary",
        "bcrypt",
    ],
    extras_require={
        "dev": [
            "pytest",
            "pytest-cov",
            "httpx",
        ],
    },
) 