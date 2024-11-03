from transformers import GPT2Config, GPT2LMHeadModel, GPT2Tokenizer
import torch
from torch.utils.data import Dataset, DataLoader
import json
import os

class MinimalGPTConfig(GPT2Config):
    def __init__(self):
        super().__init__(
            n_positions=128,        # Reduced context length
            n_embd=256,            # Tiny embedding size
            n_layer=4,             # Only 4 layers
            n_head=4,              # 4 attention heads
            vocab_size=50257,      # Standard GPT-2 vocab
            bos_token_id=50256,
            eos_token_id=50256,
        )

def create_minimal_model():
    """Create a minimal GPT-2 style model (~20MB)"""
    config = MinimalGPTConfig()
    model = GPT2LMHeadModel(config)
    
    # Print model size
    param_size = sum(p.numel() for p in model.parameters()) * 4 / 1024 / 1024  # Size in MB
    print(f"Model size in memory: {param_size:.2f}MB")
    
    return model

class APICommandDataset(Dataset):
    def __init__(self, tokenizer):
        self.tokenizer = tokenizer
        self.examples = [
            # Simple drawing commands
            ("draw a red square", {"api": "draw_square", "params": {"color": "red"}}),
            ("create blue circle", {"api": "draw_circle", "params": {"color": "blue"}}),
            ("make green square", {"api": "draw_square", "params": {"color": "green"}}),
            
            # Size variations
            ("draw big red square", {"api": "draw_square", "params": {"color": "red", "size": 200}}),
            ("create small blue circle", {"api": "draw_circle", "params": {"color": "blue", "size": 50}}),
            
            # Text commands
            ("write hello at 100,100", {"api": "add_text", "params": {"text": "hello", "x": 100, "y": 100}}),
            ("put text welcome at 50,50", {"api": "add_text", "params": {"text": "welcome", "x": 50, "y": 50}}),
            
            # Add more examples covering your API patterns
        ]
        
    def __len__(self):
        return len(self.examples)
    
    def __getitem__(self, idx):
        command, api_call = self.examples[idx]
        text = f"Command: {command}\nAPI: {json.dumps(api_call)}\nEND\n"
        
        # Tokenize
        encodings = self.tokenizer(
            text,
            truncation=True,
            max_length=128,
            padding="max_length",
            return_tensors="pt"
        )
        
        return {
            'input_ids': encodings['input_ids'].squeeze(),
            'attention_mask': encodings['attention_mask'].squeeze()
        }

def train_minimal_model():
    # Create model and tokenizer
    model = create_minimal_model()
    tokenizer = GPT2Tokenizer.from_pretrained('gpt2')
    tokenizer.pad_token = tokenizer.eos_token
    
    # Create dataset
    dataset = APICommandDataset(tokenizer)
    dataloader = DataLoader(dataset, batch_size=4, shuffle=True)
    
    # Training setup
    optimizer = torch.optim.AdamW(model.parameters(), lr=5e-5)
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model.to(device)
    
    # Training loop
    num_epochs = 50
    for epoch in range(num_epochs):
        model.train()
        total_loss = 0
        
        for batch in dataloader:
            input_ids = batch['input_ids'].to(device)
            attention_mask = batch['attention_mask'].to(device)
            
            outputs = model(
                input_ids,
                attention_mask=attention_mask,
                labels=input_ids
            )
            
            loss = outputs.loss
            total_loss += loss.item()
            
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
        
        avg_loss = total_loss / len(dataloader)
        print(f"Epoch {epoch+1}, Average Loss: {avg_loss:.4f}")
    
    # Save the minimal model
    model.save_pretrained("minimal_api_gpt")
    tokenizer.save_pretrained("minimal_api_gpt")
    
    # Print final size
    size_mb = sum(os.path.getsize(f"minimal_api_gpt/{f}") 
                 for f in os.listdir("minimal_api_gpt")) / 1024 / 1024
    print(f"Saved model size: {size_mb:.2f}MB")

class APICommandPredictor:
    def __init__(self, model_path="minimal_api_gpt"):
        self.model = GPT2LMHeadModel.from_pretrained(model_path)
        self.tokenizer = GPT2Tokenizer.from_pretrained(model_path)
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model.to(self.device)
        self.model.eval()
    
    def predict(self, command):
        prompt = f"Command: {command}\nAPI:"
        inputs = self.tokenizer(prompt, return_tensors="pt").to(self.device)
        
        with torch.no_grad():
            outputs = self.model.generate(
                inputs.input_ids,
                max_length=128,
                num_return_sequences=1,
                pad_token_id=self.tokenizer.eos_token_id,
                temperature=0.7
            )
        
        response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
        try:
            # Extract the JSON part
            api_str = response.split("API:")[1].split("END")[0].strip()
            return json.loads(api_str)
        except:
            return None

if __name__ == "__main__":
    # Train the model
    train_minimal_model()
    
    # Test it
    predictor = APICommandPredictor()
    test_commands = [
        "draw a red square",
        "create blue circle",
        "write hello at 100,100"
    ]
    
    for cmd in test_commands:
        result = predictor.predict(cmd)
        print(f"\nCommand: {cmd}")
        print(f"Predicted API call: {result}")