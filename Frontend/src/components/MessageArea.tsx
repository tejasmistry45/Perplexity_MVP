import React from 'react';

const PremiumTypingAnimation = () => {
    return (
        <div className="flex items-center">
            <div className="flex items-center space-x-1.5">
                <div className="w-1.5 h-1.5 bg-gray-400/70 rounded-full animate-pulse"
                    style={{ animationDuration: "1s", animationDelay: "0ms" }}></div>
                <div className="w-1.5 h-1.5 bg-gray-400/70 rounded-full animate-pulse"
                    style={{ animationDuration: "1s", animationDelay: "300ms" }}></div>
                <div className="w-1.5 h-1.5 bg-gray-400/70 rounded-full animate-pulse"
                    style={{ animationDuration: "1s", animationDelay: "600ms" }}></div>
            </div>
        </div>
    );
};

const SearchStages = ({ searchInfo }: { searchInfo: any }) => {
    if (!searchInfo || !searchInfo.stages || searchInfo.stages.length === 0) return null;

    return (
        <div className="mb-3 mt-1 relative pl-4">
            <div className="flex flex-col space-y-4 text-sm text-gray-700">
                {searchInfo.stages.includes('searching') && (
                    <div className="relative">
                        <div className="absolute -left-3 top-1 w-2.5 h-2.5 bg-teal-400 rounded-full z-10 shadow-sm"></div>
                        {searchInfo.stages.includes('reading') && (
                            <div className="absolute -left-[7px] top-3 w-0.5 h-[calc(100%+1rem)] bg-gradient-to-b from-teal-300 to-teal-200"></div>
                        )}
                        <div className="flex flex-col">
                            <span className="font-medium mb-2 ml-2">
                                {searchInfo.source === 'controlled' ? 'Searching the web' : 
                                 searchInfo.source === 'documents' ? 'Searching documents' : 'Searching the web'}
                            </span>
                            
                            {/* Show ALL Queries - Original + Sub-queries */}
                            <div className="flex flex-wrap gap-2 pl-2 mt-1">
                                {/* Original Query */}
                                {searchInfo.query && (
                                    <div className="bg-blue-100 text-xs px-3 py-1.5 rounded border border-blue-200 inline-flex items-center">
                                        <svg className="w-3 h-3 mr-1.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                        </svg>
                                        <span className="font-semibold text-blue-700">Original:</span>
                                        <span className="ml-1 text-blue-600">{searchInfo.query}</span>
                                    </div>
                                )}
                                
                                {/* ALL Sub-Queries */}
                                {searchInfo.subQueries && searchInfo.subQueries.length > 0 && (
                                    searchInfo.subQueries.map((subQuery: string, index: number) => (
                                        <div key={index} className="bg-gray-100 text-xs px-3 py-1.5 rounded border border-gray-200 inline-flex items-center">
                                            <span className="text-gray-500 font-medium mr-1">{index + 2}.</span>
                                            <span className="text-gray-600">{subQuery}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {searchInfo.stages.includes('reading') && (
                    <div className="relative">
                        <div className="absolute -left-3 top-1 w-2.5 h-2.5 bg-teal-400 rounded-full z-10 shadow-sm"></div>
                        <div className="flex flex-col">
                            <span className="font-medium mb-2 ml-2">Reading sources</span>
                            
                            {/* Show ALL Web Sources */}
                            {searchInfo.webSources && searchInfo.webSources.length > 0 && (
                                <div className="pl-2 space-y-1 mb-2">
                                    <div className="flex flex-wrap gap-2">
                                        {searchInfo.webSources.map((source: any, index: number) => (
                                            <div key={`web-${index}-${source.url}`} className="bg-blue-50 text-xs px-3 py-1.5 rounded border border-blue-200 truncate max-w-[200px] transition-all duration-200 hover:bg-blue-100">
                                                <span className="text-blue-600 font-medium">
                                                    🌐 {source.domain || (source.url ? new URL(source.url).hostname.replace('www.', '') : 'Unknown')}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {/* Show ALL Document Sources */}
                            {searchInfo.documentSources && searchInfo.documentSources.length > 0 && (
                                <div className="pl-2 space-y-1">
                                    <div className="flex flex-wrap gap-2">
                                        {searchInfo.documentSources.map((source: any, index: number) => (
                                            <div key={`doc-${index}-${source.filename}`} className="bg-purple-50 text-xs px-3 py-1.5 rounded border border-purple-200 truncate max-w-[200px] transition-all duration-200 hover:bg-purple-100">
                                                <span className="text-purple-600 font-medium">
                                                    📄 {source.filename}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Show count if many sources */}
                            {((searchInfo.webSources?.length || 0) + (searchInfo.documentSources?.length || 0)) > 8 && (
                                <div className="pl-2 mt-2 text-xs text-gray-500">
                                    Total: {(searchInfo.webSources?.length || 0) + (searchInfo.documentSources?.length || 0)} sources
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {searchInfo.stages.includes('writing') && (
                    <div className="relative">
                        <div className="absolute -left-3 top-1 w-2.5 h-2.5 bg-teal-400 rounded-full z-10 shadow-sm"></div>
                        <span className="font-medium pl-2">Writing answer</span>
                    </div>
                )}

                {searchInfo.stages.includes('error') && (
                    <div className="relative">
                        <div className="absolute -left-3 top-1 w-2.5 h-2.5 bg-red-400 rounded-full z-10 shadow-sm"></div>
                        <span className="font-medium pl-2 text-red-600">Search error</span>
                        <div className="pl-4 text-xs text-red-500 mt-1">
                            {searchInfo.error || "An error occurred during search."}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Enhanced markdown parser with proper table support
const parseMarkdown = (content: string) => {
    if (!content) return content;

    // Clean up the content first
    let cleanContent = content
        .replace(/^\|[-\s:]+\|$/gm, '')
        .replace(/^[-\s]+$/gm, '')
        .replace(/\n\s*\n\s*\n/g, '\n\n')
        .trim();

    const lines = cleanContent.split('\n');
    const parsed: JSX.Element[] = [];
    let listItems: string[] = [];
    let inList = false;
    let tableRows: string[][] = [];
    let inTable = false;
    let tableHeaders: string[] = [];

    const flushList = () => {
        if (listItems.length > 0) {
            parsed.push(
                <ul key={`list-${parsed.length}`} className="list-disc ml-6 space-y-2 mb-4">
                    {listItems.map((item, idx) => (
                        <li key={idx} className="text-gray-700 leading-relaxed">
                            {formatInlineMarkdown(item)}
                        </li>
                    ))}
                </ul>
            );
            listItems = [];
        }
        inList = false;
    };

    const flushTable = () => {
        if (tableRows.length > 0) {
            parsed.push(
                <div key={`table-${parsed.length}`} className="overflow-x-auto mb-4">
                    <table className="min-w-full border border-gray-200 rounded-lg shadow-sm">
                        {tableHeaders.length > 0 && (
                            <thead className="bg-gray-50">
                                <tr>
                                    {tableHeaders.map((header, idx) => (
                                        <th key={idx} className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                                            {formatInlineMarkdown(header.trim())}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                        )}
                        <tbody className="bg-white divide-y divide-gray-200">
                            {tableRows.map((row, rowIdx) => (
                                <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                    {row.map((cell, cellIdx) => (
                                        <td key={cellIdx} className="px-4 py-3 text-sm text-gray-700 border-b border-gray-100">
                                            {formatInlineMarkdown(cell.trim())}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
            tableRows = [];
            tableHeaders = [];
        }
        inTable = false;
    };

    const formatInlineMarkdown = (text: string): JSX.Element => {
        // Handle clickable citations: [1](url) -> clickable link
        const citationRegex = /\[(\d+)\]\((https?:\/\/[^\s)]+)\)/g;
        const parts = text.split(citationRegex);
        
        return (
            <span>
                {parts.map((part, idx) => {
                    // Check if this part is a citation number
                    if (idx % 3 === 1 && parts[idx + 1]) {
                        const citationNumber = part;
                        const citationUrl = parts[idx + 1];
                        return (
                            <a
                                key={idx}
                                href={citationUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center w-5 h-5 text-xs bg-blue-100 text-blue-700 rounded border border-blue-300 hover:bg-blue-200 transition-colors duration-150 ml-1 no-underline"
                                title={`Source: ${citationUrl}`}
                            >
                                {citationNumber}
                            </a>
                        );
                    }
                    // Skip URL parts (they're handled above)
                    if (idx % 3 === 2) return null;
                    
                    // Handle bold text
                    if (part.includes('**')) {
                        const boldParts = part.split(/(\*\*.*?\*\*)/g);
                        return (
                            <span key={idx}>
                                {boldParts.map((boldPart, boldIdx) => {
                                    if (boldPart.startsWith('**') && boldPart.endsWith('**') && boldPart.length > 4) {
                                        return <strong key={boldIdx} className="font-semibold text-gray-900">{boldPart.slice(2, -2)}</strong>;
                                    }
                                    return boldPart;
                                })}
                            </span>
                        );
                    }
                    
                    return part;
                })}
            </span>
        );
    };

    lines.forEach((line, index) => {
        const trimmed = line.trim();

        if (!trimmed || /^[-\s|:]+$/.test(trimmed)) {
            return;
        }

        if (trimmed.includes('|') && trimmed.split('|').length > 2) {
            const cells = trimmed.split('|').map(cell => cell.trim()).filter(cell => cell.length > 0);

            if (cells.length > 0) {
                if (!inTable) {
                    flushList();
                    inTable = true;
                    tableHeaders = cells;
                } else {
                    tableRows.push(cells);
                }
                return;
            }
        } else {
            flushTable();
        }

        // Headers
        if (trimmed.startsWith('## ')) {
            flushList();
            parsed.push(
                <h2 key={`h2-${index}`} className="text-xl font-semibold text-gray-800 mb-3 mt-6 first:mt-0 pb-2 border-b border-gray-200">
                    {formatInlineMarkdown(trimmed.slice(3))}
                </h2>
            );
        
        } else if (trimmed.startsWith('### ')) {
            flushList();
            flushTable();
            parsed.push(
                <h3 key={`h3-${index}`} className="text-base font-medium text-gray-800 mb-2 mt-3 first:mt-0">
                    {formatInlineMarkdown(trimmed.slice(4))}
                </h3>
            );
        } else if (trimmed.startsWith('#### ')) {
            flushList();
            flushTable();
            parsed.push(
                <h4 key={`h4-${index}`} className="text-sm font-medium text-gray-800 mb-1 mt-2 first:mt-0">
                    {formatInlineMarkdown(trimmed.slice(5))}
                </h4>
            );
        }
        // Bullet points
        else if (trimmed.startsWith('• ')) {
            inList = true;
            listItems.push(trimmed.slice(2));
        }
        // Regular paragraphs
        else {
            flushList();
            parsed.push(
                <p key={`p-${index}`} className="text-gray-700 mb-3 leading-relaxed">
                    {formatInlineMarkdown(trimmed)}
                </p>
            );
        }
    });

    flushList();
    flushTable();

    return <div className="space-y-1">{parsed}</div>;
};

interface Message {
    id: number;
    content: string;
    isUser: boolean;
    type: string;
    isLoading?: boolean;
    searchInfo?: any;
}

interface MessageAreaProps {
    messages: Message[];
}

const MessageArea: React.FC<MessageAreaProps> = ({ messages }) => {
    return (
        <div className="flex-grow overflow-y-auto bg-[#FCFCF8] border-b border-gray-100" style={{ minHeight: 0 }}>
            <div className="max-w-6xl mx-auto p-4">
                {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} mb-4`}>
                        <div className={`flex flex-col ${message.isUser ? 'max-w-md' : 'max-w-5xl w-full'}`}>
                            {!message.isUser && message.searchInfo && (
                                <SearchStages searchInfo={message.searchInfo} />
                            )}

                            <div
                                className={`rounded-lg py-3 px-4 ${message.isUser
                                    ? 'bg-gradient-to-br from-[#5E507F] to-[#4A3F71] text-white rounded-br-none shadow-md'
                                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
                                    }`}
                            >
                                {message.isLoading ? (
                                    <PremiumTypingAnimation />
                                ) : (
                                    <div className="max-w-none">
                                        {message.isUser ? (
                                            <p className="mb-0 text-white text-sm">{message.content}</p>
                                        ) : (
                                            parseMarkdown(message.content || "Waiting for response...")
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MessageArea;
