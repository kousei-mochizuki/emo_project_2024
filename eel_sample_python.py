"""Main Python application file for the EEL-CRA demo."""

import os
import platform
import random
import sys

###
import json
import re # 削除する
import datetime
import numpy as np
from transformers import AutoTokenizer, AutoModelForSequenceClassification
###

import eel

# Use latest version of Eel from parent directory
sys.path.insert(1, '../../')
#print(sys.path)


@eel.expose
def expand_user(folder):
    """Return the full path to display in the UI."""
    return '{}/*'.format(os.path.expanduser(folder))


@eel.expose
def pick_file(folder):
    """Return a random file from the specified folder."""
    folder = os.path.expanduser(folder)
    if os.path.isdir(folder):
        listFiles = [_f for _f in os.listdir(folder) if not os.path.isdir(os.path.join(folder, _f))]
        if len(listFiles) == 0:
            return 'No Files found in {}'.format(folder)
        return random.choice(listFiles)
    else:
        return '{} is not a valid folder'.format(folder)

@eel.expose
def get_datetime():
    now = datetime.datetime.now()
    dt = now.strftime('%Y%m%d_%H%M%S')
    return dt



def np_softmax(x):
    f_x = np.exp(x) / np.sum(np.exp(x))
    return f_x

@eel.expose
def analyze_emotion(data_list):
    if not data_list:
        return json.dumps({})

    model_data = './src/models'
    emotion_names_jp = ['喜び', '期待', '驚き', '悲しみ', '恐れ', '嫌悪', '怒り']

    model = AutoModelForSequenceClassification.from_pretrained(model_data)
    tokenizer = AutoTokenizer.from_pretrained(model_data)
    model.eval()

    result_list = []

    for data in data_list:
        id, text = int(data['id']), data['text']  # IDを整数型に変換
        if not text:
            result_list.append({'id': id, 'text': '', 'emotion': {}})
        else:
            tokens = tokenizer(text, truncation=True, return_tensors="pt")
            tokens.to(model.device)
            preds = model(**tokens)
            prob = np_softmax(preds.logits.cpu().detach().numpy()[0])
            emotion_result = [{emotion: float(prob) for emotion, prob in zip(emotion_names_jp, prob)}]
            result_list.append({'id': id, 'text': text, 'emotion': emotion_result})

    return json.dumps(result_list)




def start_eel(develop):
    """Start Eel with either production or development configuration."""

    if develop:
        directory = 'src'
        app = None
        page = {'port': 3000}
    else:
        directory = 'build'
        app = 'chrome-app'
        page = 'index.html'

    eel.init(directory, ['.tsx', '.ts', '.jsx', '.js', '.html'])

    # These will be queued until the first connection is made, but won't be repeated on a page reload
    get_datetime()

    eel_kwargs = dict(
        host='localhost',
        port=10001,
        size=(1280, 800),
    )
    try:
        eel.start(page, mode=app, **eel_kwargs)
    except EnvironmentError:
        # If Chrome isn't found, fallback to Microsoft Edge on Win10 or greater
        if sys.platform in ['win32', 'win64'] and int(platform.release()) >= 10:
            eel.start(page, mode='edge', **eel_kwargs)
        else:
            raise


if __name__ == '__main__':
    import sys

    #print("cwd:", os.getcwd())
    #print("ospth:", os.listdir())

    # Pass any second argument to enable debugging
    start_eel(develop=len(sys.argv) == 2)
