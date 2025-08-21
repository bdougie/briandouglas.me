import fs from 'fs';
import path from 'path';

const postsDir = './src/pages/posts';

// Get all markdown files
const files = fs.readdirSync(postsDir).filter(file => file.endsWith('.md'));

files.forEach(file => {
  // Extract date from filename
  const match = file.match(/^(\d{4})-(\d{2})-(\d{2})-/);
  if (!match) {
    console.log(`Skipping ${file} - no date in filename`);
    return;
  }
  
  const [, year, month, day] = match;
  const date = `${year}-${month}-${day}`;
  
  // Read the file
  const filePath = path.join(postsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if file has frontmatter
  if (!content.startsWith('---')) {
    console.log(`Skipping ${file} - no frontmatter`);
    return;
  }
  
  // Extract frontmatter
  const frontmatterEnd = content.indexOf('---', 3);
  if (frontmatterEnd === -1) {
    console.log(`Skipping ${file} - invalid frontmatter`);
    return;
  }
  
  const frontmatter = content.substring(3, frontmatterEnd);
  const body = content.substring(frontmatterEnd + 3);
  
  // Replace the date line in frontmatter
  const updatedFrontmatter = frontmatter.replace(
    /^date:.*$/m,
    `date: ${date}`
  );
  
  // If no date field exists, add it
  let finalFrontmatter = updatedFrontmatter;
  if (!updatedFrontmatter.includes('date:')) {
    // Add date after title
    finalFrontmatter = updatedFrontmatter.replace(
      /^(title:.*$)/m,
      `$1\ndate: ${date}`
    );
  }
  
  // Reconstruct the file
  const newContent = `---${finalFrontmatter}---${body}`;
  
  // Write back
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log(`Fixed date for ${file}: ${date}`);
});

console.log('Done!');