from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from pathlib import Path
import json
from classifier_genius import GeniusStreamingClassifier
from werkzeug.utils import secure_filename
import threading
import laspy
import numpy as np

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = Path(__file__).parent / 'uploads'
OUTPUT_FOLDER = Path(__file__).parent / 'outputs'

def cleanup_folders():
    """Clean up uploads and outputs folders on startup"""
    for folder in [UPLOAD_FOLDER, OUTPUT_FOLDER]:
        if folder.exists():
            try:
                # Remove all files in the folder
                for file in folder.glob('*'):
                    if file.is_file():
                        file.unlink()
                        print(f"Deleted: {file.name}")
                print(f"Cleaned: {folder.name}/")
            except Exception as e:
                print(f"Error cleaning {folder.name}: {e}")
        else:
            print(f"✓ Creating: {folder.name}/")
        
        folder.mkdir(exist_ok=True, parents=True)
    
    print("="*70 + "\n")

# Clean folders on startup
cleanup_folders()

MAX_FILE_SIZE = 30 * 1024 * 1024 * 1024  # 30GB
ALLOWED_EXTENSIONS = {'.las', '.laz'}

def allowed_file(filename):
    return Path(filename).suffix.lower() in ALLOWED_EXTENSIONS

@app.route('/api/upload', methods=['POST'])
def upload_file():
    """Handle file upload and start classification"""
    try:
        print("\n" + "="*70)
        print("UPLOAD REQUEST RECEIVED")
        print("="*70)
        
        # Debug: Print request info
        print(f"Method: {request.method}")
        print(f"Content-Type: {request.content_type}")
        print(f"Content-Length: {request.content_length}")
        print(f"Files in request: {list(request.files.keys())}")
        
        if 'file' not in request.files:
            print("ERROR: No 'file' field in request")
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        print(f"File object obtained: {file.filename}")
        
        if file.filename == '':
            print("ERROR: Empty filename")
            return jsonify({'error': 'No file selected'}), 400
        
        # Validate file extension
        if not allowed_file(file.filename):
            print(f"ERROR: Invalid extension: {Path(file.filename).suffix}")
            return jsonify({'error': 'Invalid file format. Only LAS/LAZ supported'}), 400
        
        print(f"File extension valid: {Path(file.filename).suffix}")
        
        # IMPORTANT: Read the entire file into memory ONCE
        print("📖 Reading file content into memory...")
        file_data = file.read()
        file_size = len(file_data)
        
        print(f"File read complete")
        print(f"File size: {file_size} bytes ({file_size / 1024 / 1024:.2f} MB)")
        
        # Verify file is not empty
        if file_size == 0:
            print("ERROR: File is empty after read!")
            print(f"Request content_length: {request.content_length}")
            return jsonify({'error': 'Uploaded file is empty'}), 400
        
        if file_size > MAX_FILE_SIZE:
            print(f"ERROR: File too large ({file_size / 1024 / 1024 / 1024:.2f} GB > 30GB)")
            return jsonify({'error': f'File too large. Max size: 30GB'}), 413
        
        print("File size validation passed")
        
        # Save uploaded file from memory
        filename = secure_filename(file.filename)
        input_path = UPLOAD_FOLDER / filename
        
        print(f"Writing file to disk: {input_path}")
        with open(input_path, 'wb') as f:
            bytes_written = f.write(file_data)
        
        print(f"File written: {bytes_written} bytes")
        
        # Verify file was saved correctly
        saved_size = input_path.stat().st_size
        print(f"File verified on disk: {saved_size} bytes")
        
        if saved_size == 0:
            print("ERROR: File saved but is empty!")
            return jsonify({'error': 'File save failed - empty file'}), 500
        
        if saved_size != file_size:
            print(f"WARNING: Size mismatch! Expected {file_size}, got {saved_size}")
        
        # Generate output path
        output_filename = f"{input_path.stem}_classified.las"
        output_path = OUTPUT_FOLDER / output_filename
        file_id = input_path.stem
        
        print(f"\nClassification details:")
        print(f"   Input:  {input_path}")
        print(f"   Output: {output_path}")
        print(f"   File ID: {file_id}")
        
        # Start classification in background thread
        print(f"\nStarting background classification thread...")
        thread = threading.Thread(
            target=_classify_file,
            args=(str(input_path), str(output_path), file_id),
            name=f"ClassifyThread-{file_id}"
        )
        thread.daemon = True
        thread.start()
        print(f"Thread started")
        
        response_data = {
            'status': 'success',
            'message': 'File uploaded and classification started',
            'input_file': filename,
            'output_file': output_filename,
            'file_id': file_id,
            'file_size_mb': round(file_size / 1024 / 1024, 2)
        }
        
        print(f"\nUPLOAD SUCCESSFUL")
        print("="*70 + "\n")
        
        return jsonify(response_data), 200
    
    except Exception as e:
        print(f"\nUPLOAD FAILED: {e}")
        import traceback
        traceback.print_exc()
        print("="*70 + "\n")
        return jsonify({'error': str(e)}), 500

