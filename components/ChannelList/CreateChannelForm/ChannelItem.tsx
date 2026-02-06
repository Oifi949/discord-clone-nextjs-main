export function ChannelItem({
  active,
  icon,
  children,
}: {
  active?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`
        flex items-center gap-2 px-2 py-1.5 rounded
        cursor-pointer select-none text-sm
        ${
          active
            ? "bg-[#404249] text-white"
            : "text-[#949ba4] hover:bg-[#35373c] hover:text-gray-200"
        }
      `}
    >
      {icon}
      <span className="truncate">{children}</span>
    </div>
  );
}
