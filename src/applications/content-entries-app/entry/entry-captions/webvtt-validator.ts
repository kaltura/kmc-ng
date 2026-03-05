export type WebVttValidationIssueCode = 'EXTRA_BLANK_BLOCK' | 'MISSING_WEBVTT_HEADER';

export interface WebVttValidationIssue {
    code: WebVttValidationIssueCode;
    message: string;
    /** 1-based line numbers (best-effort). */
    lineNumbers?: number[];
}

export interface WebVttValidationResult {
    valid: boolean;
    issues: WebVttValidationIssue[];
}

export interface WebVttUiValidationResult {
    valid: boolean;
    errorMessage: string;
}

/**
 * Normalizes line endings to match WebVTT parser behavior.
 */
function normalizeLikeParser(input: string): string {
    return input.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
}

/**
 * Lightweight validation to detect common WebVTT formatting issues that can break parsers.
 *
 * Focuses on the known issue in WebVTT parsers: splitting on "\n\n" creates empty
 * cue blocks when there are multiple blank lines (e.g. after the WEBVTT header).
 */
export function validateWebVtt(rawVtt: string): WebVttValidationResult {
    const issues: WebVttValidationIssue[] = [];

    if (!rawVtt || typeof rawVtt !== 'string') {
        return { valid: true, issues };
    }

    const normalized = normalizeLikeParser(rawVtt);

    // Check for WEBVTT header
    if (!normalized.startsWith('WEBVTT')) {
        issues.push({
            code: 'MISSING_WEBVTT_HEADER',
            message: 'File must start with the signature "WEBVTT".'
        });
        return { valid: false, issues };
    }

    // Split into blocks (cues are separated by double newlines)
    const blocks = normalized.split('\n\n');

    if (blocks.length <= 1) {
        return { valid: true, issues };
    }

    // Approximate 1-based start line number of each block.
    // Each split separator is two newlines.
    const blockStartLines: number[] = [];
    let currentLine = 1;
    for (let i = 0; i < blocks.length; i++) {
        blockStartLines.push(currentLine);
        const newlinesInBlock = (blocks[i].match(/\n/g) || []).length;
        currentLine += newlinesInBlock + 2;
    }

    const emptyBlockLines: number[] = [];
    // blocks[0] is the header; cue blocks start at 1
    for (let i = 1; i < blocks.length; i++) {
        if (blocks[i].trim() === '') {
            emptyBlockLines.push(blockStartLines[i]);
        }
    }

    if (emptyBlockLines.length > 0) {
        issues.push({
            code: 'EXTRA_BLANK_BLOCK',
            message:
                `Found ${emptyBlockLines.length} empty cue block(s) caused by extra blank lines. ` +
                `Some WebVTT parsers reject files with these empty blocks (commonly from multiple blank lines after the WEBVTT header).`,
            lineNumbers: emptyBlockLines
        });
    }

    return { valid: issues.length === 0, issues };
}

/**
 * Formats validation issues into a human-readable string.
 */
export function formatWebVttIssues(issues: WebVttValidationIssue[]): string {
    if (!issues || issues.length === 0) {
        return '';
    }

    return issues
        .map(issue => {
            const where = issue.lineNumbers && issue.lineNumbers.length
                ? ` (block starts at line(s): ${issue.lineNumbers.slice(0, 8).join(', ')}${issue.lineNumbers.length > 8 ? '…' : ''})`
                : '';
            return `${issue.message}${where}`;
        })
        .join('\n');
}

export function isWebVttFileName(fileName: string): boolean {
    const lower = (fileName || '').toLowerCase();
    return lower.endsWith('.vtt') || lower.endsWith('.webvtt');
}

export function isWebVttFile(file: File): boolean {
    return !!file && isWebVttFileName(file.name);
}

function readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        if (!file) {
            reject(new Error('No file provided'));
            return;
        }

        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error || new Error('Failed reading file'));
        reader.readAsText(file);
    });
}

export async function validateWebVttFile(file: File): Promise<WebVttValidationResult> {
    const content = await readFileAsText(file);
    return validateWebVtt(content);
}

/**
 * Convenience helper for UI flows: validates a WebVTT File and returns a formatted error message.
 */
export async function validateWebVttFileForUi(file: File): Promise<WebVttUiValidationResult> {
    const result = await validateWebVttFile(file);
    if (result.valid) {
        return { valid: true, errorMessage: '' };
    }

    return {
        valid: false,
        errorMessage: formatWebVttIssues(result.issues)
    };
}
