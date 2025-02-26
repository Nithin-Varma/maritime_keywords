import sys
import json
import re
from collections import defaultdict

# Maritime keyword patterns by category
MARITIME_PATTERNS = {
    "vessel": [
        r"\b(ship|vessel|boat|tanker|cargo|container|bulk carrier|ferry|yacht|tug|barge)\b",
        r"\b(bow|stern|deck|hull|bridge|anchor|propeller|rudder)\b",
        r"\b(captain|crew|sailor|helmsman|navigator)\b"
    ],
    "port": [
        r"\b(port|harbor|terminal|berth|dock|wharf|pier|jetty|quay)\b",
        r"\b(stevedore|longshoreman|port authority|pilot|agent)\b",
        r"\b(loading|unloading|berthing|mooring|departure|arrival)\b"
    ],
    "cargo": [
        r"\b(container|bulk|break-bulk|ro-ro|liquid|cargo|freight|goods)\b",
        r"\b(loading|discharge|stowage|lashing|securing|handling)\b",
        r"\b(tonnage|weight|volume|measurement|package|unit)\b"
    ],
    "documentation": [
        r"\b(bill of lading|manifest|certificate|document|declaration)\b",
        r"\b(customs|clearance|permit|license|inspection|survey)\b",
        r"\b(insurance|policy|claim|coverage|liability)\b"
    ],
    "safety": [
        r"\b(safety|security|emergency|hazard|risk|danger|accident)\b",
        r"\b(equipment|gear|device|system|procedure|protocol)\b",
        r"\b(inspection|audit|compliance|regulation|standard)\b"
    ]
}

def extract_keywords(text):
    """Extract maritime keywords from text by category."""
    keywords = defaultdict(set)
    
    # Convert text to lowercase for better matching
    text = text.lower()
    
    # Find matches for each category
    for category, patterns in MARITIME_PATTERNS.items():
        for pattern in patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                keywords[category].update(match.lower() for match in matches)
    
    # Convert sets to lists for JSON serialization
    return {k: list(v) for k, v in keywords.items() if v}

def main():
    # Read input from stdin
    input_text = sys.stdin.read()
    try:
        # Parse input as JSON
        data = json.loads(input_text)
        text = data.get('text', '')
        
        # Extract keywords
        keywords = extract_keywords(text)
        
        # Return results as JSON
        result = {
            'success': True,
            'keywords': keywords
        }
        print(json.dumps(result))
        
    except json.JSONDecodeError:
        print(json.dumps({
            'success': False,
            'error': 'Invalid JSON input'
        }))
    except Exception as e:
        print(json.dumps({
            'success': False,
            'error': str(e)
        }))

if __name__ == '__main__':
    main()