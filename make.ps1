$foo = (Get-Content 'manifest.json' | Out-String | ConvertFrom-Json)

Write-Host $foo.version
$name = $foo.version+".zip"
if (!(Test-Path $name -PathType leaf))
{
    Compress-Archive -Path manifest.json -DestinationPath $name
    Compress-Archive -Update -Path background.js -DestinationPath $name
    Compress-Archive -Update -Path _locales -DestinationPath $name
    Compress-Archive -Update -Path content_scripts -DestinationPath $name
    Compress-Archive -Update -Path icons -DestinationPath $name
    Compress-Archive -Update -Path ui -DestinationPath $name
} else {
    Write-Host $foo.version exists
}