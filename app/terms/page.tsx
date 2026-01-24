import Link from "next/link";

export const metadata = {
  title: "이용약관 - Notion Template AI",
  description: "Notion Template AI 서비스 이용약관",
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto py-8">
      <Link
        href="/"
        className="text-blue-600 dark:text-blue-400 hover:underline mb-6 inline-block"
      >
        ← 홈으로
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        이용약관
      </h1>

      <div className="prose dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          최종 업데이트: 2025년 1월
        </p>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
            1. 서비스 소개
          </h2>
          <p>
            Notion Template AI(이하 &quot;서비스&quot;)는 인공지능을 활용하여 
            Notion 템플릿을 자동으로 생성하고, 사용자의 Notion 워크스페이스에 
            추가할 수 있는 웹 애플리케이션입니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
            2. 서비스 이용
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>서비스는 무료로 제공됩니다.</li>
            <li>서비스 이용을 위해 Google 계정으로 로그인할 수 있습니다.</li>
            <li>Notion 연동 시 Notion 계정 권한이 필요합니다.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
            3. 사용자의 책임
          </h2>
          <p>사용자는 다음 사항을 준수해야 합니다:</p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>서비스를 불법적인 목적으로 사용하지 않습니다.</li>
            <li>타인의 권리를 침해하는 콘텐츠를 생성하지 않습니다.</li>
            <li>서비스의 정상적인 운영을 방해하지 않습니다.</li>
            <li>자신의 계정 정보를 안전하게 관리합니다.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
            4. 지적재산권
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>서비스의 소프트웨어, 디자인, 로고 등은 서비스 제공자에게 귀속됩니다.</li>
            <li>사용자가 생성한 템플릿의 저작권은 사용자에게 있습니다.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
            5. 서비스 제한 및 중단
          </h2>
          <p>다음의 경우 서비스 이용이 제한되거나 중단될 수 있습니다:</p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>본 약관을 위반한 경우</li>
            <li>시스템 점검 또는 업데이트가 필요한 경우</li>
            <li>기술적 장애가 발생한 경우</li>
            <li>기타 불가피한 사유가 있는 경우</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
            6. 면책조항
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              서비스는 &quot;있는 그대로&quot; 제공되며, 특정 목적에의 적합성을 보장하지 않습니다.
            </li>
            <li>
              AI가 생성한 콘텐츠의 정확성이나 완전성을 보장하지 않습니다.
            </li>
            <li>
              서비스 이용으로 인한 데이터 손실에 대해 책임지지 않습니다.
            </li>
            <li>
              Notion API 또는 외부 서비스의 변경으로 인한 기능 제한에 대해 책임지지 않습니다.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
            7. 약관의 변경
          </h2>
          <p>
            본 약관은 필요에 따라 변경될 수 있으며, 변경 시 서비스 내 공지를 통해 
            안내합니다. 변경된 약관에 동의하지 않는 경우 서비스 이용을 중단할 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
            8. 문의
          </h2>
          <p>
            서비스 이용 관련 문의사항은 서비스 내 문의 기능을 이용해 주세요.
          </p>
        </section>
      </div>
    </div>
  );
}
