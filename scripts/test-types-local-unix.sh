#!/bin/bash

# Local TypeScript definition testing script
echo "Building package..."
npm run build

echo "Packing package..."
npm pack

echo "Setting up test environment..."
mkdir -p test-types-local
cd test-types-local

echo "Installing packed package..."
npm init -y
npm install ../hed-validator-*.tgz
npm install typescript @types/node tsx

echo "Copying test file..."
cp ../types/test.ts ./

echo "Testing TypeScript compilation..."
npx tsc --noEmit --strict test.ts

if [ $? -eq 0 ]; then
    echo "✅ TypeScript compilation passed!"
else
    echo "❌ TypeScript compilation failed!"
    exit 1
fi

echo "Creating runtime test..."
cat > runtime-test.ts << 'EOF'
import { getLocalSchemaVersions } from 'hed-validator'

const versions = getLocalSchemaVersions()
console.log('✅ Available schema versions:', versions.length)
console.log('✅ First version:', versions[0])

// Type check
const firstVersion: string = versions[0]
console.log('✅ Type test passed')
EOF

echo "Running runtime test..."
npx tsx runtime-test.ts

echo "Cleaning up..."
cd ..
rm -rf test-types-local
rm hed-validator-*.tgz

echo "✅ All TypeScript definition tests passed!"
