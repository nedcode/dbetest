import subprocess
from pathlib import Path

url = (
    "https://storage01.dbe.academy/"
    "232.02.webdev/test-023.login/index.php"
)

result = subprocess.run(
    [
        "linkchecker",
        "--no-status",
        "--output=html",
        url
    ],
    capture_output=True,
    text=True
)

Path("link-report.html").write_text(
    result.stdout,
    encoding="utf-8"
)

print(f"Exit code: {result.returncode}")
print("Report: link-report.html")

raise SystemExit(result.returncode)