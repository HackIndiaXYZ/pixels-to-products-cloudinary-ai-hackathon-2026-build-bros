/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('C:\\Users\\Amruth\\Desktop\\SecureFlow AI\\secureflow-ai\\src\\app\\dashboard');
let updatedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('import { createClient } from "@/lib/supabase/server";')) {
    content = content.replace(
      'import { createClient } from "@/lib/supabase/server";',
      'import { createAdminClient as createClient } from "@/lib/supabase/server";'
    );
    fs.writeFileSync(file, content);
    updatedCount++;
    console.log('Updated', file);
  }
});
console.log('Total updated:', updatedCount);
