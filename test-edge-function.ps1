# Script para testar a Edge Function ai-calculate-budget-v9

$headers = @{
    "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFucnBoaWp1b3N0Ymdic2N4bXp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5NDc0OTcsImV4cCI6MjA2MTUyMzQ5N30.6I89FlKMWwckt7xIqt6i9HxrI0MkupzWIbKlhINblUc"
    "Content-Type" = "application/json"
}

$body = @{
    orcamento_id = "8c5cdd22-83ae-47a1-a0c8-2b9f494fb405"
    forcar_recalculo = $true
} | ConvertTo-Json

$url = "https://anrphijuostbgbscxmzx.supabase.co/functions/v1/ai-calculate-budget-v9"

Write-Host "Testando Edge Function..."
Write-Host "URL: $url"
Write-Host "Body: $body"

try {
    $response = Invoke-RestMethod -Uri $url -Method POST -Headers $headers -Body $body
    Write-Host "Resposta da Edge Function:"
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Erro ao chamar Edge Function:"
    Write-Host $_.Exception.Message
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody"
    }
}