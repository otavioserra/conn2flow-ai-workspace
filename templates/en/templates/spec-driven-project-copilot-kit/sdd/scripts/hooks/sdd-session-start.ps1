$payload = @{
    systemMessage = 'SDD repository: read sdd/README.md, process docs, the current batch, the validation checklist, and the decision log before changing code or SDD artifacts; route requirement changes through a change request before implementing.'
} | ConvertTo-Json -Compress

Write-Output $payload