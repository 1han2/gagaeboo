# Couple's Finance Book

부부를 위한 심플한 가계부 웹사이트입니다.

## 기능
- **달력 보기**: 월별 소비 내역을 달력 형태로 확인
- **내역 추가**: 수입/지출 내역 간편 등록
- **통계**: 월별 수입/지출 및 카테고리별 통계 확인
- **데이터 연동**: 로컬 저장소(기본) 또는 구글 시트 연동 가능

## 구글 시트 연동 방법

1. **구글 클라우드 프로젝트 설정**
   - Google Cloud Console에서 새 프로젝트 생성
   - **Google Sheets API** 사용 설정
   - **서비스 계정(Service Account)** 생성 및 키(JSON) 다운로드

2. **구글 시트 준비**
   - 새 구글 시트 생성
   - 시트 이름을 `Transactions`로 변경
   - 첫 번째 행(헤더)에 다음 컬럼 추가:
     `ID`, `Date`, `Amount`, `Category`, `Merchant`, `Consumer`, `Type`, `Memo`
   - 시트 공유 설정에서 서비스 계정 이메일(`xxx@xxx.iam.gserviceaccount.com`)을 편집자로 추가

3. **환경 변수 설정**
   - `.env.local` 파일 생성
   - 다음 내용 추가:
     ```bash
     NEXT_PUBLIC_USE_GOOGLE_SHEETS=true
     USE_GOOGLE_SHEETS=true
     GOOGLE_SHEET_ID=구글_시트_ID
     GOOGLE_CLIENT_EMAIL=서비스_계정_이메일
     GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
     ```

## 실행 방법

```bash
npm run dev
```
# gagaeboo
