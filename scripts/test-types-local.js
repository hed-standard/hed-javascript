#!/usr/bin/env node

/**
 * Cross-platform script runner for TypeScript definition testing
 * Automatically detects the platform and runs the appropriate script
 */

const { spawn } = require('node:child_process')
const path = require('node:path')

function runScript() {
  const isWindows = process.platform === 'win32'

  let command, args

  if (isWindows) {
    // Windows: Run PowerShell script
    command = 'powershell'
    args = ['-ExecutionPolicy', 'Bypass', '-File', './scripts/test-types-local-windows.ps1']
  } else {
    // Unix/Linux/macOS: Run bash script
    command = 'bash'
    args = ['./scripts/test-types-local-unix.sh']
  }

  console.log(`Running TypeScript definition tests on ${isWindows ? 'Windows' : 'Unix/Linux/macOS'}...`)

  const childProcess = spawn(command, args, {
    stdio: 'inherit',
    shell: true,
  })

  childProcess.on('error', (error) => {
    console.error(`Failed to start script: ${error.message}`)
    process.exit(1)
  })

  childProcess.on('exit', (code) => {
    process.exit(code || 0)
  })
}

// Run the script
runScript()
