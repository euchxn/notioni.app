import { Client } from "@notionhq/client";
import {
  GeneratedTemplate,
  TemplateBlock,
  DatabaseSchema,
  DatabaseProperty,
  ChildPage,
} from "./prompts";

export function createNotionClient(accessToken: string) {
  return new Client({ auth: accessToken });
}

function convertBlockToNotion(block: TemplateBlock): object {
  const baseBlock = {
    object: "block" as const,
  };

  switch (block.type) {
    case "heading_1":
      return {
        ...baseBlock,
        type: "heading_1",
        heading_1: {
          rich_text: [{ type: "text", text: { content: block.content } }],
        },
      };
    case "heading_2":
      return {
        ...baseBlock,
        type: "heading_2",
        heading_2: {
          rich_text: [{ type: "text", text: { content: block.content } }],
        },
      };
    case "heading_3":
      return {
        ...baseBlock,
        type: "heading_3",
        heading_3: {
          rich_text: [{ type: "text", text: { content: block.content } }],
        },
      };
    case "paragraph":
      return {
        ...baseBlock,
        type: "paragraph",
        paragraph: {
          rich_text: [{ type: "text", text: { content: block.content } }],
        },
      };
    case "bulleted_list_item":
      return {
        ...baseBlock,
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{ type: "text", text: { content: block.content } }],
        },
      };
    case "numbered_list_item":
      return {
        ...baseBlock,
        type: "numbered_list_item",
        numbered_list_item: {
          rich_text: [{ type: "text", text: { content: block.content } }],
        },
      };
    case "to_do":
      return {
        ...baseBlock,
        type: "to_do",
        to_do: {
          rich_text: [{ type: "text", text: { content: block.content } }],
          checked: block.checked || false,
        },
      };
    case "divider":
      return {
        ...baseBlock,
        type: "divider",
        divider: {},
      };
    case "callout":
      return {
        ...baseBlock,
        type: "callout",
        callout: {
          rich_text: [{ type: "text", text: { content: block.content } }],
          icon: { emoji: "💡" },
        },
      };
    case "quote":
      return {
        ...baseBlock,
        type: "quote",
        quote: {
          rich_text: [{ type: "text", text: { content: block.content } }],
        },
      };
    default:
      return {
        ...baseBlock,
        type: "paragraph",
        paragraph: {
          rich_text: [{ type: "text", text: { content: block.content } }],
        },
      };
  }
}

function convertDatabaseProperties(schema: DatabaseSchema) {
  const properties: Record<string, object> = {};

  for (const [name, prop] of Object.entries(schema.properties)) {
    switch (prop.type) {
      case "title":
        properties[name] = { title: {} };
        break;
      case "rich_text":
        properties[name] = { rich_text: {} };
        break;
      case "checkbox":
        properties[name] = { checkbox: {} };
        break;
      case "select":
        properties[name] = {
          select: {
            options:
              prop.options?.map((opt) => ({
                name: opt,
              })) || [],
          },
        };
        break;
      case "date":
        properties[name] = { date: {} };
        break;
      case "number":
        properties[name] = { number: {} };
        break;
      default:
        properties[name] = { rich_text: {} };
    }
  }

  return properties;
}

export async function createNotionPage(
  accessToken: string,
  parentPageId: string,
  template: GeneratedTemplate
) {
  const notion = createNotionClient(accessToken);

  // 블록 변환
  const children = template.blocks.map(convertBlockToNotion);

  // 페이지 생성
  const page = await notion.pages.create({
    parent: { page_id: parentPageId },
    icon: template.icon ? { emoji: template.icon as never } : undefined,
    properties: {
      title: {
        title: [{ text: { content: template.title } }],
      },
    },
    children: children as never[],
  });

  // 데이터베이스가 있으면 생성
  if (template.database) {
    await notion.databases.create({
      parent: { page_id: page.id },
      title: [{ type: "text", text: { content: template.database.title } }],
      properties: convertDatabaseProperties(template.database) as never,
    });
  }

  return page;
}

// Notion 블록을 우리 앱의 TemplateBlock 형식으로 변환
function convertNotionBlockToTemplate(block: {
  id: string;
  type: string;
  [key: string]: unknown;
}): TemplateBlock | null {
  const blockType = block.type;
  const blockData = block[blockType] as {
    rich_text?: Array<{ plain_text: string }>;
    checked?: boolean;
  };

  // rich_text에서 텍스트 추출
  const getText = () => {
    if (blockData?.rich_text && Array.isArray(blockData.rich_text)) {
      return blockData.rich_text.map((t) => t.plain_text).join("");
    }
    return "";
  };

  switch (blockType) {
    case "heading_1":
    case "heading_2":
    case "heading_3":
    case "paragraph":
    case "bulleted_list_item":
    case "numbered_list_item":
    case "quote":
    case "callout":
      return {
        id: block.id,
        type: blockType,
        content: getText(),
      };
    case "to_do":
      return {
        id: block.id,
        type: blockType,
        content: getText(),
        checked: blockData?.checked || false,
      };
    case "divider":
      return {
        id: block.id,
        type: "divider",
        content: "",
      };
    default:
      // 지원하지 않는 블록 타입은 무시
      return null;
  }
}

