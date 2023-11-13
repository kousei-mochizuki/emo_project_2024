import "./App.css";
import theme from "./theme/theme";
import { ChakraProvider, Flex, Box } from "@chakra-ui/react";
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

// EmotionDataItem インターフェースを追加
interface EmotionDataItem {
	id: number;
	text: string;
	emotion: { [key: string]: number }[];
}

const StackedBarChart: React.FC<{ emotionData: EmotionDataItem[] }> = ({ emotionData }) => {
	// Check if emotionData is empty or not available
	if (!emotionData || emotionData.length === 0) {
	  // Return a placeholder or empty div if no emotion data is available
		return <div>No emotion data available.</div>;
	}

	return (
		<div>
			{emotionData.map((dataItem, index) => (
			<div
				key={dataItem.id}
				style={{
				display: 'flex',
				justifyContent: 'space-between',
				marginTop: index > 0 ? '10px' : '0', // Add top margin for all but the first graph
				}}
			>
				{dataItem.emotion[0] && Object.entries(dataItem.emotion[0]).map(([emotion, value]) => {
				const cumulativeWidth = Object.values(dataItem.emotion[0])
					.filter((v) => v > 0.1)
					.reduce((acc, v) => acc + v, 0);
	
				return (
					<div
					key={emotion}
					style={{
						backgroundColor: getColor(emotion),
						height: '18px',
						width: `${(value / cumulativeWidth) * 100}%`,
						border: '1px solid #fff',
						position: 'relative',
					}}
					></div>
				);
				})}
			</div>
			))}
		</div>
	);
};


// getColor関数にも型を指定
const getColor = (emotion: string): string => {
	switch (emotion) {
		case '喜び':
			return 'green';
		case '期待':
			return 'blue';
		case '驚き':
			return 'orange';
		case '悲しみ':
			return 'purple';
		case '恐れ':
			return 'brown';
		case '嫌悪':
			return 'pink';
		case '怒り':
			return 'red';
		default:
			return 'gray';
	}
};


const App: React.FC = () => {

	const [editorValue, setEditorValue] = useState(""); // AceEditorのテキスト
	const [emotionData, setEmotionData] = useState<EmotionDataItem[]>([]); // 感情分析の結果（IDごと）
	
	// AceEditorのテキストが変更されたときに実行される関数
	const handleEditorChange = (newText: string) => {
		setEditorValue(newText);
		
			// Check if the text is empty
			const trimmedText = newText.trim();
			if (!trimmedText) {
			// If text is empty, create empty emotion data to maintain graph spacing
			setEmotionData([{ id: 1, text: "", emotion: [{}] }]);
			return; // Skip emotion analysis if the text is empty
			}
		
			// Perform emotion analysis only when there is non-empty text
			const lines = trimmedText.split("\n");
			const idTextPairs = lines.map((line, index) => ({ id: index + 1, text: line }));
		
			eel.analyze_emotion(idTextPairs)((data: string) => {
			console.log("Received data:", data);
		
			try {
				const parsedData = JSON.parse(data);
				setEmotionData(parsedData);
				console.log("Parse:", parsedData);
			} catch (error) {
				console.error("Error parsing JSON:", error);
			}
			});
		
		console.log("Value:", newText);
	};




	return (
		<>
			<BrowserRouter>
				<ChakraProvider theme={theme}>
					<RecoilRoot>
						<Toaster position="top-center" reverseOrder={false} />
						<Router/>
						<Flex alignItems="flex-start">
							<Box>
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
							</Box>
							<Box w="50%">
								{/* Include the EmotionChart component */}
								<StackedBarChart emotionData={emotionData} />
							</Box>
						</Flex>
						<div>
							<div>
								<h2>感情分析結果:</h2>
								<a>{JSON.stringify(emotionData, null, 2)}</a>
							</div>
						</div>
					</RecoilRoot>
				</ChakraProvider>
			</BrowserRouter>
		</>
	);
};

export default App;
