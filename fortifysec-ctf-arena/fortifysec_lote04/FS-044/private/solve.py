import csv
from pathlib import Path
p=Path(__file__).resolve().parent.parent/'public';rows=list(csv.DictReader((p/'telemetry.csv').open()));print(next(r['artifact'] for r in rows if r['level']=='SEVERE')[::-1])
