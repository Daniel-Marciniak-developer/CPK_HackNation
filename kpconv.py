import torch
import open3d.ml.torch as ml3d
import numpy as np

class KPConvWrapper:
    def __init__(self, device='cpu', num_classes=20, weights_path=''):
        self.device = device
        
        # Load model with pipeline for proper preprocessing
        self.pipeline = ml3d.pipelines.SemanticSegmentation(
            model=ml3d.models.KPFCNN(num_classes=num_classes),
            device=device
        )
        
        # Load weights
        checkpoint = torch.load(weights_path, map_location=device)
        if "model_state_dict" in checkpoint:
            state_dict = checkpoint["model_state_dict"]
        elif "state_dict" in checkpoint:
            state_dict = checkpoint["state_dict"]
        else:
            state_dict = checkpoint
            
        self.pipeline.model.load_state_dict(state_dict)
        self.pipeline.model.eval()
        
        print("✅ KPFCNN model loaded successfully")
    
    def detect_objects(self, points, colors):
        # Convert to numpy if needed
        if isinstance(points, torch.Tensor):
            points = points.cpu().numpy()
        if colors is not None and isinstance(colors, torch.Tensor):
            colors = colors.cpu().numpy()
        
        # Create data dictionary with required fields
        data = {
            'point': points.astype(np.float32),
            'feat': colors.astype(np.float32) if colors is not None else np.ones((len(points), 1), dtype=np.float32),
            'label': np.zeros(len(points), dtype=np.int32)  # Dummy labels for inference
        }
        
        results = self.pipeline.run_inference(data)
        return results['predict_labels'], points