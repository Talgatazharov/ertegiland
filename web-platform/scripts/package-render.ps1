$ErrorActionPreference = 'Stop'
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$releaseRoot = Join-Path $projectRoot 'release'
New-Item -ItemType Directory -Path $releaseRoot -Force | Out-Null
$archivePath = Join-Path $releaseRoot 'ErtegiLand-Render.zip'
$secretValue = ''
$envPath = Join-Path $projectRoot '.env'
if (Test-Path -LiteralPath $envPath) {
  $envContent = Get-Content -LiteralPath $envPath -Raw
  if ($envContent -match '(?m)^OPENAI_API_KEY=(.+)$') { $secretValue = $Matches[1].Trim() }
}
$selectedFiles = @()
foreach ($folder in @('src','server','public','scripts','tests','assets')) {
  $selectedFiles += Get-ChildItem -LiteralPath (Join-Path $projectRoot $folder) -Recurse -File
}
foreach ($file in @('package.json','package-lock.json','tsconfig.json','vite.config.ts','playwright.config.ts','index.html','render.yaml','README.md','.gitignore','.env.example')) {
  $selectedFiles += Get-Item -LiteralPath (Join-Path $projectRoot $file)
}
foreach ($file in $selectedFiles) {
  if ($secretValue -and $file.Extension -in @('.ts','.tsx','.js','.mjs','.json','.html','.md','.yaml','.ps1')) {
    if ((Get-Content -LiteralPath $file.FullName -Raw).Contains($secretValue)) { throw 'Secret detected; archive was not created.' }
  }
}
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$stream = [System.IO.File]::Open($archivePath, [System.IO.FileMode]::Create)
$archive = New-Object System.IO.Compression.ZipArchive($stream, [System.IO.Compression.ZipArchiveMode]::Create)
try {
  foreach ($file in $selectedFiles) {
    $entryName = $file.FullName.Substring($projectRoot.Length + 1).Replace('\','/')
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $file.FullName, $entryName, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
  }
} finally { $archive.Dispose(); $stream.Dispose() }
Write-Output ('Archive ready: ' + $archivePath)
Write-Output ('Files: ' + $selectedFiles.Count)
