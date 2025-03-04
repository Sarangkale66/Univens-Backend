const { File, validateFile } = require('../model/file.model');
const { User, validateUser } = require('../model/user.model');
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_API_KEY);

module.exports.CreateFile = async (req, res, next) => {
  try {
    const { lookingFor, description, userId, status } = req.body;

    const { error: validationError } = validateFile({ lookingFor, description, userId, status });
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
      userId,
      status: status || 'new',
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
};

module.exports.UpdateFile = async (req, res, next) => {
  try {
    const { lookingFor, description, oldFileUrl, status } = req.body;
    const { id } = req.params;

    const { error: validationError } = validateFile({ lookingFor, description, status });
    if (validationError) {
      return res.status(400).json({ message: validationError.details[0].message });
    }

    let fileDoc;
    const user = await User.findById(id);
    if (user) {
      fileDoc = await File.findOne({ userId: id });
    } else {
      fileDoc = await File.findById(id);
    }

    if (!fileDoc) {
      return res.status(404).json({ message: 'File document not found' });
    }

    fileDoc.lookingFor = lookingFor;
    fileDoc.description = description;
    fileDoc.status = status;

    if (oldFileUrl || (req.files && req.files.length > 0)) {
      if (oldFileUrl) {
        const oldFilePath = oldFileUrl.split('product-images/')[1];
        if (oldFilePath) {
          const { error: deleteError } = await supabase.storage
            .from('product-images')
            .remove([oldFilePath]);

          if (deleteError) {
            return res.status(500).json({
              message: 'Failed to delete old file from storage',
              error: deleteError.message
            });
          }
        }

        fileDoc.file = fileDoc.file.filter(url => url !== oldFileUrl);
      }

      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
          const uploadPath = `images/${timestamp}_${file.originalname}`;

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(uploadPath, file.buffer);

          if (uploadError) {
            return res.status(500).json({
              message: 'Failed to upload new file',
              error: uploadError.message
            });
          }

          const { data: publicUrlData } = supabase.storage
            .from('product-images')
            .getPublicUrl(uploadPath);

          if (publicUrlData) {
            fileDoc.file.push(publicUrlData.publicUrl);
          }
        }
      }
    }

    await fileDoc.save();

    res.status(200).json({
      message: 'File updated successfully',
      data: fileDoc
    });

  } catch (err) {
    res.status(500).json({
      message: 'An error occurred while processing the request',
      error: err.message
    });
    next(err);
  }
};

module.exports.DeleteSupaFile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { fileUrl } = req.body;

    let fileDoc;
    const user = await User.findById(id);
    if (user) {
      fileDoc = await File.findOne({ userId: id });
    } else {
      fileDoc = await File.findById(id);
    }

    if (!fileDoc) {
      return res.status(404).json({ message: 'File document not found' });
    }

    fileDoc.file = fileDoc.file.filter(url => url !== fileUrl);
    await fileDoc.save();

    const filePath = fileUrl.split('product-images/')[1];
    
    if (!filePath) {
      return res.status(400).json({
        message: 'Invalid file URL format',
      });
    }

    const { error: deleteError } = await supabase.storage
      .from('product-images')
      .remove([filePath]);

    if (deleteError) {
      return res.status(500).json({
        message: 'Failed to delete file from storage',
        error: deleteError.message
      });
    }

    res.status(200).json({
      message: 'File deleted successfully'
    });

  } catch (err) {
    res.status(500).json({
      message: 'An error occurred while processing the request', 
      error: err.message
    });
    next(err);
  }
};
