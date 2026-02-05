module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // 新機能
        'fix', // バグ修正
        'docs', // ドキュメントのみの変更
        'style', // コードの意味に影響を与えない変更（空白、フォーマット、セミコロンなど）
        'refactor', // バグ修正や機能追加ではないコードの変更
        'perf', // パフォーマンス向上のための変更
        'test', // テストの追加や修正
        'chore', // ビルドプロセスやツール、ライブラリの変更
        'revert', // 以前のコミットを元に戻す
        'build', // ビルドシステムや外部依存関係に影響する変更
        'ci', // CI設定ファイルやスクリプトの変更
      ],
    ],
    'subject-case': [0], // subject の大文字小文字を制限しない（日本語対応）
  },
};
