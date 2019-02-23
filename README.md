

# Install dependencies

Install `pipenv` if needed by `pip install pipenv` (or `brew install pipenv` for Mac)

```
pipenv shell
pipenv install
```

# Run

```
pipenv shell
```

# Note on Python vrsions

Check out (pyenv)[https://github.com/pyenv/pyenv] for help installing multiple versions of python on your system.

For example, on Mac if you want version 3.6 of python you can;

```
# Install pyenv to support multple Python versions
brew install pyenv

# Install 3.6.4
pyenv install 3.6

# Set version
pyenv local 3.6.0

# Now you can run
pipenv shell

# Check what versions you have available with
pyenv versions

```

## Mac Notes/Gotchas

zlib doesn't seem to install, so to install a new python version do the following;

```
CFLAGS="-I$(brew --prefix readline)/include -I$(brew --prefix openssl)/include -I$(xcrun --show-sdk-path)/usr/include" \
LDFLAGS="-L$(brew --prefix readline)/lib -L$(brew --prefix openssl)/lib" \
PYTHON_CONFIGURE_OPTS=--enable-unicode=ucs2 \
pyenv install -v 3.6.0
```

Make sure to add `eval "$(pyenv init -)"` to the `.bash_profile` otherwise  `pyenv local 3.6.0` won't change the python version number.