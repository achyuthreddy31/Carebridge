import re

EMERGENCY_SIGNALS = [
    (r"\b(chest pain|chest pressure|heart attack|angina|crushing chest|cardiac)\b", "Chest Pain / Potential Cardiac Emergency", "Acute chest pain or pressure may signal cardiac ischemia. Immediate emergency medical intervention is vital."),
    (r"\b(difficulty breathing|can't breathe|shortness of breath|breathlessness|gasping|suffocat|stridor)\b", "Severe Respiratory Distress", "Acute breathlessness can indicate airway compromise, pulmonary embolism, or acute asthma. Immediate care is needed."),
    (r"\b(stroke|facial droop|slurred speech|paralysis|one-sided weakness|numbness on one side|aphasia)\b", "Acute Neurological Deficit (FAST Stroke Signs)", "Sudden facial droop, arm/leg weakness, or slurred speech require urgent emergency stroke evaluation (Time is brain)."),
    (r"\b(unconscious|fainted|passed out|blackout|syncope|loss of consciousness)\b", "Loss of Consciousness / Syncope", "Transient or prolonged loss of consciousness requires urgent clinical assessment to exclude dangerous dysrhythmias or neurological events."),
    (r"\b(severe bleeding|uncontrolled bleeding|coughing blood|vomiting blood|hematemesis|hemoptysis)\b", "Severe Uncontrolled Bleeding / Hemorrhage", "Active heavy bleeding or blood in vomit/sputum requires immediate hospital emergency department evaluation."),
    (r"\b(anaphylaxis|throat swelling|swelling of tongue|swelling of lips and breathing difficulty|lip swelling)\b", "Severe Anaphylactic / Airway Reaction", "Airway swelling with breathing difficulty represents a life-threatening anaphylactic emergency."),
    (r"\b(worst headache|thunderclap headache|sudden explosive headache)\b", "Thunderclap Headache", "Sudden-onset explosive cephalalgia reaching peak within seconds requires urgent emergency neurological imaging.")
]

