# Stage all changes (modified + new files). Run from repo root.
# Usage: .\git-commit-all.ps1   then edit message, or: .\git-commit-all.ps1 -Message "your message"

param([string]$Message = "feat: Unified Song Experience + tag UI + contribution & discovery updates")

git add -A
git status --short
Write-Host "`nStaged all. Commit with message: $Message"
git commit -m $Message
Write-Host "`nDone. Push with: git push origin mobile"
