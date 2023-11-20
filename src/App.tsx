import "./App.css";
import theme from "./theme/theme";
import { ChakraProvider, Flex, Box, Table, TableContainer, Thead, Tbody, Tr, Th, Td, Heading, Select, Tab, Tabs, TabList, TabPanel, TabPanels } from "@chakra-ui/react";
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

//var pattern = 「」;

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
					marginTop: dataItem.text.trim() === '' ? '18px' : '0', // Add top margin if text is empty
				}}
			>
				{dataItem.emotion[0] &&
				Object.entries(dataItem.emotion[0]).map(([emotion, value]) => {
					const cumulativeWidth = Object.values(dataItem.emotion[0])
					.filter((v) => v > 0.001)
					.reduce((acc, v) => acc + v, 0);
	
					const barWidth = (value / cumulativeWidth) * 100;
	
					return (
					<div
						key={emotion}
							style={{
							backgroundColor: getColor(emotion),
							height: '19px',
							width: `${barWidth}%`,
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
						<Flex direction="column" align="center">
							<Flex align="center" justify="space-between" w="100%">
								<Flex align="center">
									<Heading size="sm">
										感情分析アプリ
									</Heading>
								</Flex>
								<Flex align="center">
									<Select
										placeholder="character"
										defaultValue=""
									>
										<option value="optionA">オプションA</option>
										<option value="optionB">オプションB</option>
										<option value="optionC">オプションC</option>
									</Select>
									<Select
										placeholder="emotion"
										defaultValue=""
									>
										<option value="喜び">joy</option>
										<option value="期待">Anticipation</option>
										<option value="驚き">Surprise</option>
										<option value="悲しみ">Sadness</option>
										<option value="恐れ">Fear</option>
										<option value="嫌悪">Disgust</option>
										<option value="怒り">Anger</option>
									</Select>
								</Flex>
							</Flex>
						</Flex>
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
							<Box w="40%">
								{/*<Tabs colorScheme='green'>
									<TabList>
										<Tab>Tab 1</Tab>
										<Tab>Tab 2</Tab>
									</TabList>
									<TabPanels>
										<TabPanel>
											<p>one!</p>
										</TabPanel>
										<TabPanel>
											<p>two!</p>
										</TabPanel>
									</TabPanels>
								</Tabs>*/}
								{/* Include the EmotionChart component */}
								<StackedBarChart emotionData={emotionData} />
							</Box>
						</Flex>
						<TableContainer overflowY="auto">
							<Table variant="striped" colorScheme="teal" size="sm">
								<Thead>
									<Tr>
									<Th>ID</Th>
									<Th>Text</Th>
									<Th>Emotion</Th>
									</Tr>
								</Thead>
								<Tbody>
									{emotionData.map((dataItem) => (
									<Tr key={dataItem.id}>
										<Td>{dataItem.id}</Td>
										<Td whiteSpace="normal">{dataItem.text}</Td>
										<Td>
										{dataItem.emotion[0] && (
											<>
											{Object.entries(dataItem.emotion[0]).map(
												([emotion, value]) => (
												<span key={emotion}>{`${emotion}: ${value.toFixed(3)} `}</span>
												)
											)}
											</>
										)}
										</Td>
									</Tr>
									))}
								</Tbody>
							</Table>
						</TableContainer>
					</RecoilRoot>
				</ChakraProvider>
			</BrowserRouter>
		</>
	);
};

export default App;
