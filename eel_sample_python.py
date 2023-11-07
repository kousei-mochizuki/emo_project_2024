"""Main Python application file for the EEL-CRA demo."""

import os
import platform
import random
import sys

###
import json
import re
import datetime
import numpy as np
from transformers import AutoTokenizer, AutoModelForSequenceClassification
###

import eel

# Use latest version of Eel from parent directory
sys.path.insert(1, '../../')
print(sys.path)

@eel.expose  # Expose function to JavaScript
def say_hello_py(x):
    """Print message from JavaScript on app initialization, then call a JS function."""
    print('Hello from %s' % x)  # noqa T001
    eel.say_hello_js('Python {from within say_hello_py()}!')


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
def np_softmax(x):
    f_x = np.exp(x) / np.sum(np.exp(x))
    return f_x

@eel.expose
def get_datetime():
    now = datetime.datetime.now()
    dt = now.strftime('%Y%m%d_%H%M%S')
    return dt

@eel.expose
def split_sentences(text):
    text = re.sub(r"\n", "", text)  # 改行を除外

    # sentences = re.split(r"。", text)  # 句点で分割
    sentences = re.split(r"(?<=」)", text)  # 鍵括弧で分割

    # 文章に「。」を後付けで追加
    for i in range(len(sentences)-1):
        sentences[i] += "。"

    # 空の文を除外して、各文にIDを付けてリストに格納
    sentence_list = []
    for i, sentence in enumerate(sentences):
        if sentence:
            sentence_list.append((i+1, sentence.strip()))  # IDと文をタプルとしてリストに追加

    return sentence_list

sentence_list = '「海賊王に俺はなる！」「降りて来いよド三流　格の違いってやつを見せてやる！！」「俺は俺の責務を全うする！！ここにいる者は誰も死なせない！！」「母上　俺はちゃんとやれただろうか　やるべきこと　果たすべきことを　全うできましたか？」「おれは人間をやめるぞ！ジョジョーッ！！」「おれは人間を超越するッ！」「そうくるか！！　女誑しめ！！」「ならばこちらは大義だ」「どけ！！！　俺はお兄ちゃんだぞ！！！」「全力でお兄ちゃんを遂行する！！」「とりあえず1回呼んでみてくれないか？お兄ちゃんと」「そうだよ。エヴァに乗って、世界を変えるんだ！」「舐めるなよ小童が！！！」「そのニヤケ面ごと飲み込んでくれるわ！！！」「真に純粋な本物の"人間"なのだ」「どこをどう見て言っている！！」「失われた命は回帰しない　二度と戻らない」「ヒューズは死んだ！！　もう居ない！！　貴様の行為は火に油を注ぐだけだ！！」「仲間に手を掛けるとはどうゆう了見ダ？」「忘れる訳ないだろうガ！！！」「遅めの反抗期だよ親父殿！！」「バッカじゃないの　綺麗事並べてさ　人情ごっこかい？　虫唾が走る！！」「何だと？　お前　お前はもう　黙れ　煉獄さんのことを喋るな」「逃げるな卑怯者！！」「人の心の中に土足で踏み入るな　俺はお前を許さない」「そんなことが通用するならお前の家族は殺されていない」「焼き殺すぞ」「生殺与奪の権を他人に握らせるな！！」「いいか…てめーらが宇宙のどこで何しよーとかまわねー　だが俺のこの剣　こいつが届く範囲は俺の国だ」「もう喋らなくていいぞエンヴィー　まずその舌の根から焼き尽くしてやろう」「獪岳　鬼になったお前を　俺はもう兄弟子と思わない」「貴様アアア！！逃げるなアア！！！　責任から逃げるなアア」「つらいも何もあるものか　私の姉を殺したのはお前だな？　この羽織に見覚えはないか」「よもやその無理難題を押しつけるために手を組んだのではあるまいな？」「糞が…　ニンゲンふぜいが見下してんじゃねぇ！！」「蒙昧な人間共その一生を幾千積み重ねても釣り合わんぞ」「無惨　お前は　存在してはいけない生き物だ」「惨めったらしくうずくまるのはやめろ！！」「地獄に堕ちろ」「偽物は消えて然るべき」「仲間ってのは魂で繋がってんだヨ！！　魂に染みついちまっているものをすすいで落とす事なんか出来ないんだヨ！！」「言うはずが無いだろうそんなことを　俺の家族が！！」「正気とは思えませんね　貴方頭大丈夫ですか？　本当に吐き気がする」「失礼だな　純愛だよ」「オマエが一番信用できる　そんだけだよ」「本当にまったくその通り!　激情にまかせて吠えたところで得な事なんてありゃしねぇ」「今の私には止めてくれる者や正しい道を示してくれる者がいます」「逆だよ　ゴン　オレなんだ　ゴン　オレ　お前にあえて　本当によかった」「感謝するぜ　お前と出会えた　これまでの全てに！！！」「私はこの人を信用しているし信頼している　でも尊敬はしてません」「友達が友達助けるのは当然だろ」「ああ諸君今日は思ったより早く帰れそうだ　鋼の錬金術師が乗っている」「了解しました　お望みとあらば地獄まで」「あいつが戦って負けるわけがねェ　汚ねェ罠にかけられたに決まってる！！」「友達になるのにだって資格なんていらない！！」「手を貸した方がいいかね？　鋼の」「君を私の補佐官に推薦しようと思う　君に私の背中を守ってもらいたい　わかるか　背中を任せるという事はいつでも後ろから私を撃てるという事だ」「私が道を踏み外したらその手で私を撃ち殺せ　君にはその資格がある　付いて来てくれるか」「うろたえるな！　思考を止めるな！　生きることをあきらめるな！！」「虎杖君はもう　呪術師なんですから」「雨の日は無能なんですから下がっててください大佐！」「だけどなんでかねぇ…　見捨てる気持ちにはなれねぇんだよな　そういうの!」「後は頼みます」「頼むこのまま　炭治郎のまま　死んでくれ…！！」'

