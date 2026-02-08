import pdfplumber
import os
import re
import json

# ==========================================
# CONFIGURATION
# ==========================================

BASE_DIR = 'fuentes_encuestas'

# Mapping of PDF filenames to JSON keys (Must match script.js MONTH_ORDER_DEFINED)
FILES_MAP = {
    'Julio.pdf': 'Julio 2025',
    'Agosto.pdf': 'Agosto 2025',
    'Setiembre.pdf': 'Setiembre 2025',
    'Octubre 1.pdf': 'Octubre 2025',
    'Octubre 2.pdf': 'Octubre (2) 2025',
    'Noviembre 1.pdf': 'Noviembre (1) 2025',
    'Noviembre 2.pdf': 'Noviembre (2) 2025',
    'Diciembre 1.pdf': 'Diciembre 2025 (1)',
    'Diciembre 2.pdf': 'Diciembre 2025 (2)'
    # Enero 2026 data might come from another source or file not yet listed in the simple map
}

# Whitelist of valid candidate names (Active + Excluded + Special)
# Derived from script.js to ensure exact matching of keys
VALID_CANDIDATES = [
    # Active / Key Candidates
    "Alfonso López Chau", "Carlos Espá", "César Acuña", "George Forsyth",
    "Keiko Fujimori", "Mario Vizcarra", "Rafael Belaunde", "Rafael López Aliaga",
    "Ricardo Belmont", "Vladimir Cerrón", "Yonhy Lescano", "Carlos Álvarez",
    "Roberto Chiabra", "Fiorella Molinelli", "Hernando de Soto", "Jorge Nieto",
    "José Luna Gálvez", "José Williams", "Álex González", "Álvaro Paz de la Barra",
    "Antonio Ortiz", "Armando Massé", "Carlos Jaico", "Charlie Carrasco",
    "Enrique Valderrama", "Fernando Olivera", "Francisco Diez Canseco",
    "Herbert Caller", "Mesías Guevara", "Napoleón Becerra", "Paul Jaimes",
    "Roberto Sánchez", "Ronald Atencio", "Rosario del Pilar Fernández",
    "Walter Chirinos", "Wolfgang Grozo",
    # Excluded (Fuera de carrera)
    "Alfredo Barnechea", "Arturo Fernández", "Guillermo Bermejo",
    "Javier Velásquez Quesquén", "Jorge del Castillo", "Phillip Butters",
    "Victor Andrés García Belaunde",
    # Special Categories
    "Blanco/viciado/ninguno", "Blanco/viciado", "Otros", "No precisa"
]

# Map variations to canonical names
NAME_MAPPING = {
    "Blanco/viciado": "Blanco/viciado/ninguno",
    "Blanco/Viciado": "Blanco/viciado/ninguno",
    "Ninguno/Blanco/Viciado": "Blanco/viciado/ninguno",
    "No precisa": "No precisa",
    "Otros": "Otros"
}

# ==========================================
# EXTRACTION LOGIC
# ==========================================

def get_canonical_name(text_line):
    """
    Checks if a line contains a valid candidate name.
    Returns the canonical name if found, None otherwise.
    """
    found_name = None
    longest_match_len = 0
    
    # We look for the candidate name in the line.
    # We pick the longest matching candidate name to avoid partial matches 
    # (e.g. if we had "Juan" and "Juan Perez", and line is "Juan Perez", matches "Juan Perez")
    
    for candidate in VALID_CANDIDATES:
        if candidate in text_line:
            if len(candidate) > longest_match_len:
                found_name = candidate
                longest_match_len = len(candidate)
    
    if found_name:
        return NAME_MAPPING.get(found_name, found_name)
    return None

def extract_text_from_pdf(pdf_path):
    text_content = []
    try:
        print(f"  Opening {pdf_path}...")
        with pdfplumber.open(pdf_path) as pdf:
            for i, page in enumerate(pdf.pages):
                text = page.extract_text()
                # Store as (page_num, text_lines). Page num is 1-based.
                if text:
                    text_content.append((i + 1, text.split('\n')))
                else:
                     text_content.append((i + 1, []))
        return text_content
    except Exception as e:
        print(f"  Error reading {pdf_path}: {e}")
        return []

