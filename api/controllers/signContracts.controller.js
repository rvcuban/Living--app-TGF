// Add a new controller method for signing contracts
export const signContract = async (req, res, next) => {
    try {
      const { applicationId } = req.params;
      const { signatureData, signatureType, signedBy } = req.body;
  
      if (!signatureData) {
        return next(errorHandle(400, 'Se requiere una firma para firmar el contrato.'));
      }
  
      // Find the application
      const application = await Application.findById(applicationId)
        .populate('listingId')
        .populate('userId');
      
      if (!application) {
        return next(errorHandle(404, 'Aplicación no encontrada.'));
      }
  
      // Check for required contract URL
      if (!application.contract?.url) {
        return next(errorHandle(400, 'No hay contrato disponible para firmar.'));
      }
  
      // Verify that the user is allowed to sign (either the property owner or tenant)
      if (
        application.listingId.userRef !== req.user.id && 
        application.userId._id.toString() !== req.user.id
      ) {
        return next(errorHandle(401, 'No autorizado para firmar este contrato.'));
      }
  
      // Extract image data from the Base64 string (remove header like "data:image/png;base64,")
      const base64Data = signatureData.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
  
      // Create a signed version of the contract
      const signedFileName = `signed_${applicationId}_${req.user.id}_${Date.now()}.pdf`;
      const signedFilePath = `contracts/signed/${signedFileName}`;
  
      // Get the original contract
      const originalContract = await bucket.file(application.contract.fileName);
      const [originalContractBuffer] = await originalContract.download();
  
      // Use PDF-lib to add the signature to the PDF
      const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
      const pdfDoc = await PDFDocument.load(originalContractBuffer);
      
      // Create a new page or use the last page for signatures
      const pages = pdfDoc.getPages();
      const lastPage = pages[pages.length - 1];
  
      // Embed the signature image
      const signatureImage = await pdfDoc.embedPng(buffer);
      
      // Get page dimensions
      const { width, height } = lastPage.getSize();
      
      // Add the signature image to the PDF
      // Position it appropriately on the last page (adjust coordinates as needed)
      const signatureWidth = 200;
      const signatureHeight = 100;
      
      if (signedBy === 'owner') {
        // Position for owner signature (left side)
        lastPage.drawImage(signatureImage, {
          x: 50,
          y: 150, // From bottom
          width: signatureWidth,
          height: signatureHeight,
        });
      } else {
        // Position for tenant signature (right side)
        lastPage.drawImage(signatureImage, {
          x: width - signatureWidth - 50,
          y: 150, // From bottom
          width: signatureWidth,
          height: signatureHeight,
        });
      }
      
      // Add timestamp
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const timestamp = new Date().toLocaleString('es-ES');
      
      lastPage.drawText(`Firmado por ${signedBy === 'owner' ? 'propietario' : 'inquilino'}: ${timestamp}`, {
        x: signedBy === 'owner' ? 50 : (width - 300),
        y: 130,
        size: 10,
        font,
        color: rgb(0, 0, 0),
      });
  
      // Save the modified PDF
      const signedPdfBytes = await pdfDoc.save();
      
      // Upload the signed contract to Firebase
      const signedFile = bucket.file(signedFilePath);
      await signedFile.save(signedPdfBytes, {
        metadata: { contentType: 'application/pdf' },
      });
  
      // Get a signed URL for the new PDF
      const [signedUrl] = await signedFile.getSignedUrl({
        action: 'read',
        expires: '03-01-2030',
      });
  
      // Create or update the signature information in the application
      const signatureInfo = {
        date: new Date(),
        signedBy: signedBy,
        signatureType: signatureType,
        fileName: signedFilePath
      };
  
      // Update the application with signature info
      if (!application.signatures) {
        application.signatures = [];
      }
      
      application.signatures.push(signatureInfo);
      
      // Update status based on signature
      if (signedBy === 'owner') {
        application.ownerSignature = {
          signatureType,
          date: new Date(),
          verified: true
        };
        
        // If both parties have signed, update status to Firmado
        if (application.tenantSignature) {
          application.status = 'Firmado';
          application.history.push({ status: 'Firmado', timestamp: new Date() });
        } else {
          application.status = 'Firmado por Propietario';
          application.history.push({ status: 'Firmado por Propietario', timestamp: new Date() });
        }
      } else {
        application.tenantSignature = {
          signatureType,
          date: new Date(),
          verified: true
        };
        
        // If both parties have signed, update status to Firmado
        if (application.ownerSignature) {
          application.status = 'Firmado';
          application.history.push({ status: 'Firmado', timestamp: new Date() });
        } else {
          application.status = 'Firmado por Inquilino';
          application.history.push({ status: 'Firmado por Inquilino', timestamp: new Date() });
        }
      }
      
      // Store the signed contract URL
      application.contract.signedUrl = signedUrl;
      await application.save(); 
  
      res.status(200).json({
        success: true,
        message: 'Contrato firmado correctamente.',    
        application,
        signedContractUrl: signedUrl
      });
    } catch (error) {
      console.error('Error al firmar el contrato:', error);
      next(errorHandle(500, 'Error al firmar el contrato: ' + error.message));
    }
  };