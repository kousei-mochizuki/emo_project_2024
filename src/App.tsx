import "./App.css";
import theme from "./theme/theme";
import { Button, ChakraProvider, Text } from "@chakra-ui/react";
import { BrowserRouter } from "react-router-dom";
import { Router } from "./router/Router";
import { Toaster } from "react-hot-toast";
import { RecoilRoot } from "recoil";
import { eel } from "./eel";
import { useState } from "react";

///
import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/ext-language_tools"
///



eel.set_host( 'ws://localhost:10001')

// Expose the `sayHelloJS` function to Python as `say_hello_js`
function sayHelloJS( x: string ) {
	console.log( 'Hello from ' + x )
}
// WARN: must use window.eel to keep parse-able eel.expose{...}
window.eel.expose( sayHelloJS, 'say_hello_js' )

// Test anonymous function when minimized. See https://github.com/samuelhwilliams/Eel/issues/363
function show_log(msg:string) {
	console.log(msg)
}
window.eel.expose(show_log, 'show_log')

// Set the default path. Would be a text input, but this is a basic example after all
const defPath = '~'






const App = () => {
	const [message , setMessage] = useState(`Click button to choose a random file from the user's system`)
	const [path , setPath] = useState(defPath)

	const pickFile = () => {
		eel.pick_file(defPath)(( message: string ) => setMessage(message) )
	}

	eel.expand_user(defPath)(( path: string ) => setPath(path) )

    const [editorValue, setEditorValue] = useState(""); // AceEditorのテキスト
    const [emotionData, setEmotionData] = useState(null); // 感情分析の結果

    // AceEditorのテキストが変更されたときに実行される関数
    const handleEditorChange = (newText: string) => {
        setEditorValue(newText); // テキストを更新

        // テキストが変更されたら感情分析を実行
        eel.analyze_emotion(newText)((data: string) => {
            const parsedData = JSON.parse(data);
            setEmotionData(parsedData); // 感情分析の結果をセット
			console.log("Parse:", parsedData);
        });
		console.log("Value:", newText);
    };

	return (
		<>
			<BrowserRouter>
				<ChakraProvider theme={theme}>
					<RecoilRoot>
						<Toaster position="top-center" reverseOrder={false} />
						<Text>{message}</Text>
						<Button onClick={pickFile} >Pick Random File From `{path}`</Button>
						<Router />
						<AceEditor
							placeholder="Placeholder Text"
							height="80vh"
							value={editorValue}
							mode="javascript"
							theme="monokai"
							fontSize="16px"
							highlightActiveLine={true}
							setOptions={{
								enableLiveAutocompletion: true,
								showLineNumbers: true,
								tabSize: 2
							}}
							onChange={handleEditorChange} // onChangeプロパティにテキスト変更時のハンドラを指定
						/>
						<div>
							{emotionData && (
								<div>
									<h2>感情分析結果:</h2>
									<pre>{JSON.stringify(emotionData, null, 2)}</pre>
								</div>
							)}
						</div>
					</RecoilRoot>
				</ChakraProvider>
			</BrowserRouter>
		</>
	);
};

export default App;
