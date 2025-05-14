import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className
}) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      className={className}
      components={{
        p: ({ node, ...props }) => <p className="mb-4" {...props} />,
        h1: ({ node, ...props }) => (
          <h1
            className="text-2xl font-bold mb-4 mt-6"
            style={{
              lineHeight: "1.5"
            }}
            {...props}
          />
        ),
        h2: ({ node, ...props }) => (
          <h2
            className="text-xl font-bold mb-3 mt-5"
            style={{
              lineHeight: "1.5"
            }}
            {...props}
          />
        ),
        h3: ({ node, ...props }) => (
          <h3
            className="text-lg font-bold mb-3 mt-4"
            style={{
              lineHeight: "1.5"
            }}
            {...props}
          />
        ),
        h4: ({ node, ...props }) => (
          <h4 className="text-base font-bold mb-2 mt-4" {...props} />
        ),
        // Add more spacing between list items
        li: ({ node, ...props }) => (
          <li className="my-1" style={{ lineHeight: "1.6" }} {...props} />
        ),
        // Add spacing and styling for lists
        ul: ({ node, ...props }) => (
          <ul className="list-disc pl-6 mb-4 mt-2" {...props} />
        ),
        ol: ({ node, ...props }) => (
          <ol className="list-decimal pl-6 mb-4 mt-2" {...props} />
        ),
        // Style tables properly
        table: ({ node, ...props }) => (
          <table
            className="w-full border-collapse mb-6 border border-gray-300"
            {...props}
          />
        ),
        thead: ({ node, ...props }) => (
          <thead className="bg-gray-100" {...props} />
        ),
        tbody: ({ node, ...props }) => <tbody {...props} />,
        tr: ({ node, ...props }) => (
          <tr className="border-b border-gray-300" {...props} />
        ),
        th: ({ node, ...props }) => (
          <th
            className="border border-gray-300 px-4 py-2 text-left font-semibold"
            {...props}
          />
        ),
        td: ({ node, ...props }) => (
          <td className="border border-gray-300 px-4 py-2" {...props} />
        ),
        // Style blockquotes
        blockquote: ({ node, ...props }) => (
          <blockquote
            className="pl-4 border-l-4 border-gray-300 italic my-4"
            {...props}
          />
        ),
        // Style code blocks
        code: ({ node, inline, ...props }) =>
          inline ? (
            <code
              className="bg-gray-100 px-1 rounded font-mono text-sm"
              {...props}
            />
          ) : (
            <code
              className="block bg-gray-100 p-4 rounded font-mono text-sm my-4 overflow-auto"
              {...props}
            />
          ),
        // Style horizontal rules
        hr: ({ node, ...props }) => (
          <hr className="my-6 border-t border-gray-300" {...props} />
        )
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export { MarkdownRenderer };
