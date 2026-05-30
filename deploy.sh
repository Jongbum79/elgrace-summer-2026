#!/bin/bash
# GitHub Pages 자동 배포 및 업데이트 스크립트

# 커밋 메시지가 입력되지 않았다면 기본 메시지 지정
if [ -z "$1" ]; then
  COMMIT_MSG="수련회 대시보드 업데이트"
else
  COMMIT_MSG="$1"
fi

echo "🚀 [1/3] 변경된 파일들을 선택합니다..."
git add index.html app.js styles.css .gitignore

echo "💾 [2/3] 커밋(저장)을 생성합니다: \"$COMMIT_MSG\""
git commit -m "$COMMIT_MSG"

echo "📤 [3/3] GitHub 원격 서버로 코드를 보냅니다..."
git push origin main

echo "✅ 배포 요청 완료! 약 1분 후 실제 웹사이트에 업데이트가 반영됩니다."
