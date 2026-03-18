import fs from 'fs';

const VIMEO_ACCESS_TOKEN = process.env.VIMEO_ACCESS_TOKEN;

// ★ここに先ほどコピーした数字のフォルダIDを貼り付けてください
const FOLDER_ID = '28606548'; 

if (!VIMEO_ACCESS_TOKEN) {
  console.error('エラー: 環境変数 VIMEO_ACCESS_TOKEN が設定されていません。');
  process.exit(1);
}

if (FOLDER_ID === '12345678') {
  console.error('エラー: スクリプト内の FOLDER_ID を実際のフォルダIDに書き換えてください。');
  process.exit(1);
}

async function fetchVimeoVideos() {
  console.log(`フォルダID: ${FOLDER_ID} から動画データを取得中...`);

  try {
    // 取得先のエンドポイントを「特定のフォルダ（プロジェクト）」に変更しています
    const response = await fetch(`https://api.vimeo.com/me/projects/${FOLDER_ID}/videos?per_page=100`, {
      headers: {
        'Authorization': `Bearer ${VIMEO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`APIリクエストに失敗しました: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`📁 フォルダ内の動画総数: ${data.total} 件`);

    if (data.total === 0) {
      console.log('\n⚠️ 指定したフォルダに動画が見つかりませんでした。');
      return;
    }

    let csvContent = 'title,vimeo_id,thumbnail_url\n';

    data.data.forEach(video => {
      const title = video.name.replace(/,/g, '、'); 
      const vimeo_id = video.uri.split('/').pop(); 
      const thumbnail_url = video.pictures?.sizes[0]?.link || '';
      csvContent += `${title},${vimeo_id},${thumbnail_url}\n`;
    });

    const date = new Date();
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const fileName = `videos_import_${yyyy}${mm}${dd}.csv`;

    fs.writeFileSync(fileName, csvContent);
    console.log(`\n✅ 成功: ${fileName} の作成が完了しました！`);

  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

fetchVimeoVideos();