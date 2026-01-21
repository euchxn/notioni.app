"use client";

import { useState } from "react";
import {
  GeneratedTemplate,
  TemplateBlock,
  DatabaseProperty,
  ChildPage,
} from "@/lib/prompts";

interface TemplateEditorProps {
  template: GeneratedTemplate;
  onUpdate: (template: GeneratedTemplate) => void;
  onNavigateToChildPage?: (childPage: ChildPage) => void;
}

const BLOCK_TYPES = [
  { value: "heading_1", label: "대제목" },
  { value: "heading_2", label: "중제목" },
  { value: "heading_3", label: "소제목" },
  { value: "paragraph", label: "텍스트" },
  { value: "bulleted_list_item", label: "글머리 기호" },
  { value: "numbered_list_item", label: "번호 목록" },
  { value: "to_do", label: "체크박스" },
  { value: "toggle", label: "토글" },
  { value: "code", label: "코드" },
  { value: "callout", label: "강조 박스" },
  { value: "quote", label: "인용" },
  { value: "divider", label: "구분선" },
];

const PROPERTY_TYPES = [
  { value: "title", label: "제목" },
  { value: "rich_text", label: "텍스트" },
  { value: "checkbox", label: "체크박스" },
  { value: "select", label: "선택" },
  { value: "date", label: "날짜" },
  { value: "number", label: "숫자" },
];

