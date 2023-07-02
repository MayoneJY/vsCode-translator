import * as dotenv from 'dotenv';
dotenv.config({ path: __dirname + '/../.env' });
const clientId = process.env.CLIENT_ID
const clientSecret = process.env.CLIENT_SECRET
import * as vscode from 'vscode';
import express from 'express';
var app = express();
var temp = 2;

export function activate(context: vscode.ExtensionContext) {

	console.log('축하합니다. "translator" 확장이 이제 활성화되었습니다!');

	let disposable = vscode.commands.registerCommand('translator.translate', () => {
		// Get the active text editor
		const editor = vscode.window.activeTextEditor;

		if (editor) {
			const document = editor.document;
			const selection = editor.selection;

			// Get the word within the selection
			const word = document.getText(selection);

			var query = word;
			var api_url = 'https://openapi.naver.com/v1/papago/n2mt';
			var request = require('request');
			var options = {
				url: api_url,
				form: {'source':'ko', 'target':'en', 'text':query},
				headers: {'X-Naver-Client-Id':clientId, 'X-Naver-Client-Secret': clientSecret}
				};
			request.post(options, function (error, response, body) {
				if (!error && response.statusCode == 200) {
					// 번역된 결과를 불러오기
					let result = JSON.parse(body).message.result.translatedText;

					result = result.toLowerCase();
					// 설정된 기법에 따라 변환
					if (temp == 1) {
						// 카멜 기법
						result = result.replace(" ", "_");
					}
					else if (temp == 2) {
						// 스네이크 기법
						var resultWords = result.split(" ");
						for (var i = 1; i < resultWords.length; i++) {
							resultWords[i] = resultWords[i][0].toUpperCase() + resultWords[i].substr(1);
						}
						result = resultWords.join("");
					}

					// 변환된 결과를 에디터에 적용
					editor.edit(editBuilder => {
						editBuilder.replace(selection, result);
					});
				} else {
					console.log('error = ' + response.statusCode);	
				}
			});
			app.listen(3000, function () {
			console.log('http://127.0.0.1:3000/translate app listening on port 3000!');
			});


		}
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}