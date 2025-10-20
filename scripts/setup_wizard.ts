import * as readline from 'readline';
import * as fs from 'fs';
import { execSync } from 'child_process';
 
interface PackageJson {
    scripts: {
        [key: string]: string;
    };
    [key: string]: any;
}
 
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
 
function question(prompt: string): Promise<string> {
    return new Promise(resolve => rl.question(prompt, resolve));
}
 
async function setupWizard(): Promise<void> {
    console.log('🚀 Welcome to Playwright API Testing Template Setup Wizard!\n');
   
    try {
        // Step 1: Check if fresh clone
        console.log('Step 1: Checking project state...');
        const packageJson: PackageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        const needsApiUrl = packageJson.scripts.codegen.includes('[YOUR_API_DEFINITION_URL]');
       
        if (!needsApiUrl) {
            console.log('✅ Project appears to already be configured.');
            const reconfigure = await question('Do you want to reconfigure? (y/N): ');
            if (reconfigure.toLowerCase() !== 'y') {
                console.log('Setup cancelled. Run "npm run validate" to check configuration.');
                process.exit(0);
            }
        }
 
        // Step 2: Get API URL
        console.log('\nStep 2: API Configuration');
        const apiUrl = await question('Please provide your API definition URL (Swagger/OpenAPI): ');
       
        if (!apiUrl.trim()) {
            throw new Error('API URL is required');
        }
       
        // Update package.json
        packageJson.scripts.codegen = packageJson.scripts.codegen.replace('[YOUR_API_DEFINITION_URL]', apiUrl);
        fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
        console.log('✅ Updated package.json with API URL');
 
        // Step 3: Authentication setup
        console.log('\nStep 3: Authentication Setup');
        console.log('Available options:');
        console.log('1. API Key (X-API-Key header)');
        console.log('2. Bearer Token (Authorization: Bearer)');
        console.log('3. Custom headers');
        console.log('4. No authentication');
       
        const authChoice = await question('Select authentication type (1-4): ');
        let authConfig = '';
        let customEnvVar = '';
       
        switch (authChoice) {
            case '1':
                authConfig = `
      // API Key authentication
      ...(process.env.API_KEY && { 'X-API-Key': process.env.API_KEY }),`;
                customEnvVar = 'API_KEY';
                break;
            case '2':
                authConfig = `
      // Bearer token authentication  
      ...(process.env.AUTH_TOKEN && { 'Authorization': \`Bearer \${process.env.AUTH_TOKEN}\` }),`;
                customEnvVar = 'AUTH_TOKEN';
                break;
            case '3':
                const customHeader = await question('Enter custom header name: ');
                customEnvVar = await question('Enter environment variable name: ');
                authConfig = `
      // Custom authentication
      ...(process.env.${customEnvVar} && { '${customHeader}': process.env.${customEnvVar} }),`;
                break;
            case '4':
            default:
                authConfig = `
      // No authentication required`;
                break;
        }
 
        // Update setup.ts
        const setupTemplate = `import { request } from '@playwright/test';
 
async function globalSetup() {
  // Global setup for API testing
 
  // Set up base URL from environment variables
  const apiBaseUrl = process.env.API_BASE_URL;
  if (!apiBaseUrl) {
    throw new Error('API_BASE_URL environment variable is required');
  }
 
  // Create a request context for authentication if needed
  const requestContext = await request.newContext({
    baseURL: apiBaseUrl,
    extraHTTPHeaders: {
      // Add default headers here
      'Content-Type': 'application/json',${authConfig}
    },
  });
 
  // Verify API is accessible
  try {
    const response = await requestContext.get('/health');
    console.log(\`API Health Check: \${response.status()}\`);
  } catch (error) {
    console.warn('API health check failed, but continuing with setup...');
  }
 
  await requestContext.dispose();
}
 
export default globalSetup;
`;
 
        fs.writeFileSync('src/tests/setup.ts', setupTemplate);
        console.log('✅ Updated authentication setup');
 
        // Step 4: Environment files
        console.log('\nStep 4: Environment Configuration');
        const devUrl = await question('Enter development API base URL: ');
        const qaUrl = await question('Enter QA API base URL (or press Enter to use dev URL): ') || devUrl;
 
        const envVarExample = customEnvVar ? `${customEnvVar}=your-${customEnvVar.toLowerCase().replace('_', '-')}` : '';
 
        const devEnv = `API_BASE_URL=${devUrl}
# Add your API authentication variables here
${envVarExample ? `# ${envVarExample}` : '# No authentication required'}
`;
 
        const qaEnv = `API_BASE_URL=${qaUrl}
# Add your QA API authentication variables here  
${envVarExample ? `# ${envVarExample.replace('your-', 'your-qa-')}` : '# No authentication required'}
`;
 
        fs.writeFileSync('.env.dev', devEnv);
        fs.writeFileSync('.env.qa', qaEnv);
        console.log('✅ Created environment files');
 
        // Step 5: Generate types
        console.log('\nStep 5: Generating TypeScript types from API...');
        try {
            console.log('Running: npm run codegen');
            execSync('npm run codegen', { stdio: 'inherit' });
            console.log('✅ Successfully generated TypeScript types');
        } catch (error) {
            console.error('❌ Failed to generate types. Please check your API URL and run manually: npm run codegen');
            if (error instanceof Error) {
                console.error('Error:', error.message);
            }
        }
 
        // Step 6: TestMo setup (optional)
        console.log('\nStep 6: TestMo Integration (Optional)');
        const useTestmo = await question('Do you want to configure TestMo reporting? (y/N): ');

        if (useTestmo.toLowerCase() === 'y') {
            const testmoToken = await question('Enter your TestMo token: ');
            const projectId = await question('Enter your TestMo project ID: ');

            if (!testmoToken || !projectId) {
                console.warn('TestMo token and project id are required to configure automated submission. Skipping TestMo setup.');
            } else {
                // Persist token/project id as commented examples in env files (do not store secrets in git)
                const addToEnv = (envPath: string) => {
                    try {
                        let content = '';
                        if (fs.existsSync(envPath)) content = fs.readFileSync(envPath, 'utf8');
                        // append commented lines to avoid committing secrets accidentally, user can uncomment
                        if (!content.includes('TESTMO_PROJECT_ID') && !content.includes('TESTMO_TOKEN')) {
                            content += `\n# Testmo submission (uncomment and set in CI or locally)\n# TESTMO_TOKEN=${testmoToken}\n# TESTMO_PROJECT_ID=${projectId}\n`;
                            fs.writeFileSync(envPath, content);
                        }
                    } catch (err) {
                        console.warn(`Could not update ${envPath}: ${err instanceof Error ? err.message : String(err)}`);
                    }
                };

                addToEnv('.env.dev');
                addToEnv('.env.qa');

                // Update package.json to add a convenient script to run the TypeScript submitter
                try {
                    const packageJsonPath = 'package.json';
                    const pj = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
                    pj.scripts = pj.scripts || {};
                    pj.scripts['testmo:submit'] = 'npx tsx scripts/testmo-submit.ts';
                    fs.writeFileSync(packageJsonPath, JSON.stringify(pj, null, 2));
                    console.log('✅ Added npm script: npm run testmo:submit');
                } catch (err) {
                    console.warn('Could not update package.json with testmo script:', err instanceof Error ? err.message : String(err));
                }

                console.log('✅ TestMo reporting configured (secrets added as commented examples in .env files).');
            }
        }
 
        console.log('\n🎉 Setup wizard completed successfully!');
        console.log('\nNext steps:');
        console.log('1. Review and update your .env files with actual credentials');
        console.log('2. Create src/api_controller.ts with your endpoint functions');
        console.log('3. Write your first test in src/tests/');
        console.log('4. Run tests with: npm run test:dev');
        console.log('\nRun validation: npm run validate');
 
    } catch (error) {
        console.error('❌ Setup failed:', error instanceof Error ? error.message : String(error));
        process.exit(1);
    } finally {
        rl.close();
    }
}
 
// Check if this script is being run directly (CommonJS compatibility)
if (require.main === module) {
    setupWizard();
}
 
export { setupWizard };