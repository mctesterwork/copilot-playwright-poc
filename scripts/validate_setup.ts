import * as fs from 'fs';
 
/**
 * Validates that the project setup is complete
 * Run with: npm run validate
 */
 
interface RequiredEnvVars {
    [key: string]: string[];
}
 
const requiredFiles: string[] = [
    '.env.dev',
    '.env.qa',
    'src/api-controller.ts',
    'src/gen'
];
 
const requiredEnvVars: RequiredEnvVars = {
    '.env.dev': ['API_BASE_URL'],
    '.env.qa': ['API_BASE_URL']
};
 
function validateSetup(): boolean {
    console.log('🔍 Validating project setup...\n');
   
    let isValid = true;
 
    // Check if codegen has been run
    console.log('📁 Checking required files...');
    requiredFiles.forEach(file => {
        const exists = fs.existsSync(file);
        console.log(`  ${exists ? '✅' : '❌'} ${file}`);
        if (!exists) isValid = false;
    });
 
    // Check if package.json still has placeholder
    console.log('\n📦 Checking package.json configuration...');
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const hasPlaceholder = packageJson.scripts.codegen.includes('[YOUR_API_DEFINITION_URL]');
    console.log(`  ${hasPlaceholder ? '❌' : '✅'} API URL configured in codegen script`);
    if (hasPlaceholder) isValid = false;
 
    // Check environment files
    console.log('\n🔧 Checking environment configuration...');
    Object.entries(requiredEnvVars).forEach(([file, vars]) => {
        if (fs.existsSync(file)) {
            const content = fs.readFileSync(file, 'utf8');
            vars.forEach(varName => {
                const hasVar = content.includes(`${varName}=`) && !content.includes(`${varName}=https://your-api.com`);
                console.log(`  ${hasVar ? '✅' : '❌'} ${file}: ${varName}`);
                if (!hasVar) isValid = false;
            });
        }
    });
 
    // Check if types have been generated (look for any .ts file under src/gen)
    console.log('\n🏗️  Checking generated types...');
    let typesExist = false;
    if (fs.existsSync('src/gen') && fs.statSync('src/gen').isDirectory()) {
        const files = fs.readdirSync('src/gen').filter(f => f.endsWith('.ts'));
        typesExist = files.length > 0;
    }
    console.log(`  ${typesExist ? '✅' : '❌'} TypeScript types generated in src/gen`);
    if (!typesExist) isValid = false;
 
    // Final status
    console.log('\n' + '='.repeat(50));
    if (isValid) {
        console.log('🎉 Setup validation passed! Ready to write tests.');
    } else {
        console.log('⚠️  Setup incomplete. Please complete the missing steps above.');
        console.log('\nNext steps:');
        console.log('1. Replace [YOUR_API_DEFINITION_URL] in package.json');
        console.log('2. Run: npm run codegen');
        console.log('3. Copy and configure .env files');
        console.log('4. Create src/api_controller.ts');
    }
   
    return isValid;
}
 
// Check if this script is being run directly (CommonJS compatibility)
if (require.main === module) {
    validateSetup();
}
 
export { validateSetup };