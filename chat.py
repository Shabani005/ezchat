import requests
import json

class Chat:
    def __init__(self, api_base="http://localhost:1234/v1"):
        self.api_base = api_base

    
    
    
    def create(self, model="gemma-3-1b-it", messages=None):
        if messages is None:
            messages = [{"role": "system", "content": "Hello!"}]

        response = requests.post(f"{self.api_base}/chat/completions", json={
            "model": model,
            "messages": messages
        })
        return response.json()

       
    
    def list_models(self):
        models = []
        list_models = requests.get(f"{self.api_base}/models")

        model_dict = list_models.json()
        
        for model in model_dict["data"]:
            models.append(model["id"])
        return models

    def save_models(self):
        f = open("models.json", "w")
        models = self.list_models()
        json.dump(models, f)
        f.close()

    def get_response(self, model="gemma-3-1b-it", message="Hello!"):
        msgdict = self.create(model, messages=[{"role": "user", "content": message}])
        response = msgdict["choices"][0]["message"]["content"]
        return response
    



chat = Chat()

print(chat.list_models())
print(chat.get_response())
chat.save_models()