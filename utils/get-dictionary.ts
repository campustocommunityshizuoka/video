import 'server-only';

// ロケールごとのJSONファイルを動的にインポートするオブジェクト
const dictionaries = {
  en: () => import('../dictionaries/en.json').then((module) => module.default),
  ja: () => import('../dictionaries/ja.json').then((module) => module.default),
};

// 辞書を取得する非同期関数
export const getDictionary = async (locale: 'en' | 'ja') => {
  // 指定された言語が存在しない場合は、安全のため日本語(ja)をフォールバックとして返します
  return dictionaries[locale]?.() ?? dictionaries.ja();
};