@eel.expose
def analyze_emotion(sentence_list):
    sentence_list = split_sentences(sentence_list)
    model_data = './src/models'
    emotion_names_jp = ['喜び', '期待', '驚き', '悲しみ', '恐れ', '嫌悪', '怒り']  # 日本語版

    model = AutoModelForSequenceClassification.from_pretrained(model_data)
    tokenizer = AutoTokenizer.from_pretrained(model_data)
    model.eval()

    dt = get_datetime()
    result_list = []
    id_list = []

    for id, sentence in sentence_list:
        tokens = tokenizer(sentence, truncation=True, return_tensors="pt")
        tokens.to(model.device)
        preds = model(**tokens)
        prob = np_softmax(preds.logits.cpu().detach().numpy()[0])
        result_list.append(prob)
        id_list.append(id)

    result_arr = np.array(result_list)

    # if save_csv:
    #     filename = "emotion_results_" + dt + ".csv"
    #     header = ['ID'] + emotion_names_jp
    #     with open(filename, mode='w', newline='', encoding='utf-8') as file:
    #         writer = csv.writer(file)
    #         writer.writerow(header)
    #         for i, row in enumerate(result_arr):
    #             writer.writerow([id_list[i]] + row.tolist())

    #if out_dict:
    result_dict = [{emotion: prob for emotion, prob in zip(emotion_names_jp, row)} for row in result_arr]
    print("model_data:", result_dict)
    return json.dumps(result_dict)  # JSONに変換して返す




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
    # say_hello_py('Python World!')
    # eel.say_hello_js('Python World!')   # Call a JavaScript function (must be after `eel.init()`)
    get_datetime()

    eel.show_log('https://github.com/samuelhwilliams/Eel/issues/363 (show_log)')

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

    print("cwd:", os.getcwd())
    print("ospth:", os.listdir())

    # Pass any second argument to enable debugging
    start_eel(develop=len(sys.argv) == 2)
