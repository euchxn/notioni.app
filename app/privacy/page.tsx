import Link from "next/link";

export const metadata = {
  title: "개인정보처리방침 - Notion Template AI",
  description: "Notion Template AI 개인정보처리방침",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto py-8">
      <Link
        href="/"
        className="text-blue-600 dark:text-blue-400 hover:underline mb-6 inline-block"
      >
        ← 홈으로
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        개인정보처리방침
      </h1>

      <div className="prose dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          최종 업데이트: 2025년 1월
        </p>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
            1. 수집하는 개인정보
          </h2>
          <p>Notion Template AI(이하 &quot;서비스&quot;)는 다음과 같은 정보를 수집합니다:</p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>
              <strong>Google 로그인 시:</strong> 이메일 주소, 이름, 프로필 이미지
            </li>
            <li>
              <strong>Notion 연동 시:</strong> Notion 워크스페이스 정보, 접근 토큰
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
            2. 개인정보의 이용 목적
          </h2>
          <p>수집된 정보는 다음 목적으로만 사용됩니다:</p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>서비스 제공 및 사용자 인증</li>
            <li>Notion 페이지 생성 및 수정 기능 제공</li>
            <li>서비스 개선 및 오류 해결</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
            3. 개인정보의 보관 및 파기
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>개인정보는 서비스 이용 기간 동안 보관됩니다.</li>
            <li>회원 탈퇴 시 모든 개인정보는 즉시 삭제됩니다.</li>
            <li>Notion API 키는 사용자 브라우저에만 저장되며, 서버에 저장되지 않습니다.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
            4. 개인정보의 제3자 제공
          </h2>
          <p>
            서비스는 사용자의 개인정보를 제3자에게 판매, 대여, 공유하지 않습니다.
            단, 다음의 경우는 예외로 합니다:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>법령에 따른 요청이 있는 경우</li>
            <li>사용자의 명시적 동의가 있는 경우</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
            5. 사용자의 권리
          </h2>
          <p>사용자는 언제든지 다음 권리를 행사할 수 있습니다:</p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>개인정보 열람, 수정, 삭제 요청</li>
            <li>Notion 연동 해제</li>
            <li>회원 탈퇴</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
            6. 쿠키 및 로컬 스토리지
          </h2>
          <p>
            서비스는 로그인 세션 유지를 위해 쿠키를 사용하며, 
            사용자 편의를 위해 일부 설정을 브라우저 로컬 스토리지에 저장합니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
            7. 문의
          </h2>
          <p>
            개인정보 관련 문의사항은 서비스 내 문의 기능을 이용해 주세요.
          </p>
        </section>
      </div>
    </div>
  );
}
