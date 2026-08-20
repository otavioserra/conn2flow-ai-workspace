$payload = @{
    systemMessage = 'Conn2Flow private project: prioritize the private repository, touch conn2flow only for generic changes, and if the user changed files manually, reread the cited files before continuing.'
} | ConvertTo-Json -Compress

Write-Output $payload