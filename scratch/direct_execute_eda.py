import os
import sys
import io
import json
import base64
import contextlib
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import pandas as pd

plt.show = lambda *args, **kwargs: None

notebook_path = os.path.abspath("notebooks/EDA.ipynb")
print(f"Loading notebook: {notebook_path}", flush=True)

with open(notebook_path, "r", encoding="utf-8") as f:
    nb = json.load(f)

exec_globals = {}
exec_count = 1

for cell in nb["cells"]:
    if cell["cell_type"] != "code":
        continue
    
    code = "".join(cell["source"])
    print(f"Executing Cell {exec_count}...", flush=True)
    
    cell["outputs"] = []
    cell["execution_count"] = exec_count
    
    stdout_buf = io.StringIO()
    plt.close('all')
    
    try:
        with contextlib.redirect_stdout(stdout_buf):
            lines = [l for l in code.splitlines() if l.strip() and not l.strip().startswith('#')]
            if lines and not lines[-1].startswith(('import ', 'from ', 'print(', 'plt.', 'os.', 'sys.', 'for ', 'if ', 'def ', 'class ', 'with ', 'assert ')):
                exec_code = "\n".join(code.splitlines()[:-1])
                last_expr = lines[-1]
                if exec_code.strip():
                    exec(exec_code, exec_globals)
                res = eval(last_expr, exec_globals)
            else:
                exec(code, exec_globals)
                res = None
                
    except Exception as e:
        print(f"Error in cell {exec_count}: {e}", flush=True)
        import traceback
        traceback.print_exc()
        raise e
        
    out_str = stdout_buf.getvalue()
    if out_str:
        print(f"Cell {exec_count} Output length: {len(out_str)}", flush=True)
        cell["outputs"].append({
            "name": "stdout",
            "output_type": "stream",
            "text": out_str.splitlines(True)
        })
        
    if res is not None and isinstance(res, pd.DataFrame):
        cell["outputs"].append({
            "data": {
                "text/html": [res.to_html()],
                "text/plain": [res.to_string()]
            },
            "execution_count": exec_count,
            "metadata": {},
            "output_type": "execute_result"
        })
        
    # Capture figures
    figs = [plt.figure(i) for i in plt.get_fignums()]
    for fig in figs:
        img_buf = io.BytesIO()
        fig.savefig(img_buf, format='png', bbox_inches='tight', dpi=150)
        img_buf.seek(0)
        img_b64 = base64.b64encode(img_buf.read()).decode('utf-8')
        
        cell["outputs"].append({
            "data": {
                "image/png": img_b64,
                "text/plain": ["<Figure size ...>"]
            },
            "metadata": {},
            "output_type": "display_data"
        })
        plt.close(fig)
        
    exec_count += 1

with open(notebook_path, "w", encoding="utf-8") as f:
    json.dump(nb, f, indent=1)

print(f"\nAll {exec_count-1} cells executed successfully without errors!", flush=True)
print(f"Notebook updated with full execution outputs at: {notebook_path}", flush=True)
