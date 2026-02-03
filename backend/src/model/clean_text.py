import os
import json
from typing import Dict, Any
import anthropic
from dotenv import load_dotenv

load_dotenv()

# Initialize Claude client
claude = anthropic.Anthropic(
    api_key=os.getenv('ANTHROPIC_API_KEY')
)

class TextCleaner:
    """Handles cleaning and structuring of OCR text using Claude"""
    
    @staticmethod
    def clean_medical_text(texts: list[str]) -> Dict[str, Any]:
        """
        Process multiple OCR text using Claude to extract structured medical information
        
        Args:
            text (list[str]): Raw OCR text from the PDF
            
        Returns:
            Dict[str, Any]: Structured JSON with medical information
        """
        # Prompt engineering for Claude
        prompt = f"""
        Please analyze this medical document text and extract key information into a structured format.
        Format the response as a JSON object with the following schema:
        {{
            "document_type": "Type of medical document (e.g., prescription, lab report, clinical notes)",
            "patient_info": {{
                "name": "Patient's full name if present",
                "dob": "Date of birth if present i need it to be in xxxx-xx-xx form",
                "id": "Any patient ID numbers"
            }},
            "provider_info": {{
                "name": "Healthcare provider's name",
                "facility": "Healthcare facility name",
                "contact": "Contact information"
            }},
            "clinical_info": {{
                "diagnosis": ["List of diagnoses"],
                "medications": [
                    {{
                        "name": "Medication name",
                        "dosage": "Dosage information",
                        "instructions": "Usage instructions"
                    }}
                ],
                "vital_signs": {{
                    "blood_pressure": "BP reading if present",
                    "heart_rate": "HR if present",
                    "temperature": "Temp if present"
                }}
            }},
            "date_of_service": "Date of service/visit",
            "additional_notes": "Any other relevant information"
        }}

        Here's the text to analyze:
        {texts}

        Return only the JSON object, no additional text. If any field is not found in the document, use null instead of empty strings.
        """

        try:
            # Get Claude's response
            response = claude.messages.create(
                model="claude-sonnet-4-5",
                max_tokens=4000,
                temperature=0.2,  # Lower temperature for more consistent JSON output
                system="You are a concise technical EMR assistant analyzing patient referral documents.",
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            )
            
            # Extract and parse the JSON response
            response_text = response.content[0].text
            
            # Try to extract JSON if it's wrapped in markdown code blocks
            if "```json" in response_text:
                # Extract content between ```json and ```
                start = response_text.find("```json") + 7
                end = response_text.find("```", start)
                response_text = response_text[start:end].strip()
            elif "```" in response_text:
                # Extract content between ``` and ```
                start = response_text.find("```") + 3
                end = response_text.find("```", start)
                response_text = response_text[start:end].strip()
            
            # Remove any leading/trailing whitespace
            response_text = response_text.strip()
            
            cleaned_data = json.loads(response_text)
            return cleaned_data
            
        except json.JSONDecodeError as e:
            raise Exception(f"Error parsing JSON from Claude response: {str(e)}. Response was: {response.content[0].text[:500]}")
        except Exception as e:
            raise Exception(f"Error processing text with Claude: {str(e)}")
