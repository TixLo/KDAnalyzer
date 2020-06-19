# KDAnalyzer
## Concept
- 此分析方式並不適用短期操作, 而是基於"相對長期"(數週 or 數月)方針下的分析方式
## How to install
- Install node.js (https://nodejs.org/zh-tw/download/)
- Clone this project
- npm install
## How to execute
- npm start
## Description
![alt text](images/snapshot-1.png)
- 儲存資料：把既有的股票資料儲存
- 選擇檔案：載入之前所存放的股票資料，載入之後並不會把既存的取代，而是會合併
- 股票代號：指定要抓取的股票代號，並選擇所要抓的歷史資料時間
- 更新最新股票資料：會根據資料庫裡的內容，自動抓取最新股票資訊
- 分析所有股票：會根據資料庫裡的內容，自動根據KD/天數的關係，試圖找出最好的投資方式
- 分析：根據股票資料，繪製股價/KD線圖，並自動根據KD模擬投資效益
- 刪除：把指定的股票資料刪除
![alt text](images/snapshot-2.png)
![alt text](images/snapshot-3.png)
