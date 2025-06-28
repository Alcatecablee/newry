#!/bin/bash

# Script to clean up CLI for enterprise theme
# This removes all emojis and excessive colors

find cli/src -name "*.ts" -type f | while read file; do
  # Remove common emojis
  sed -i 's/🧠//g' "$file"
  sed -i 's/🔐//g' "$file"
  sed -i 's/✅//g' "$file"
  sed -i 's/❌//g' "$file"
  sed -i 's/💡//g' "$file"
  sed -i 's/🚀//g' "$file"
  sed -i 's/🔄//g' "$file"
  sed -i 's/📊//g' "$file"
  sed -i 's/🎯//g' "$file"
  sed -i 's/⚠//g' "$file"
  sed -i 's/🔍//g' "$file"
  sed -i 's/🔧//g' "$file"
  sed -i 's/📋//g' "$file"
  sed -i 's/🛠️//g' "$file"
  sed -i 's/🧪//g' "$file"
  sed -i 's/🔓//g' "$file"
  sed -i 's/⏱//g' "$file"
  sed -i 's/🚦//g' "$file"
  sed -i 's/📁//g' "$file"
  sed -i 's/📖//g' "$file"
  sed -i 's/🔗//g' "$file"
  sed -i 's/👤//g' "$file"
  sed -i 's/👋//g' "$file"
  
  # Replace colorful chalk with neutral colors
  sed -i 's/chalk\.blue\.bold/chalk.white.bold/g' "$file"
  sed -i 's/chalk\.blue(/chalk.white(/g' "$file"
  sed -i 's/chalk\.green(/chalk.white(/g' "$file"
  sed -i 's/chalk\.red(/chalk.white(/g' "$file"
  sed -i 's/chalk\.yellow(/chalk.white(/g' "$file"
  sed -i 's/chalk\.cyan(/chalk.white(/g' "$file"
  
  echo "Cleaned: $file"
done

echo "Enterprise cleanup complete!"
