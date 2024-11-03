import torch
from transformers import GPT2LMHeadModel
import os

def export_to_onnx(model_path="minimal_api_gpt", output_path="minimal_api_gpt.onnx"):
    # Load the model
    model = GPT2LMHeadModel.from_pretrained(model_path)
    model.eval()
    
    # Create dummy input
    dummy_input = torch.randint(0, 50257, (1, 128))  # batch_size=1, seq_length=128
    
    # Export
    torch.onnx.export(
        model,
        dummy_input,
        output_path,
        input_names=['input_ids'],
        output_names=['logits'],
        dynamic_axes={
            'input_ids': {0: 'batch_size', 1: 'sequence'},
            'logits': {0: 'batch_size', 1: 'sequence'}
        },
        opset_version=12
    )
    
    print(f"Model exported to {output_path}")
    print(f"File size: {os.path.getsize(output_path) / 1024 / 1024:.2f}MB")

if __name__ == "__main__":
    export_to_onnx()