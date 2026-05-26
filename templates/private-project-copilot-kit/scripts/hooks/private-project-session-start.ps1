$payload = @{
    systemMessage = 'Projeto privado Conn2Flow: priorize o repositorio privado, toque conn2flow apenas para mudancas genericas e, se o usuario alterou arquivos manualmente, releia os arquivos citados antes de continuar.'
} | ConvertTo-Json -Compress

Write-Output $payload