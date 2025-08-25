const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// You'll need to add your Supabase URL and anon key here
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function uploadImage() {
  const imagePath = path.join(__dirname, 'public/images/performance-metrics.png');
  const imageFile = fs.readFileSync(imagePath);
  
  const { data, error } = await supabase.storage
    .from('editor-images')
    .upload('performance-metrics-bundle-optimization.png', imageFile, {
      contentType: 'image/png',
      upsert: true
    });

  if (error) {
    console.error('Error uploading image:', error);
    return;
  }

  const { data: urlData } = supabase.storage
    .from('editor-images')
    .getPublicUrl('performance-metrics-bundle-optimization.png');

  console.log('Image uploaded successfully!');
  console.log('Public URL:', urlData.publicUrl);
}

uploadImage();