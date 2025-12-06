import numpy as np
import laspy
from models.kpconv import KPConvWrapper

# SemanticKITTI class mapping (19 classes)
CLASS_NAMES = {
    0: 'unlabeled',
    1: 'car',
    2: 'bicycle',
    3: 'motorcycle',
    4: 'truck',
    5: 'other-vehicle',
    6: 'person',
    7: 'bicyclist',
    8: 'motorcyclist',
    9: 'road',
    10: 'parking',
    11: 'sidewalk',
    12: 'other-ground',
    13: 'building',
    14: 'fence',
    15: 'vegetation',
    16: 'trunk',
    17: 'terrain',
    18: 'pole',
    19: 'traffic-sign'
}

def load_las_file_chunked(las_path, max_points=100000):
    """Load and downsample .las file"""
    las_data = laspy.read(las_path)
    total_points = len(las_data.x)
    
    print(f"Total points in file: {total_points}")
    
    # Calculate step to downsample
    step = max(1, total_points // max_points)
    indices = np.arange(0, total_points, step)
    
    print(f"Downsampling to ~{len(indices)} points (step={step})")
    
    # Extract points with downsampling
    points = np.vstack((
        las_data.x[indices], 
        las_data.y[indices], 
        las_data.z[indices]
    )).T
    
    if hasattr(las_data, 'red'):
        colors = np.vstack((
            las_data.red[indices], 
            las_data.green[indices], 
            las_data.blue[indices]
        )).T / 65535.0
    else:
        colors = None
    
    return points, colors

def batch_process(points, colors, model, batch_size=5000):
    num_points = len(points)
    all_predictions = []
    
    print(f"Total points to process: {num_points}")
    print(f"Processing in batches of {batch_size}...")
    
    for i in range(0, num_points, batch_size):
        end_idx = min(i + batch_size, num_points)
        batch_points = points[i:end_idx]
        batch_colors = colors[i:end_idx] if colors is not None else None
        
        print(f"Batch {i//batch_size + 1}/{(num_points-1)//batch_size + 1} ({i}-{end_idx})")
        
        predictions, _ = model.detect_objects(batch_points, batch_colors)
        all_predictions.append(predictions)
    
    return np.concatenate(all_predictions)

def analyze_predictions(predictions):
    """Analyze and display prediction statistics"""
    unique, counts = np.unique(predictions, return_counts=True)
    
    print("\n" + "="*60)
    print("SEMANTIC SEGMENTATION RESULTS")
    print("="*60)
    
    total_points = len(predictions)
    for class_id, count in zip(unique, counts):
        percentage = (count / total_points) * 100
        class_name = CLASS_NAMES.get(int(class_id), 'unknown')
        print(f"{class_name:20s} (ID {class_id:2d}): {count:8d} points ({percentage:5.2f}%)")
    
    print("="*60)
    print(f"Total points: {total_points}")
    
    return unique, counts

def save_as_ply(points, predictions, output_path='segmented_output.ply'):
    """Save segmented point cloud as PLY file with class-based colors"""
    # Color map for visualization (RGB values 0-255)
    COLOR_MAP = {
        0: [128, 128, 128],  # unlabeled - gray
        1: [245, 150, 100],  # car - orange
        2: [245, 230, 100],  # bicycle - yellow
        3: [150, 60, 30],    # motorcycle - brown
        4: [180, 30, 80],    # truck - purple
        5: [255, 0, 0],      # other-vehicle - red
        6: [30, 30, 255],    # person - blue
        7: [200, 40, 255],   # bicyclist - pink
        8: [90, 30, 150],    # motorcyclist - dark purple
        9: [255, 0, 255],    # road - magenta
        10: [255, 150, 255], # parking - light magenta
        11: [75, 0, 75],     # sidewalk - dark magenta
        12: [75, 0, 175],    # other-ground - dark blue
        13: [0, 200, 255],   # building - cyan
        14: [50, 120, 255],  # fence - light blue
        15: [0, 175, 0],     # vegetation - green
        16: [0, 60, 135],    # trunk - dark cyan
        17: [80, 240, 150],  # terrain - light green
        18: [150, 240, 255], # pole - light cyan
        19: [0, 0, 255],     # traffic-sign - pure blue
    }
    
    # Create colored point cloud
    colors = np.array([COLOR_MAP.get(int(pred), [128, 128, 128]) for pred in predictions])
    
    num_points = len(points)
    
    # Write PLY file
    with open(output_path, 'w') as f:
        # Write header
        f.write("ply\n")
        f.write("format ascii 1.0\n")
        f.write(f"element vertex {num_points}\n")
        f.write("property float x\n")
        f.write("property float y\n")
        f.write("property float z\n")
        f.write("property uchar red\n")
        f.write("property uchar green\n")
        f.write("property uchar blue\n")
        f.write("property int class\n")
        f.write("end_header\n")
        
        # Write data
        for i in range(num_points):
            f.write(f"{points[i, 0]} {points[i, 1]} {points[i, 2]} "
                   f"{int(colors[i, 0])} {int(colors[i, 1])} {int(colors[i, 2])} "
                   f"{int(predictions[i])}\n")
    
    print(f"\n✅ Saved segmented point cloud to: {output_path}")

# Load with downsampling
points, colors = load_las_file_chunked('model.las', max_points=50000)
print(f"Loaded {len(points)} points")

# Initialize model
test = KPConvWrapper(device='cpu', num_classes=19, weights_path="kpconv_semantickitti.pth")

# Process in smaller batches
predictions = batch_process(points, colors, test, batch_size=5000)

print("Processing complete!")

# Analyze results
unique_classes, class_counts = analyze_predictions(predictions)

# Save as PLY file
save_as_ply(points, predictions, 'segmented_output.ply')

print("\n✅ Done! Open 'segmented_output.ply' in CloudCompare, MeshLab, or similar viewer to see results.")