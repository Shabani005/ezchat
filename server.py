import flask
from flask_cors import CORS
from flask import render_template
from chat import Chat
from flask import jsonify  

flask_chat = flask.Flask(__name__, static_folder='static', template_folder='templates')
CORS(flask_chat)

get_models = Chat().list_models()


@flask_chat.route('/')
def index():
    return render_template('index.html')

@flask_chat.route('/v1/models', methods=['GET'])
def list_models():
    models = Chat().list_models()
    return models

@flask_chat.route('/', methods=['POST'])
def get_response():
    try:
        data = flask.request.get_json()
        model = data.get("model", "gemma-3-1b-it")
        message = data.get("message", "Hello!")

        response = Chat().get_response(model, message)
        return jsonify(response)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    flask_chat.run(port=5555, debug=True)
    