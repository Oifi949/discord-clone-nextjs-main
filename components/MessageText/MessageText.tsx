import { useChatContext } from "stream-chat-react";

export default function MessageText({ message }: any) {
  const { client } = useChatContext();
  const mention = `@${client.user?.name}`;

  const highlighted = message.text.replace(
    mention,
    `<span class="bg-yellow-300 text-black px-1 rounded">${mention}</span>`,
  );

  return (
    <div
      dangerouslySetInnerHTML={{ __html: highlighted }}
      className="text-sm"
    />
  );
}
