# We avoid $(CURDIR) because it spits out /cygdrive/c/... on Windows Cygwin
# installs and leads to things that don't work.
VIRTUAL_ENV = venv
PYTHON3 ?= python3

# Let us find jsdoc and sphinx:
export PATH := node_modules/.bin:$(VIRTUAL_ENV)/bin:$(VIRTUAL_ENV)/Scripts:$(PATH)

# I'm not entirely sure why this line is needed yet...
.PHONY: js

# Verify venv exists
.PHONY: venv
venv: $(VIRTUAL_ENV)/pyvenv.cfg

$(VIRTUAL_ENV)/pyvenv.cfg:
	$(PYTHON3) -m venv $(VIRTUAL_ENV)
	PATH="$(PATH)" pip3 install -r requirements.txt

# Not sure if this is needed...
# .npm_installed: ../package.json
# 	npm install
# 	touch $@

# You can set these variables from the command line, and also
# from the environment for the first two.
SPHINXOPTS    ?=
SPHINXBUILD   ?= sphinx-build
SOURCEDIR     = source
BUILDDIR      = _build

# Put it first so that "make" without argument is like "make help".
help:
	@$(SPHINXBUILD) -M help "$(SOURCEDIR)" "$(BUILDDIR)" $(SPHINXOPTS) $(O)

.PHONY: help Makefile

# Catch-all target: route all unknown targets to Sphinx using the new
# "make mode" option.  $(O) is meant as a shortcut for $(SPHINXOPTS).
%: Makefile
	@$(SPHINXBUILD) -M $@ "$(SOURCEDIR)" "$(BUILDDIR)" $(SPHINXOPTS) $(O)



# Delete just the built docs, not the whole venv, which is expensive to
# reconstitute:
.PHONY: clean
clean:
	rm -rf $(BUILDDIR)
	rm -rf node_modules .npm_installed