"""Copyright 2016 Dana-Farber Cancer Institute"""

from setuptools import setup
setup(name='matchengine',
      version='0.1.0',
      description="clinical trial matching algorithm",
      author="Zachary Zwiesler",
      author_email="zacharyt_zwiesler@dfci.harvard.edu",
      url="https://gitlab-bcb.dfci.harvard.edu/knowledge-systems/matchminer-engine",
      packages=["matchengine"],
      install_requires=['Cerberus', 'networkx', 'nose', 'pandas', 'pymongo', 'PyYAML']
      )
