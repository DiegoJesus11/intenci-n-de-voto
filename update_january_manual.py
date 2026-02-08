import json
import os

# Manual data extraction from the provided image
# Columns: Candidate | Total | Lima | Interior
JANUARY_DATA = [
    {"name": "Rafael López Aliaga", "total": 10, "Lima": 17, "Interior": 6},
    {"name": "Keiko Fujimori", "total": 7, "Lima": 9, "Interior": 6},
    {"name": "Carlos Álvarez", "total": 4, "Lima": 4, "Interior": 4},
    {"name": "Alfonso López Chau", "total": 3, "Lima": 3, "Interior": 3},
    {"name": "George Forsyth", "total": 3, "Lima": 3, "Interior": 3},
    {"name": "Mario Vizcarra", "total": 3, "Lima": 3, "Interior": 3},
    {"name": "José Luna Gálvez", "total": 2, "Lima": 3, "Interior": 2},
    {"name": "César Acuña", "total": 2, "Lima": 2, "Interior": 2},
    {"name": "Vladimir Cerrón", "total": 2, "Lima": 2, "Interior": 2},
    {"name": "Roberto Sánchez", "total": 2, "Lima": 2, "Interior": 2},
    {"name": "José Williams", "total": 2, "Lima": 2, "Interior": 2},
    {"name": "Fernando Olivera", "total": 2, "Lima": 1, "Interior": 2},
    {"name": "Otros", "total": 11, "Lima": 9, "Interior": 13},
    {"name": "Blanco/viciado/ninguno", "total": 29, "Lima": 20, "Interior": 34},
    {"name": "No precisa", "total": 18, "Lima": 20, "Interior": 16}
]

JSON_FILE = 'datos_encuestas.json'

def update_january():
    if not os.path.exists(JSON_FILE):
        print(f"Error: {JSON_FILE} not found.")
        return

    with open(JSON_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Format data for JSON structure
    january_candidates = []
    for item in JANUARY_DATA:
        candidate_entry = {
            "name": item["name"],
            "total": float(item["total"]),
            "geography": {
                "Lima": float(item["Lima"]),
                "Interior": float(item["Interior"])
                # Other regions are missing in this partial data
            }
            # NSE, Gender, Age are missing
        }
        january_candidates.append(candidate_entry)

    # Update or Add "Enero 2026"
    data["Enero 2026"] = {
        "candidates": january_candidates
    }

    with open(JSON_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print("Successfully added 'Enero 2026' data to datos_encuestas.json")

if __name__ == "__main__":
    update_january()