function BlockEditor({
  block,
  index,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: {
  block: TemplateBlock;
  index: number;
  onUpdate: (block: TemplateBlock) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <div className="flex items-start gap-2 p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors group">
      <div className="flex flex-col gap-1">
        <button
          onClick={onMoveUp}
          disabled={isFirst}
          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30"
          title="위로 이동"
        >
          ▲
        </button>
        <button
          onClick={onMoveDown}
          disabled={isLast}
          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30"
          title="아래로 이동"
        >
          ▼
        </button>
      </div>

      <select
        value={block.type}
        onChange={(e) => onUpdate({ ...block, type: e.target.value })}
        className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 dark:text-white"
      >
        {BLOCK_TYPES.map((type) => (
          <option key={type.value} value={type.value}>
            {type.label}
          </option>
        ))}
      </select>

      {block.type === "divider" ? (
        <div className="flex-1 flex items-center">
          <hr className="flex-1 border-gray-300 dark:border-gray-500" />
        </div>
      ) : (
        <input
          type="text"
          value={block.content}
          onChange={(e) => onUpdate({ ...block, content: e.target.value })}
          className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 dark:text-white"
          placeholder="내용을 입력하세요"
        />
      )}

      {block.type === "to_do" && (
        <label className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
          <input
            type="checkbox"
            checked={block.checked || false}
            onChange={(e) => onUpdate({ ...block, checked: e.target.checked })}
          />
          완료
        </label>
      )}

      <button
        onClick={onDelete}
        className="p-1 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
        title="삭제"
      >
        ✕
      </button>
    </div>
  );
}

function DatabaseEditor({
  database,
  onUpdate,
  onDelete,
}: {
  database: NonNullable<GeneratedTemplate["database"]>;
  onUpdate: (database: NonNullable<GeneratedTemplate["database"]>) => void;
  onDelete: () => void;
}) {
  const addProperty = () => {
    const newName = `속성 ${Object.keys(database.properties).length + 1}`;
    onUpdate({
      ...database,
      properties: {
        ...database.properties,
        [newName]: { type: "rich_text" },
      },
    });
  };

  const updatePropertyName = (oldName: string, newName: string) => {
    if (oldName === newName || !newName.trim()) return;
    const { [oldName]: prop, ...rest } = database.properties;
    onUpdate({
      ...database,
      properties: { ...rest, [newName]: prop },
    });
  };

  const updatePropertyType = (
    name: string,
    type: DatabaseProperty["type"]
  ) => {
    const prop = database.properties[name];
    const newProp: DatabaseProperty = { type };
    if (type === "select") {
      newProp.options = prop.options || ["옵션1", "옵션2"];
    }
    onUpdate({
      ...database,
      properties: { ...database.properties, [name]: newProp },
    });
  };

  const updatePropertyOptions = (name: string, options: string[]) => {
    onUpdate({
      ...database,
      properties: {
        ...database.properties,
        [name]: { ...database.properties[name], options },
      },
    });
  };

  const deleteProperty = (name: string) => {
    const { [name]: _, ...rest } = database.properties;
    onUpdate({ ...database, properties: rest });
  };

  return (
    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">📊</span>
          <input
            type="text"
            value={database.title}
            onChange={(e) => onUpdate({ ...database, title: e.target.value })}
            className="text-lg font-semibold border-b border-transparent hover:border-gray-300 dark:hover:border-gray-500 focus:border-blue-500 outline-none bg-transparent dark:text-white"
          />
        </div>
        <button
          onClick={onDelete}
          className="text-sm text-red-500 hover:text-red-700"
        >
          데이터베이스 삭제
        </button>
      </div>

      <div className="space-y-2">
        {Object.entries(database.properties).map(([name, prop]) => (
          <div
            key={name}
            className="flex items-start gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600"
          >
            <input
              type="text"
              value={name}
              onChange={(e) => updatePropertyName(name, e.target.value)}
              className="w-32 px-2 py-1 text-sm border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 dark:text-white"
              placeholder="속성명"
            />
            <select
              value={prop.type}
              onChange={(e) =>
                updatePropertyType(name, e.target.value as DatabaseProperty["type"])
              }
              className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 dark:text-white"
            >
              {PROPERTY_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {prop.type === "select" && (
              <input
                type="text"
                value={prop.options?.join(", ") || ""}
                onChange={(e) =>
                  updatePropertyOptions(
                    name,
                    e.target.value.split(",").map((s) => s.trim())
                  )
                }
                className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 dark:text-white"
                placeholder="옵션1, 옵션2, ..."
              />
            )}
            <button
              onClick={() => deleteProperty(name)}
              className="p-1 text-red-400 hover:text-red-600"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={addProperty}
        className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
      >
        + 속성 추가
      </button>
    </div>
  );
}

export default function TemplateEditor({
  template,
  onUpdate,
  onNavigateToChildPage,
}: TemplateEditorProps) {
  const [isEditing, setIsEditing] = useState(false);

  const updateBlock = (index: number, block: TemplateBlock) => {
    const newBlocks = [...template.blocks];
    newBlocks[index] = block;
    onUpdate({ ...template, blocks: newBlocks });
  };

  const deleteBlock = (index: number) => {
    const newBlocks = template.blocks.filter((_, i) => i !== index);
    onUpdate({ ...template, blocks: newBlocks });
  };

  const moveBlock = (index: number, direction: "up" | "down") => {
    const newBlocks = [...template.blocks];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[newIndex]] = [
      newBlocks[newIndex],
      newBlocks[index],
    ];
    onUpdate({ ...template, blocks: newBlocks });
  };

  const addBlock = () => {
    onUpdate({
      ...template,
      blocks: [...template.blocks, { type: "paragraph", content: "" }],
    });
  };

  const addDatabase = () => {
    onUpdate({
      ...template,
      database: {
        title: "새 데이터베이스",
        properties: {
          이름: { type: "title" },
          상태: { type: "select", options: ["예정", "진행중", "완료"] },
        },
      },
    });
  };

  if (!isEditing) {
    // 미리보기 모드
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {template.icon && (
              <span className="text-3xl">{template.icon}</span>
            )}
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {template.title}
            </h2>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            편집하기
          </button>
        </div>

        <div className="space-y-1 border-t border-gray-200 dark:border-gray-700 pt-4">
          {template.blocks.map((block, index) => (
            <BlockPreview key={index} block={block} />
          ))}
        </div>

        {/* 하위 페이지 목록 */}
        {template.childPages && template.childPages.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">하위 페이지</h4>
            <div className="space-y-2">
              {template.childPages.map((childPage) => (
                <button
                  key={childPage.id}
                  onClick={() => onNavigateToChildPage?.(childPage)}
                  className="w-full flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors text-left group"
                >
                  <span className="text-xl">{childPage.icon || "📄"}</span>
                  <span className="flex-1 font-medium text-gray-800 dark:text-gray-200">{childPage.title}</span>
                  <span className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                    →
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {template.database && (
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              {template.database.title}
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 dark:border-gray-600 text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    {Object.entries(template.database.properties).map(
                      ([name, prop]) => (
                        <th
                          key={name}
                          className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-300"
                        >
                          {name}
                          <span className="ml-1 text-xs text-gray-400">
                            ({prop.type})
                          </span>
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  <tr className="dark:bg-gray-800">
                    {Object.entries(template.database.properties).map(
                      ([name, prop]) => (
                        <td
                          key={name}
                          className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-500 dark:text-gray-400"
                        >
                          {prop.type === "select" && prop.options
                            ? prop.options.join(" / ")
                            : prop.type === "checkbox"
                              ? "[ ]"
                              : prop.type === "date"
                                ? "YYYY-MM-DD"
                                : "..."}
                        </td>
                      )
                    )}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 편집 모드
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">템플릿 편집</h3>
        <button
          onClick={() => setIsEditing(false)}
          className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          편집 완료
        </button>
      </div>

      {/* 제목 & 아이콘 편집 */}
      <div className="flex items-center gap-3 mb-6 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <input
          type="text"
          value={template.icon || ""}
          onChange={(e) => onUpdate({ ...template, icon: e.target.value })}
          className="w-16 text-center text-2xl border border-gray-300 dark:border-gray-500 rounded p-1 bg-white dark:bg-gray-600"
          placeholder="📋"
        />
        <input
          type="text"
          value={template.title}
          onChange={(e) => onUpdate({ ...template, title: e.target.value })}
          className="flex-1 text-xl font-bold border border-gray-300 dark:border-gray-500 rounded px-3 py-2 bg-white dark:bg-gray-600 dark:text-white"
          placeholder="템플릿 제목"
        />
      </div>

      {/* 블록 편집 */}
      <div className="space-y-2 mb-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">블록</h4>
        {template.blocks.map((block, index) => (
          <BlockEditor
            key={index}
            block={block}
            index={index}
            onUpdate={(b) => updateBlock(index, b)}
            onDelete={() => deleteBlock(index)}
            onMoveUp={() => moveBlock(index, "up")}
            onMoveDown={() => moveBlock(index, "down")}
            isFirst={index === 0}
            isLast={index === template.blocks.length - 1}
          />
        ))}
        <button
          onClick={addBlock}
          className="w-full py-2 text-sm text-blue-600 dark:text-blue-400 border border-dashed border-blue-300 dark:border-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
        >
          + 블록 추가
        </button>
      </div>

      {/* 하위 페이지 */}
      {template.childPages && template.childPages.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">하위 페이지</h4>
          <div className="space-y-2">
            {template.childPages.map((childPage) => (
              <button
                key={childPage.id}
                onClick={() => onNavigateToChildPage?.(childPage)}
                className="w-full flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600 transition-colors text-left group"
              >
                <span className="text-xl">{childPage.icon || "📄"}</span>
                <span className="flex-1 font-medium text-gray-800 dark:text-gray-200">{childPage.title}</span>
                <span className="text-sm text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  들어가서 편집 →
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 데이터베이스 편집 */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">데이터베이스</h4>
        {template.database ? (
          <DatabaseEditor
            database={template.database}
            onUpdate={(db) => onUpdate({ ...template, database: db })}
            onDelete={() => onUpdate({ ...template, database: undefined })}
          />
        ) : (
          <button
            onClick={addDatabase}
            className="w-full py-3 text-sm text-blue-600 dark:text-blue-400 border border-dashed border-blue-300 dark:border-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
          >
            + 데이터베이스 추가
          </button>
        )}
      </div>
    </div>
  );
}

function BlockPreview({ block }: { block: TemplateBlock }) {
  switch (block.type) {
    case "heading_1":
      return (
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-6 mb-2">
          {block.content}
        </h1>
      );
    case "heading_2":
      return (
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-5 mb-2">
          {block.content}
        </h2>
      );
    case "heading_3":
      return (
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-4 mb-2">
          {block.content}
        </h3>
      );
    case "paragraph":
      return <p className="text-gray-700 dark:text-gray-300 my-2">{block.content}</p>;
    case "bulleted_list_item":
      return (
        <li className="text-gray-700 dark:text-gray-300 ml-4 list-disc">{block.content}</li>
      );
    case "numbered_list_item":
      return (
        <li className="text-gray-700 dark:text-gray-300 ml-4 list-decimal">{block.content}</li>
      );
    case "to_do":
      return (
        <div className="flex items-center gap-2 my-1">
          <input
            type="checkbox"
            checked={block.checked}
            readOnly
            className="w-4 h-4 rounded border-gray-300 dark:border-gray-600"
          />
          <span className="text-gray-700 dark:text-gray-300">{block.content}</span>
        </div>
      );
    case "divider":
      return <hr className="my-4 border-gray-200 dark:border-gray-600" />;
    case "toggle":
      return (
        <details className="my-2 group">
          <summary className="cursor-pointer text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
            {block.content || "토글 제목"}
          </summary>
          <div className="pl-5 pt-2 text-gray-600 dark:text-gray-400 text-sm">
            토글 내용이 여기에 표시됩니다.
          </div>
        </details>
      );
    case "code":
      return (
        <pre className="my-3 p-4 bg-gray-900 dark:bg-gray-950 text-gray-100 rounded-lg overflow-x-auto text-sm font-mono">
          <code>{block.content || "// 코드를 입력하세요"}</code>
        </pre>
      );
    case "callout":
      return (
        <div className="bg-gray-100 dark:bg-gray-700 border-l-4 border-yellow-400 p-4 my-3 rounded-r">
          <p className="text-gray-700 dark:text-gray-300">{block.content}</p>
        </div>
      );
    case "quote":
      return (
        <blockquote className="border-l-4 border-gray-300 dark:border-gray-500 pl-4 my-3 italic text-gray-600 dark:text-gray-400">
          {block.content}
        </blockquote>
      );
    default:
      return <p className="text-gray-700 dark:text-gray-300 my-2">{block.content}</p>;
  }
}
