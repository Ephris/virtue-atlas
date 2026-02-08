interface QuickQueryBarProps {
  queries: string[];
  onQueryClick: (query: string) => void;
  disabled?: boolean;
}

const QuickQueryBar = ({ queries, onQueryClick, disabled }: QuickQueryBarProps) => {
  return (
    <div className="flex flex-wrap gap-1.5 border-b border-border px-4 py-2">
      {queries.map((q) => (
        <button
          key={q}
          onClick={() => onQueryClick(q)}
          disabled={disabled}
          className="rounded-full border border-border bg-muted px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          {q}
        </button>
      ))}
    </div>
  );
};

export default QuickQueryBar;