def _classify_file(input_path, output_path, file_id):
    """Background task to classify the file"""
    try:
        print(f"\n{'='*70}")
        print(f"CLASSIFICATION THREAD STARTED: {file_id}")
        print(f"{'='*70}")
        
        # Verify input file exists and has content
        input_path_obj = Path(input_path)
        if not input_path_obj.exists():
            raise FileNotFoundError(f"Input file not found: {input_path}")
        
        input_size = input_path_obj.stat().st_size
        print(f"Input file verified: {input_size} bytes")
        
        if input_size == 0:
            raise ValueError("Input file is empty!")
        
        classifier = GeniusStreamingClassifier()
        classifier.process_file_streaming(input_path, output_path)
        
        # Save status
        status_file = OUTPUT_FOLDER / f"{file_id}_status.json"
        with open(status_file, 'w') as f:
            json.dump({'status': 'completed', 'file_id': file_id}, f)
        
        print(f"\nClassification completed for {file_id}")
        print(f"{'='*70}\n")
    except Exception as e:
        status_file = OUTPUT_FOLDER / f"{file_id}_status.json"
        with open(status_file, 'w') as f:
            json.dump({'status': 'error', 'file_id': file_id, 'error': str(e)}, f)
        print(f"\nClassification failed for {file_id}: {e}")
        import traceback
        traceback.print_exc()
        print(f"{'='*70}\n")

@app.route('/api/status/<file_id>', methods=['GET'])
def get_status(file_id):
    """Get classification status"""
    try:
        status_file = OUTPUT_FOLDER / f"{file_id}_status.json"
        output_path = OUTPUT_FOLDER / f"{file_id}_classified.las"
        
        if status_file.exists():
            with open(status_file) as f:
                status_data = json.load(f)
            return jsonify(status_data), 200
        
        if output_path.exists():
            return jsonify({
                'status': 'completed',
                'file_id': file_id,
                'output_file': f"{file_id}_classified.las"
            }), 200
        
        return jsonify({
            'status': 'processing',
            'file_id': file_id
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/stats/<file_id>', methods=['GET'])
def get_stats(file_id):
    """Get classification statistics for completed file"""
    try:
        output_path = OUTPUT_FOLDER / f"{file_id}_classified.las"
        status_file = OUTPUT_FOLDER / f"{file_id}_status.json"
        
        # Check if classification is still processing
        if status_file.exists():
            with open(status_file) as f:
                status_data = json.load(f)
            if status_data.get('status') == 'error':
                return jsonify({'error': status_data.get('error')}), 400
        
        if not output_path.exists():
            return jsonify({'error': 'File not found or still processing'}), 404
        
        # Read the classified LAS file
        print(f"Reading statistics from {output_path}")
        
        las = laspy.read(str(output_path))

        print(f"LAS file loaded: {len(las.points)} points")
        print(f"Has classification: {hasattr(las, 'classification')}")
        print(f"Classification data: {las.classification}")
        
        # Get classification data
        classifications = las.classification
        total_points = len(classifications)
        
        # Class names mapping (ASPRS LAS 1.4 standard)
        class_names = {
            0: 'Never Classified',
            1: 'Unclassified',
            2: 'Ground',
            3: 'Low Vegetation',
            4: 'Medium Vegetation',
            5: 'High Vegetation',
            6: 'Building',
            7: 'Low Point (noise)',
            8: 'Model Key-point',
            9: 'Water',
            10: 'Rail',
            11: 'Road Surface',
            12: 'Reserved',
            13: 'Wire - Guard (Shield)',
            14: 'Wire - Conductor (Phase)',
            15: 'Transmission Tower',
            16: 'Wire - Structure Connector',
            17: 'Bridge Deck',
            18: 'High noise',
            19: 'Overhead Structure',
            20: 'Ignored Ground',
            21: 'Snow',
            22: 'Temporal Exclusion'
        }
        
        # Calculate statistics per class
        class_stats = {}
        for class_id in np.unique(classifications):
            class_id = int(class_id)
            count = np.sum(classifications == class_id)
            percentage = (count / total_points) * 100
            class_name = class_names.get(class_id, f'Class {class_id}')
            
            class_stats[class_id] = {
                'name': class_name,
                'count': int(count),
                'percentage': round(percentage, 2)
            }
        
        # Sort by count descending
        sorted_stats = sorted(class_stats.items(), key=lambda x: x[1]['count'], reverse=True)
        
        # Get file info
        input_path = UPLOAD_FOLDER / f"{file_id}.las"
        input_size = input_path.stat().st_size if input_path.exists() else 0
        output_size = output_path.stat().st_size
        
        stats_response = {
            'file_id': file_id,
            'total_points': int(total_points),
            'input_file_size_mb': round(input_size / 1024 / 1024, 2),
            'output_file_size_mb': round(output_size / 1024 / 1024, 2),
            'classes': [
                {
                    'id': class_id,
                    'name': data['name'],
                    'points': data['count'],
                    'percentage': data['percentage']
                }
                for class_id, data in sorted_stats
            ]
        }

        print(stats_response)
        
        print(f"Statistics calculated: {total_points} points in {len(sorted_stats)} classes")
        return jsonify(stats_response), 200
    
    except Exception as e:
        print(f"Stats error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/download/<file_id>', methods=['GET'])
def download_file(file_id):
    """Download classified file"""
    try:
        file_path = OUTPUT_FOLDER / f"{file_id}_classified.las"
        
        if not file_path.exists():
            return jsonify({'error': 'File not found. Classification may still be in progress'}), 404
        
        return send_file(str(file_path), as_attachment=True, download_name=f"{file_id}_classified.las")
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'service': 'CPK Cloud Classifier'}), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)