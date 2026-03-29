#!/bin/sh

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

echo "Copying test files and tsconfig..."
cp ../types/test.ts ./
cp ../types/tsconfig.json ./
cp ../tsconfig.json ./tsconfig.base.json
cp ../scripts/runtime-test.template.ts ./runtime-test.ts

echo "Updating tsconfig paths..."
node -e "const fs=require('fs'),c=JSON.parse(fs.readFileSync('tsconfig.json','utf8'));c.extends='./tsconfig.base.json';delete c.compilerOptions.paths;fs.writeFileSync('tsconfig.json',JSON.stringify(c,null,2));"

echo "Testing TypeScript compilation..."
npx tsc --project tsconfig.json

if [ $? -eq 0 ]; then
    echo "✅ TypeScript compilation passed!"
else
    echo "❌ TypeScript compilation failed!"
    cd ..
    rm -rf test-types-local
    rm hed-validator-*.tgz
    exit 1
fi

echo "Running runtime test..."
npx tsx runtime-test.ts

if [ $? -eq 0 ]; then
    echo "✅ Runtime test passed!"
else
    echo "❌ Runtime test failed!"
    cd ..
    rm -rf test-types-local
    rm hed-validator-*.tgz
    exit 1
fi

echo "Cleaning up..."
cd ..
rm -rf test-types-local
rm hed-validator-*.tgz

echo "✅ All TypeScript definition tests passed!"
