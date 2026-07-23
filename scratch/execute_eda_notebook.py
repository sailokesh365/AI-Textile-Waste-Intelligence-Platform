import os
import sys
import nbformat
from nbclient import NotebookClient

notebook_path = os.path.abspath("notebooks/EDA.ipynb")
print(f"Reading notebook: {notebook_path}")

with open(notebook_path, "r", encoding="utf-8") as f:
    nb = nbformat.read(f, as_version=4)

client = NotebookClient(nb, timeout=600, kernel_name="python3", allow_errors=False)

print("Executing notebook cells...")
client.execute()

with open(notebook_path, "w", encoding="utf-8") as f:
    nbformat.write(nb, f)

print(f"Notebook execution completed successfully! Saved to: {notebook_path}")
