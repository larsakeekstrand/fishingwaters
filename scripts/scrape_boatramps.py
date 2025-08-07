#!/usr/bin/env python3
import urllib.request
import re
import json

def scrape_boat_ramps():
    url = "https://www.batramper.se/karta"
    
    try:
        with urllib.request.urlopen(url) as response:
            content = response.read().decode('utf-8')
    except Exception as e:
        print(f"Failed to fetch page: {e}")
        return []
    
    # Find the marker array in the JavaScript
    # First, let's check if the content contains marker data
    if 'marker:' not in content:
        print("No 'marker:' found in content")
        return []
    
    # Try a more flexible pattern
    marker_pattern = r'marker:\s*{[^}]*values:\s*\[(.*?)\]\s*}'
    marker_match = re.search(marker_pattern, content, re.DOTALL)
    
    if not marker_match:
        # Try alternative pattern
        marker_pattern = r'values:\s*\[(.*?)\]\s*}'
        marker_match = re.search(marker_pattern, content, re.DOTALL)
        
        if not marker_match:
            print("Could not find marker data with regex")
            # Let's try to find it manually
            start_idx = content.find('values:[')
            if start_idx == -1:
                print("Could not find 'values:[' in content")
                return []
            
            # Find the matching closing bracket
            bracket_count = 0
            end_idx = start_idx + 8  # Skip 'values:['
            for i in range(start_idx + 8, len(content)):
                if content[i] == '[':
                    bracket_count += 1
                elif content[i] == ']':
                    if bracket_count == 0:
                        end_idx = i
                        break
                    bracket_count -= 1
            
            markers_text = content[start_idx + 8:end_idx]
        else:
            markers_text = marker_match.group(1)
    else:
        markers_text = marker_match.group(1)
    
    # Extract individual markers
    marker_item_pattern = r'{latLng:\[([0-9.]+),([0-9.]+)\],\s*options:{icon:\s*"[^"]+"},\s*data:"<span class=\'infoText\'>([^<]+)<br><a href=\'/ramp/([^\']+)\'>Mer info</a>"}'
    
    boat_ramps = []
    for match in re.finditer(marker_item_pattern, markers_text):
        lat = float(match.group(1))
        lng = float(match.group(2))
        name = match.group(3)
        ramp_slug = match.group(4)
        
        # Extract ID from slug (last part after dash)
        ramp_id_match = re.search(r'-(\d+)$', ramp_slug)
        ramp_id = ramp_id_match.group(1) if ramp_id_match else ramp_slug
        
        boat_ramps.append({
            "id": ramp_id,
            "name": name,
            "coordinates": [lng, lat],  # GeoJSON uses [lng, lat]
            "slug": ramp_slug,
            "url": f"https://www.batramper.se/ramp/{ramp_slug}"
        })
    
    return boat_ramps

def save_boat_ramps_geojson(boat_ramps):
    """Convert boat ramps to GeoJSON format"""
    features = []
    for ramp in boat_ramps:
        feature = {
            "type": "Feature",
            "properties": {
                "id": ramp["id"],
                "name": ramp["name"],
                "url": ramp["url"]
            },
            "geometry": {
                "type": "Point",
                "coordinates": ramp["coordinates"]
            }
        }
        features.append(feature)
    
    geojson = {
        "type": "FeatureCollection",
        "features": features
    }
    
    with open('../public/data/boatramps.json', 'w', encoding='utf-8') as f:
        json.dump(geojson, f, ensure_ascii=False, indent=2)
    
    print(f"Saved {len(features)} boat ramps to boatramps.json")

if __name__ == "__main__":
    print("Scraping boat ramps from batramper.se...")
    boat_ramps = scrape_boat_ramps()
    print(f"Found {len(boat_ramps)} boat ramps")
    
    if boat_ramps:
        save_boat_ramps_geojson(boat_ramps)
        print("\nSample boat ramps:")
        for ramp in boat_ramps[:5]:
            print(f"  - {ramp['name']} at {ramp['coordinates']}")