// 페이지 정보와 블록 불러오기
export async function fetchNotionPage(
  accessToken: string,
  pageId: string
): Promise<GeneratedTemplate & { pageId: string }> {
  const notion = createNotionClient(accessToken);

  // 페이지 정보 가져오기
  const page = (await notion.pages.retrieve({ page_id: pageId })) as {
    id: string;
    icon?: { type: string; emoji?: string };
    properties: {
      title?: {
        title: Array<{ plain_text: string }>;
      };
    };
  };

  // 페이지 제목 추출
  let title = "제목 없음";
  const titleProp = page.properties?.title;
  if (titleProp?.title && titleProp.title.length > 0) {
    title = titleProp.title.map((t) => t.plain_text).join("");
  }

  // 아이콘 추출
  let icon: string | undefined;
  if (page.icon?.type === "emoji" && page.icon.emoji) {
    icon = page.icon.emoji;
  }

  // 블록 목록 가져오기
  const blocksResponse = await notion.blocks.children.list({
    block_id: pageId,
    page_size: 100,
  });

  const blocks: TemplateBlock[] = [];
  const childPages: ChildPage[] = [];

  for (const block of blocksResponse.results) {
    const notionBlock = block as { id: string; type: string; [key: string]: unknown };

    // 하위 페이지 감지
    if (notionBlock.type === "child_page") {
      const childPageData = notionBlock.child_page as { title: string };
      // 하위 페이지의 상세 정보 가져오기 (아이콘)
      try {
        const childPageInfo = (await notion.pages.retrieve({ page_id: notionBlock.id })) as {
          id: string;
          icon?: { type: string; emoji?: string };
        };
        childPages.push({
          id: notionBlock.id,
          title: childPageData.title,
          icon: childPageInfo.icon?.type === "emoji" ? childPageInfo.icon.emoji : undefined,
        });
      } catch {
        // 권한이 없는 경우 기본 정보만 추가
        childPages.push({
          id: notionBlock.id,
          title: childPageData.title,
        });
      }
    } else {
      const converted = convertNotionBlockToTemplate(notionBlock);
      if (converted) {
        blocks.push(converted);
      }
    }
  }

  return {
    pageId: page.id,
    title,
    icon,
    blocks,
    childPages: childPages.length > 0 ? childPages : undefined,
    // 데이터베이스는 별도 처리 필요 (복잡하므로 일단 제외)
  };
}

// 블록 업데이트 (변경된 부분만)
export async function updateNotionBlocks(
  accessToken: string,
  pageId: string,
  originalBlocks: TemplateBlock[],
  newBlocks: TemplateBlock[]
): Promise<void> {
  const notion = createNotionClient(accessToken);

  // 원본 블록 ID 맵 생성
  const originalBlockMap = new Map<string, TemplateBlock>();
  for (const block of originalBlocks) {
    if (block.id) {
      originalBlockMap.set(block.id, block);
    }
  }

  // 새 블록에서 ID가 있는 것과 없는 것 분리
  const blocksToUpdate: TemplateBlock[] = [];
  const blocksToCreate: TemplateBlock[] = [];
  const processedIds = new Set<string>();

  for (const block of newBlocks) {
    if (block.id && originalBlockMap.has(block.id)) {
      // 기존 블록 - 변경 여부 확인
      const original = originalBlockMap.get(block.id)!;
      if (
        original.content !== block.content ||
        original.type !== block.type ||
        original.checked !== block.checked
      ) {
        blocksToUpdate.push(block);
      }
      processedIds.add(block.id);
    } else {
      // 새 블록
      blocksToCreate.push(block);
    }
  }

  // 삭제할 블록 찾기 (원본에 있지만 새 블록에 없는 것)
  const blocksToDelete: string[] = [];
  for (const block of originalBlocks) {
    if (block.id && !processedIds.has(block.id)) {
      blocksToDelete.push(block.id);
    }
  }

  // 1. 블록 삭제
  for (const blockId of blocksToDelete) {
    try {
      await notion.blocks.delete({ block_id: blockId });
    } catch (error) {
      console.error(`Failed to delete block ${blockId}:`, error);
    }
  }

  // 2. 블록 업데이트
  for (const block of blocksToUpdate) {
    if (!block.id) continue;
    try {
      const updateData = createBlockUpdateData(block);
      await notion.blocks.update({
        block_id: block.id,
        ...updateData,
      });
    } catch (error) {
      console.error(`Failed to update block ${block.id}:`, error);
    }
  }

  // 3. 새 블록 추가 (페이지 끝에)
  if (blocksToCreate.length > 0) {
    const children = blocksToCreate.map(convertBlockToNotion);
    await notion.blocks.children.append({
      block_id: pageId,
      children: children as never[],
    });
  }
}

// 블록 업데이트용 데이터 생성
function createBlockUpdateData(block: TemplateBlock): object {
  const richText = [{ type: "text", text: { content: block.content } }];

  switch (block.type) {
    case "heading_1":
      return { heading_1: { rich_text: richText } };
    case "heading_2":
      return { heading_2: { rich_text: richText } };
    case "heading_3":
      return { heading_3: { rich_text: richText } };
    case "paragraph":
      return { paragraph: { rich_text: richText } };
    case "bulleted_list_item":
      return { bulleted_list_item: { rich_text: richText } };
    case "numbered_list_item":
      return { numbered_list_item: { rich_text: richText } };
    case "to_do":
      return {
        to_do: {
          rich_text: richText,
          checked: block.checked || false,
        },
      };
    case "callout":
      return {
        callout: {
          rich_text: richText,
          icon: { emoji: "💡" },
        },
      };
    case "quote":
      return { quote: { rich_text: richText } };
    default:
      return { paragraph: { rich_text: richText } };
  }
}

// 페이지 제목/아이콘 업데이트
export async function updateNotionPageProperties(
  accessToken: string,
  pageId: string,
  title: string,
  icon?: string
): Promise<void> {
  const notion = createNotionClient(accessToken);

  await notion.pages.update({
    page_id: pageId,
    icon: icon ? { emoji: icon as never } : undefined,
    properties: {
      title: {
        title: [{ text: { content: title } }],
      },
    },
  });
}