def parse_line_digits(line, expected_count):
    """
    Finds a sequence of `expected_count` numbers at the end of the line.
    Returns list of floats or None.
    """
    # Regex explanation:
    # ((?:(?:\d+(?:\.\d+)?)\s+){N}(?:\d+(?:\.\d+)?))
    # Matches N numbers separated by whitespace at the end of the string ($)
    # The first part repeats (N-1) times, then the last number.
    
    # Build regex dynamically
    # Example for 2 numbers: r'((?:\d+(?:\.\d+)?\s+){1}\d+(?:\.\d+)?)\s*$'
    
    regex = r'((?:(?:\d+(?:\.\d+)?)\s+){' + str(expected_count - 1) + r'}(?:\d+(?:\.\d+)?))\s*$'
    match = re.search(regex, line)
    
    if match:
        numbers_str = match.group(1)
        try:
            numbers = [float(x) for x in numbers_str.split()]
            if len(numbers) == expected_count:
                return numbers
        except ValueError:
            return None
    return None

def process_pdf_data(pages_data):
    candidates_data = {} # Key: Canonical Name -> Dict
    
    for page_num, lines in pages_data:
        for line in lines:
            line_clean = line.strip()
            if not line_clean: continue
            
            # 1. Identify Candidate
            canonical_name = get_canonical_name(line_clean)
            if not canonical_name:
                continue # Skip garbage lines
            
            # 2. Init data structure
            if canonical_name not in candidates_data:
                candidates_data[canonical_name] = {"name": canonical_name}
            
            # 3. Parse Data based on Column Count (Page agnostic)
            # Demographics typically has 11 columns (Total + NSE(5) + Gender(2) + Age(3))
            # Geography typically has 9 columns (Total + Lima + Interior + Urban + Rural + Regions(4))
            
            # Try Demographics (11)
            nums_demo = parse_line_digits(line_clean, 11)
            if nums_demo:
                 # Update total if not present (or overwrite, they should match)
                 if "total" not in candidates_data[canonical_name]:
                     candidates_data[canonical_name]["total"] = nums_demo[0]
                 
                 candidates_data[canonical_name]["nse"] = {
                     "A": nums_demo[1], "B": nums_demo[2], "C": nums_demo[3], "D": nums_demo[4], "E": nums_demo[5]
                 }
                 candidates_data[canonical_name]["gender"] = {
                     "Masculino": nums_demo[6], "Femenino": nums_demo[7]
                 }
                 candidates_data[canonical_name]["age"] = {
                     "18-25": nums_demo[8], "26-42": nums_demo[9], "43+": nums_demo[10]
                 }
                 continue # Found match, move to next line

            # Try Geography (9)
            nums_geo = parse_line_digits(line_clean, 9)
            if nums_geo:
                # Update total if not present
                if "total" not in candidates_data[canonical_name]:
                    candidates_data[canonical_name]["total"] = nums_geo[0]
                
                candidates_data[canonical_name]["geography"] = {
                    "Lima": nums_geo[1],
                    "Interior": nums_geo[2],
                    "Interior Urbano": nums_geo[3],
                    "Interior Rural": nums_geo[4],
                    "Norte": nums_geo[5],
                    "Centro": nums_geo[6],
                    "Sur": nums_geo[7],
                    "Oriente": nums_geo[8]
                }
                continue

    # Convert to list and filter incomplete
    final_list = []
    for name, data in candidates_data.items():
        if "total" in data:
            final_list.append(data)
            
    # Sort by total descending
    final_list.sort(key=lambda x: x.get("total", 0), reverse=True)
    return final_list

def main():
    final_json = {}
    
    print("Starting Improved Extraction with Whitelist...")
    print(f"Target Directory: {BASE_DIR}")
    
    for filename, month_key in FILES_MAP.items():
        pdf_path = os.path.join(BASE_DIR, filename)
        
        if not os.path.exists(pdf_path):
            print(f"Skipping {filename} (not found)")
            continue
            
        print(f"Processing {month_key} ({filename})...")
        
        # 1. Extract raw text
        pages_content = extract_text_from_pdf(pdf_path)
        
        # 2. Parse and structure
        candidates_list = process_pdf_data(pages_content)
        
        # 3. Store
        final_json[month_key] = {
            "candidates": candidates_list
        }
        
        print(f"  -> Extracted {len(candidates_list)} valid candidates.")
        # Optional: Print names for verification
        # print("     Names:", [c['name'] for c in candidates_list])

    # Save JSON
    output_file = 'datos_encuestas.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(final_json, f, indent=2, ensure_ascii=False)
    
    print("------------------------------------------------")
    print(f"Extraction Complete. Saved to {output_file}")

if __name__ == '__main__':
    main()
