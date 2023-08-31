# Configuration file for the Sphinx documentation builder.
#
# This file only contains a selection of the most common options. For a full
# list see the documentation:
# https://www.sphinx-doc.org/en/master/usage/configuration.html

# -- Path setup --------------------------------------------------------------

# If extensions (or modules to document with autodoc) are in another directory,
# add these directories to sys.path here. If the directory is relative to the
# documentation root, use os.path.abspath to make it absolute, like shown here.
#
# import os
# import sys
# sys.path.insert(0, os.path.abspath('.'))


# -- Project information -----------------------------------------------------

project = "Attack Flow"
copyright = "2022, Center for Threat-Informed Defense"
author = "Center for Threat-Informed Defense"

# The full version, including alpha/beta/rc tags
version = "v2.1.0"
release = version


# -- General configuration ---------------------------------------------------

# Add any Sphinx extension module names here, as strings. They can be
# extensions coming with Sphinx (named 'sphinx.ext.*') or your custom
# ones.
extensions = [
    "sphinx_rtd_theme",
]

# Add any paths that contain templates here, relative to this directory.
templates_path = ["_templates"]

# List of patterns, relative to source directory, that match files and
# directories to ignore when looking for source files.
# This pattern also affects html_static_path and html_extra_path.
exclude_patterns = ["_build", "Thumbs.db", ".DS_Store"]


# -- Options for HTML output -------------------------------------------------

# The theme to use for HTML and HTML Help pages.  See the documentation for
# a list of builtin themes.
#
html_theme = "sphinx_rtd_theme"
html_static_path = ["_static"]
html_extra_path = ["extra"]
html_favicon = "_static/favicon.png"
html_logo = "_static/ctid_logo_white.png"
html_css_files = [
    "css/ctid.css",
]
html_copy_source = False
html_show_sourcelink = False
html_show_sphinx = False
html_use_smartypants = False

html_theme_options = {
    "analytics_id": "G-G4TFP56139",
    "display_version": True,
    "logo_only": True,
    "style_external_links": True,
}
