from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import List
import os
import logging
import asyncio
from ocr.analyze_pdf import analyze_pdf
from model.clean_text import TextCleaner
from agents.agent import EMRFormFiller 

router = APIRouter(
    prefix="/analyze",
    tags=["analyze"]
)

logger = logging.getLogger(__name__)

@router.get("/all")
async def analyze_pdfs_endpoint():
    """
    Endpoint to analyze multiple PDF files, combine their text, and clean it using Claude
    """
    try:
        # Construct the path to uploads directory (it's in the backend folder, parallel to src)
        current_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))  # go up from routers/src to backend
        upload_dir = os.path.join(current_dir, "uploads")
        all_ocr_text = []
        
        # Get all PDF files
        pdf_files = [f for f in os.listdir(upload_dir)]
        
        if not pdf_files:
            raise HTTPException(
                status_code=404,
                detail="No PDF files found in uploads directory"
            )
            
        # Process each PDF file
        for filename in pdf_files:
            try:
                ocr_result = analyze_pdf(filename)
                # Extract raw_text from OCR result
                all_ocr_text.append(ocr_result)
                logger.info(f"Successfully processed {filename}")
            except Exception as e:
                logger.error(f"Error processing {filename}: {str(e)}")

                continue
                
        if not all_ocr_text:
            raise HTTPException(
                status_code=500,
                detail="Failed to process any PDF files"
            )
            
        # Combine all OCR text with newlines between documents
        
        # Clean the combined text using Claude
        cleaner = TextCleaner()
        cleaned_data = cleaner.clean_medical_text(all_ocr_text)
        
        # Log the cleaned data
        logger.info("Cleaned Data Structure:")
        logger.info(cleaned_data)

        # Run the browser agent in the background (don't wait for it)
        # This way the user gets the data immediately
        asyncio.create_task(fill_emr_form_background(cleaned_data))
        
        # Return immediately without waiting for form filling
        return {
            "num_files_processed": len(all_ocr_text),
            "cleaned_data": cleaned_data,
            "form_filling_status": "running_in_background"
        }
    except Exception as e:
        logger.error(f"Error in analysis pipeline: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing documents: {str(e)}"
        )

async def fill_emr_form_background(cleaned_data: dict):
    """
    Run the EMR form filling in the background without blocking the API response
    """
    try:
        logger.info("Starting background EMR form filling...")
        agent = EMRFormFiller()
        await agent.fill_form({"cleaned_data": cleaned_data})
        logger.info("Background EMR form filling completed successfully!")
    except Exception as e:
        logger.error(f"Error in background form filling: {str(e)}")
        # Don't raise - this is a background task
