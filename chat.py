import requests
import json

class Chat:
    def __init__(self, api_base="http://localhost:1234/v1"):
        self.api_base = api_base

    def create(self, model="gemma-3-1b-it", messages=None, stream=False):
        if messages is None:
            messages = [{"role": "system", "content": "Hello!"}]

        response = requests.post(
            f"{self.api_base}/chat/completions",
            json={"model": model, "messages": messages, "stream": stream},
            stream=stream
        )
        
        if stream:
            return response  # Return raw response stream
        else:
            return response.json()

    def list_models(self):
        models = []
        response = requests.get(f"{self.api_base}/models")

        model_dict = response.json()
        for model in model_dict.get("data", []):
            models.append(model["id"])
        return models

    def save_models(self):
        with open("models.json", "w") as f:
            models = self.list_models()
            json.dump(models, f)

    def get_response(self, model="gemma-3-1b-it", message="Hello!", stream=False):
        if stream:
            response = self.create(model, messages=[{"role": "user", "content": message}], stream=True)
            for line in response.iter_lines():
                if line:
                    print(line.decode("utf-8"))  # Stream response in real-time
        else:
            msgdict = self.create(model, messages=[{"role": "user", "content": message}])
            return msgdict["choices"][0]["message"]["content"]

# Example usage
chat = Chat()

# Print available models
print(chat.list_models())

# Get a normal response
print(chat.get_response())

# Get a streaming response
chat.get_response(stream=True)  # This will print chunks as they arrive

# Save models to a JSON file
chat.save_models()
