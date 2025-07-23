# Local TypeScript definition testing script for Windows
Write-Host "Building package..." -ForegroundColor Green
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Packing package..." -ForegroundColor Green
npm pack

if ($LASTEXITCODE -ne 0) {
    Write-Host "Pack failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Setting up test environment..." -ForegroundColor Green
New-Item -ItemType Directory -Force -Path "test-types-local" | Out-Null
Set-Location "test-types-local"

Write-Host "Installing packed package..." -ForegroundColor Green
npm init -y | Out-Null
$tarball = Get-ChildItem -Path ".." -Filter "hed-validator-*.tgz" | Select-Object -First 1
if ($tarball) {
    npm install "../$($tarball.Name)" typescript "@types/node" tsx | Out-Null
} else {
    Write-Host "No tarball found!" -ForegroundColor Red
    Set-Location ".."
    exit 1
}

Write-Host "Copying test file..." -ForegroundColor Green
Copy-Item "../types/test.ts" "./test.ts"

Write-Host "Testing TypeScript compilation..." -ForegroundColor Green
npx tsc --noEmit --strict test.ts

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ TypeScript compilation passed!" -ForegroundColor Green
} else {
    Write-Host "❌ TypeScript compilation failed!" -ForegroundColor Red
    Set-Location ".."
    Remove-Item -Recurse -Force "test-types-local"
    Remove-Item -Force "hed-validator-*.tgz"
    exit 1
}

Write-Host "Creating runtime test..." -ForegroundColor Green
@"
import { getLocalSchemaVersions } from 'hed-validator'

const versions = getLocalSchemaVersions()
console.log('✅ Available schema versions:', versions.length)
console.log('✅ First version:', versions[0])

// Type check
const firstVersion: string = versions[0]
console.log('✅ Type test passed')
"@ | Out-File -FilePath "runtime-test.ts" -Encoding UTF8

Write-Host "Running runtime test..." -ForegroundColor Green
npx tsx runtime-test.ts

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Runtime test passed!" -ForegroundColor Green
} else {
    Write-Host "❌ Runtime test failed!" -ForegroundColor Red
    Set-Location ".."
    Remove-Item -Recurse -Force "test-types-local"
    Remove-Item -Force "hed-validator-*.tgz"
    exit 1
}

Write-Host "Cleaning up..." -ForegroundColor Green
Set-Location ".."
Remove-Item -Recurse -Force "test-types-local"
Remove-Item -Force "hed-validator-*.tgz"

Write-Host "✅ All TypeScript definition tests passed!" -ForegroundColor Green
