import chalk from 'chalk';
import ora from 'ora';
import { glob } from 'glob';
import fs from 'fs-extra';
import path from 'path';
import axios from 'axios';
import { loadConfig } from '../utils/config';
import { formatResults } from '../utils/formatter';

interface AnalyzeOptions {
  layers?: string;
  output?: string;
  recursive?: boolean;
  include?: string;
  exclude?: string;
  config?: string;
}

export async function analyzeCommand(files: string[], options: AnalyzeOptions) {
  const spinner = ora('Initializing NeuroLint analysis...').start();
  
  try {
    // Load configuration
    const config = await loadConfig(options.config);
    
    // Resolve file patterns
    const filePatterns = files.length > 0 ? files : ['**/*.{ts,tsx,js,jsx}'];
    const includePatterns = options.include?.split(',') || [];
    const excludePatterns = options.exclude?.split(',') || ['node_modules/**', 'dist/**', 'build/**'];
    
    spinner.text = 'Discovering files...';
    
    // Find all matching files
    const allFiles = [];
    for (const pattern of [...filePatterns, ...includePatterns]) {
      const matches = await glob(pattern, {
        ignore: excludePatterns,
        absolute: true
      });
      allFiles.push(...matches);
    }
    
    const uniqueFiles = [...new Set(allFiles)];
    
    if (uniqueFiles.length === 0) {
      spinner.fail('No files found matching the specified patterns');
      return;
    }
    
    spinner.succeed(`Found ${uniqueFiles.length} files to analyze`);
    
    // Parse layers
    const layers = options.layers?.split(',').map(l => parseInt(l.trim())) || [1, 2, 3, 4];
    
    console.log(chalk.blue(`\n🔍 Analyzing with layers: ${layers.join(', ')}\n`));
    
    const results = [];
    
    // Process files in batches for better performance
    const BATCH_SIZE = 10;
    for (let i = 0; i < uniqueFiles.length; i += BATCH_SIZE) {
      const batch = uniqueFiles.slice(i, i + BATCH_SIZE);
      const batchSpinner = ora(`Analyzing files ${i + 1}-${Math.min(i + BATCH_SIZE, uniqueFiles.length)} of ${uniqueFiles.length}...`).start();
      
      const batchResults = await Promise.all(
        batch.map(async (filePath) => {
          try {
            const content = await fs.readFile(filePath, 'utf-8');
            const relativePath = path.relative(process.cwd(), filePath);
            
            // Call NeuroLint API
            const response = await axios.post(`${config.apiUrl || 'http://localhost:5000'}/api/analyze`, {
              code: content,
              filePath: relativePath,
              layers
            }, {
              headers: {
                'Authorization': `Bearer ${config.apiKey}`,
                'Content-Type': 'application/json'
              },
              timeout: 30000
            });
            
            return {
              file: relativePath,
              success: true,
              ...response.data
            };
          } catch (error) {
            return {
              file: path.relative(process.cwd(), filePath),
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error'
            };
          }
        })
      );
      
      results.push(...batchResults);
      batchSpinner.succeed(`Completed batch ${Math.ceil((i + 1) / BATCH_SIZE)}`);
    }
    
    // Format and display results
    console.log(chalk.green('\n✅ Analysis Complete!\n'));
    
    formatResults(results, options.output || 'table');
    
    // Summary statistics
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log(chalk.blue('\n📊 Summary:'));
    console.log(`${chalk.green('✓')} Successfully analyzed: ${successful.length}`);
    if (failed.length > 0) {
      console.log(`${chalk.red('✗')} Failed: ${failed.length}`);
    }
    
    // Show layer-specific stats
    if (successful.length > 0) {
      const layerStats = {};
      successful.forEach(result => {
        if (result.layers) {
          result.layers.forEach(layer => {
            if (!layerStats[layer.id]) {
              layerStats[layer.id] = { passed: 0, total: 0 };
            }
            layerStats[layer.id].total++;
            if (layer.status === 'success') {
              layerStats[layer.id].passed++;
            }
          });
        }
      });
      
      console.log(chalk.blue('\n🎯 Layer Performance:'));
      Object.entries(layerStats).forEach(([layerId, stats]: [string, any]) => {
        const percentage = Math.round((stats.passed / stats.total) * 100);
        const color = percentage >= 90 ? 'green' : percentage >= 70 ? 'yellow' : 'red';
        console.log(`Layer ${layerId}: ${chalk[color](`${stats.passed}/${stats.total} (${percentage}%)`)} `);
      });
    }
    
  } catch (error) {
    spinner.fail(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    
    if (error instanceof Error && error.message.includes('ECONNREFUSED')) {
      console.log(chalk.yellow('\n💡 Tip: Make sure the NeuroLint server is running:'));
      console.log(chalk.gray('   npm run dev (in the main project directory)'));
    }
  }
}