def analyze_precautions(text):
    text_lower = text.lower()
    
    # Check emergency
    detected_emergency = None
    for pat, label, desc in EMERGENCY_SIGNALS:
        if re.search(pat, text_lower):
            detected_emergency = (label, desc)
            break
            
    is_emergency = detected_emergency is not None
    
    if is_emergency:
        urgency = "emergency"
        label, desc = detected_emergency
        clean_text = text.strip()
        understanding_summary = f"Reported critical symptom: {label}. You described: '{clean_text}'."
        missing_info = "Due to the potentially life-threatening nature of these symptoms, do not spend time collecting more information online. Seek immediate clinical assessment."
        precautions = [
            "Stop all physical activity immediately and sit or lie down in a safe, comfortable position.",
            "Call 112 (National Emergency Helpline in India) immediately or have someone take you to the nearest hospital emergency department.",
            "Keep your airway clear, loosen any restrictive clothing around your neck and chest.",
            "Do not attempt to drive yourself to the hospital; await an ambulance or designated transport.",
            "Keep any identification, current medication list, and emergency contacts accessible for responding clinicians."
        ]
        things_to_avoid = [
            "Do NOT delay calling 112 or seeking emergency hospital care to wait for an AI response or a routine clinic appointment.",
            "Do NOT exert yourself, walk long distances, or attempt strenuous physical actions.",
            "Do NOT eat or drink anything until evaluated by medical professionals, in case emergency procedures are required.",
            "Do NOT take unprescribed painkillers, aspirin (unless specifically instructed by an emergency clinician), or leftover prescription pills."
        ]
        warning_signs = [
            f"EMERGENCY WARNING: {label} — {desc}",
            "Worsening shortness of breath, cyanosis (bluish tint on lips or fingers), or acute confusion.",
            "Spread of pain or pressure to the jaw, neck, back, or left arm.",
            "Sudden collapse, lightheadedness, or inability to remain conscious."
        ]
        emergency_protocol = {
            "is_active": True,
            "helpline": "112",
            "alert_heading": "CRITICAL MEDICAL EMERGENCY PROTOCOL",
            "instructions": "Immediate in-person emergency medical care is required. Call 112 or go to the nearest emergency department right away."
        }
        next_step = "Emergency Care Now — Contact local emergency services (112 in India) or proceed immediately to the nearest hospital emergency department."
    else:
        is_headache = bool(re.search(r"\b(headache|migraine|head pain|throbbing head|cephalalgia)\b", text_lower))
        is_fever = bool(re.search(r"\b(fever|chills|high temperature|shivering|pyrexia|febrile)\b", text_lower))
        is_gi = bool(re.search(r"\b(stomach|abdominal|nausea|vomit|diarrhea|cramps|acidity|heartburn|loose stool|gastric)\b", text_lower))
        is_resp = bool(re.search(r"\b(cough|cold|sore throat|congestion|runny nose|sneezing|phlegm)\b", text_lower))
        is_joint = bool(re.search(r"\b(joint|knee|back pain|neck pain|muscle|strain|sprain|swelling in leg)\b", text_lower))
        
        clean_text = text.strip()
        understanding_summary = f"Patient reported symptoms: '{clean_text}'."
        missing_prompts = []
        if not re.search(r"\b(day|days|week|weeks|hour|hours|month|yesterday|today)\b", text_lower):
            missing_prompts.append("Exact onset and duration of symptoms")
        if not re.search(r"\b(mild|moderate|severe|intensity|\d\s*\/\s*10)\b", text_lower):
            missing_prompts.append("Severity rating (e.g. 1-10 intensity scale)")
        if not re.search(r"\b(medication|medicine|took|taking|none)\b", text_lower):
            missing_prompts.append("Any existing medications or previous remedies taken")
        
        missing_info = ("Missing relevant context: " + ", ".join(missing_prompts) + ".") if missing_prompts else "Key clinical symptom context has been recorded."
        
        precautions = []
        if is_headache:
            precautions.append("Rest in a quiet, dark, well-ventilated room with minimal sensory and screen stimulation.")
            precautions.append("Apply a cool or lukewarm compress across your forehead or the back of your neck.")
        if is_fever:
            precautions.append("Rest adequately to conserve energy and allow your immune response to function optimally.")
            precautions.append("Maintain normal hydration by drinking adequate clean water or oral fluids at regular intervals if tolerated.")
            precautions.append("Monitor your body temperature with a digital thermometer every 4 to 6 hours and log the readings.")
        if is_gi:
            precautions.append("Allow your digestive tract to rest; take small, frequent sips of water or oral rehydration solution (ORS) if tolerated.")
            precautions.append("When appetite returns, consume light, non-greasy foods such as bananas, rice, applesauce, or crackers.")
        if is_resp:
            precautions.append("Ensure adequate rest and keep well-hydrated with warm fluids (warm water, broths) to soothe the respiratory tract.")
            precautions.append("Consider gentle steam inhalation or using a room humidifier to relieve airway dryness.")
        if is_joint:
            precautions.append("Rest the affected joint/muscle and avoid repetitive movements or weight-bearing activities that trigger pain.")
            precautions.append("Support the affected area in a comfortable, elevated position if swelling is present.")
            
        precautions.append("Keep a symptom diary recording onset, frequency, severity changes, and any newly appearing symptoms.")
        precautions.append("Compile a complete list of your current prescription medications, over-the-counter supplements, and known allergies for your physician.")
        precautions.append("Avoid self-medicating, altering prescribed doses, or taking leftover antibiotics/prescription drugs without professional guidance.")
        
        things_to_avoid = [
            "Do NOT discontinue or alter prescribed chronic medications (such as blood pressure, cardiac, or thyroid drugs) without your prescribing doctor's approval.",
            "Do NOT consume heavy alcohol, unverified home remedies, or excessive caffeine, which may dehydrate or mask symptoms."
        ]
        if is_headache:
            things_to_avoid.append("Avoid prolonged exposure to bright digital screens, loud headphones, and skipping meals, which frequently exacerbate headache severity.")
        if is_gi:
            things_to_avoid.append("Avoid very spicy, oily, acidic foods, carbonated beverages, and unnecessary NSAID pain relievers that can irritate the stomach lining.")
        if is_fever or is_resp:
            things_to_avoid.append("Avoid strenuous exercise, crowded environments, and exposure to active or passive cigarette smoke.")
        if is_joint:
            things_to_avoid.append("Avoid heavy lifting, sudden twisting movements, or continuing activities through sharp joint pain.")
            
        warning_signs = [
            "Development of sudden severe chest discomfort, breathlessness, or pain radiating to the neck, back, or arms (Call 112 immediately).",
            "High persistent fever (> 103°F or 39.4°C) unresponsive to standard antipyretics or lasting more than 3 consecutive days.",
            "Sudden neurological symptoms: confusion, severe dizziness, one-sided numbness, facial weakness, or speech changes.",
            "Persistent vomiting that completely prevents keeping down fluids for more than 12-24 hours.",
            "Severe, progressive, or intractable pain that rapidly worsens over hours."
        ]
        
        if is_fever and is_resp:
            urgency = "urgent"
            next_step = "Urgent Clinical Evaluation Recommended — Visit a clinic or outpatient department within 12-24 hours for evaluation and testing."
        elif is_headache or is_joint or is_gi:
            urgency = "prompt"
            next_step = "Prompt Physician Appointment — Schedule an in-person consultation with a qualified doctor within 24 to 48 hours for a thorough examination."
        else:
            urgency = "routine"
            next_step = "Routine Consultation with Precaution Monitoring — Arrange a standard doctor visit while practicing the conservative precautions above."
            
        emergency_protocol = {
            "is_active": False,
            "helpline": "112",
            "alert_heading": "STANDARD CLINICAL GUIDANCE",
            "instructions": "If any emergency warning signs develop at any point, contact 112 or proceed to an emergency department immediately."
        }
        
    return {
        "is_emergency": is_emergency,
        "urgency_level": urgency,
        "understanding": {
            "summary": understanding_summary,
            "missing_information": missing_info
        },
        "precautions": precautions,
        "things_to_avoid": things_to_avoid,
        "warning_signs": warning_signs,
        "emergency_protocol": emergency_protocol,
        "recommended_next_step": next_step
    }

if __name__ == "__main__":
    print("Testing regular headache...")
    h = analyze_precautions("Throbbing headache on right side for 2 days, moderate intensity")
    print("Urgency:", h["urgency_level"])
    print("Precautions:", len(h["precautions"]))
    
    print("\nTesting emergency chest pain...")
    cp = analyze_precautions("Crushing chest pain radiating to left arm")
    print("Is Emergency:", cp["is_emergency"])
    print("Urgency:", cp["urgency_level"])
    print("Emergency Protocol Helpline:", cp["emergency_protocol"]["helpline"])
    print("\nSUCCESS!")
