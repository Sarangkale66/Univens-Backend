const { File, validateFile } = require('../model/file.model');
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_API_KEY);

module.exports.CreateFile = async (req, res, next) => {
  try {
    const { lookingFor, description } = req.body;

    const { error: validationError } = validateFile({ lookingFor, description });
    if (validationError) {
      return res.status(400).json({ message: validationError.details[0].message });
    }

    const filePaths = [];
    for (const file of req.files) {
      const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
      const uploadPath = `images/${timestamp}_${file.originalname}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(uploadPath, file.buffer);

      if (uploadError) {
        return res.status(500).json({ message: 'Error uploading file to Supabase', error: uploadError.message });
      }

      const { data: publicUrlData } = supabase.storage.from('product-images').getPublicUrl(uploadPath);
      if (publicUrlData) {
        filePaths.push(publicUrlData.publicUrl);
      }
    }

    const createdFile = await File.create({
      lookingFor,
      description,
      file: filePaths,
    });

    res.status(201).json({
      message: 'File created successfully',
      data: createdFile,
    });
  } catch (err) {
    res.status(500).json({
      message: 'An error occurred while processing the request',
      error: err.message,
    });
    next(err);
  }
}
