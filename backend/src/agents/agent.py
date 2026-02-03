from browser_use.llm import ChatAnthropic
from browser_use import Agent
import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

# Initialize the model
class EMRFormFiller:
    def __init__(self):
        self.url = "https://v0-mock-emr-page.vercel.app/"

    async def fill_form(self, patient_data):
        """
        Fill the EMR form with the provided patient data

        Args:
            patient_data (Dict[str, Any]): JSON data containing patient information
        """
        # Initialize the model with API key explicitly
        llm = ChatAnthropic(
            model="claude-sonnet-4-5",
            api_key=os.getenv('ANTHROPIC_API_KEY'),
            temperature=0.0,
            timeout=100,
        )

        initial_actions = [
            {'navigate': {'url': self.url, 'new_tab': True}},
        ]

        data = patient_data["cleaned_data"]

        # Build medication instructions
        medication_instructions = ""
        for i, med in enumerate(data['clinical_info']['medications'], 1):
            medication_instructions += f"""
        {i}. Click the "Add Medication" button
        - Enter medication name: {med['name']}
        - Enter dosage: {med['dosage']}
        - Enter instructions: {med['instructions']}
            """

        task = f"""
You are filling out an Electronic Medical Record (EMR) form with patient data. Follow these steps carefully:

IMPORTANT: For ANY field where data is not provided or is empty, you MUST enter "N/A" - never leave fields blank.

STEP 1: LOGIN TO THE SYSTEM
- Click the "Login" button on the homepage
- Enter username: admin
- Enter password: password
- Click the login/submit button to proceed

STEP 2: After successful login, click the "Create New Patient Intake" button to start a new patient intake form.

STEP 3: Fill in the Patient Information section:
        - Document Type: Enter "{data['document_type']}"
        - Full Name: Enter "{data['patient_info']['name']}"
        - Date of Birth: Enter "{data['patient_info']['dob']}" (format: YYYY-MM-DD)
        - Patient ID: Enter "{data['patient_info']['id']}"

        STEP 4: Fill in the Provider Information section:
- Provider Name: Enter "{data['provider_info']['name'] if data['provider_info']['name'] else 'N/A'}"
- Facility: Enter "{data['provider_info']['facility'] if data['provider_info']['facility'] else 'N/A'}"
- Contact: Enter "{data['provider_info']['contact'] if data['provider_info']['contact'] else 'N/A'}"

STEP 5: Fill in the Clinical Information section:
- Diagnosis: Enter the following diagnoses (comma-separated or as separate entries): {', '.join(data['clinical_info']['diagnosis']) if data['clinical_info']['diagnosis'] else 'N/A'}

STEP 6: Add Medications (for EACH medication, click "Add Medication" button first):
{medication_instructions if data['clinical_info']['medications'] else "If there are no medications or the medication section is empty, enter N/A or skip this section."}

STEP 7: Fill in Vital Signs (if any field is empty, enter "N/A"):
- Blood Pressure: Enter "{data['clinical_info']['vital_signs']['blood_pressure'] if data['clinical_info']['vital_signs']['blood_pressure'] else 'N/A'}"
- Heart Rate: Enter "{data['clinical_info']['vital_signs']['heart_rate'] if data['clinical_info']['vital_signs']['heart_rate'] else 'N/A'}"
- Temperature: Enter "{data['clinical_info']['vital_signs']['temperature'] if data['clinical_info']['vital_signs']['temperature'] else 'N/A'}"

STEP 8: If there's a "Date of Service" field, enter: {data.get('date_of_service', 'N/A')}

STEP 9: If there's an "Additional Notes" or "Comments" field, enter: {data.get('additional_notes', 'N/A')}

STEP 10: After filling all fields, click the "Submit" or "Save" button to complete the form submission.

Take your time with each field and make sure all data is entered accurately.
        """

        # Create agent with the model
        agent = Agent(
            task=task,
            initial_actions=initial_actions,
            llm=llm,
            max_failures=10,  # Allow more retries if actions fail
            use_vision=True,  # Enable vision to better identify form fields
            step_timeout=300,  # 5 minutes per step (default is 180)
            use_thinking=True,  # Enable reasoning
            flash_mode=False,  # Disable flash mode for more thorough execution
        )

        print(f"Starting agent to fill EMR form...")
        result = await agent.run()
        print(f"Agent completed. Result: {result}")

        # Keep browser open longer to ensure form submission completes
        await asyncio.sleep(10)

        return result


async def main():
    # Mock patient data that matches the expected structure
    mock_data = {
        "cleaned_data": {
            "document_type": "Initial Assessment",
            "patient_info": {
                "name": "John Doe",
                "dob": "1990-01-01",
                "id": "P12345"
            },
            "provider_info": {
                "name": "Dr. Sarah Smith",
                "facility": "General Hospital",
                "contact": "555-0123"
            },
            "clinical_info": {
                "diagnosis": "Hypertension",
                "medications": [
                    {
                        "name": "Lisinopril",
                        "dosage": "10mg",
                        "instructions": "Take once daily"
                    },
                    {
                        "name": "Amlodipine",
                        "dosage": "5mg",
                        "instructions": "Take in the morning"
                    }
                ],
                "vital_signs": {
                    "blood_pressure": "120/80",
                    "heart_rate": "72",
                    "temperature": "98.6"
                }
            }
        }
    }

    # Create an instance of EMRFormFiller
    form_filler = EMRFormFiller()
    
    # Run the form filler with mock data
    try:
        await form_filler.fill_form(mock_data)
        print("Form filling completed successfully!")
    except Exception as e:
        print(f"An error occurred: {str(e)}")

if __name__ == "__main__":
    # Run the async main function
    asyncio.run(main())

