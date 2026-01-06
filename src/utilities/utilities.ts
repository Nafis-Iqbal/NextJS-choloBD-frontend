/* eslint-disable @typescript-eslint/no-explicit-any */
export function errorResponse(error: unknown)
{
  const errorMessage = error instanceof Error ? error.message: 'Unidentified Error'; 
  
  return new Response(
      JSON.stringify({
        status: 'error',
        message: 'Internal Server Error.' + errorMessage,
        data: null,
      }),
      { status: 500 }
  );
}

export function stripNulls<T extends Record<string, any>>(obj: T): Partial<T> {
    return Object.fromEntries(
        Object.entries(obj).filter(([, value]) => {
            if (value === null) return false;

            if (Array.isArray(value) && value.length === 0) return false;

            return true;
        })
    ) as Partial<T>;
}

const makeFirstLetterUppercase = (word: string | undefined): string => {
    if(word){
        return word.charAt(0).toUpperCase() + word.slice(1);
    }
    else return "";
}

export const isNumber = (text: string): boolean => {
    return !isNaN(Number(text));
};

export const calculateRemainingDays = (date: string | Date): number => {
    const targetDate = new Date(date);
    const today = new Date();

    // Remove time part for an accurate difference
    targetDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convert ms to days

    return diffDays;
};

export const checkIfSubstring = (bigString: string, subString: string): boolean => {
    if(bigString.includes(subString)){
        return true;
    }
    else {
        return false;
    }
}

/**
 * Produce a readable validation error message from a Zod safeParse result.
 * Returns a single string like: "Check fieldName: message; Check other: message"
 */
export const produceValidationErrorMessage = (result: any): string => {
    const issues = result?.error?.issues || [];
    if (!Array.isArray(issues) || issues.length === 0) {
        return result?.error?.message || 'Validation failed';
    }

    const messages = (issues as any[]).map((i) => {
        const path = Array.isArray(i.path) && i.path.length ? i.path.join('.') : 'form';
        const msg = i.message || 'Invalid value';
        return `Check ${path}: ${msg}`;
    });

    return messages.join('; ');
};

export const stripLeadingDateFromISO = (datetime?: string | Date): string => {
    if (datetime === undefined || datetime === null) return "";

    // Normalize to string (if Date provided, convert to ISO)
    const s = typeof datetime === "string" ? datetime : (datetime instanceof Date ? datetime.toISOString() : String(datetime));

    // If ISO-like with 'T', return the date part before 'T'
    const tIndex = s.indexOf("T");
    if (tIndex !== -1) {
        return s.substring(0, tIndex);
    }

    // If there's a space separator, return part before first space
    const spaceIndex = s.indexOf(" ");
    if (spaceIndex !== -1) {
        return s.substring(0, spaceIndex);
    }

    // Fallback: extract leading YYYY-MM-DD if present
    const m = s.match(/^(\d{4}-\d{2}-\d{2})/);
    if (m && m[1]) return m[1];

    // Nothing to strip (no leading date found) - return original
    return s;
};

export default makeFirstLetterUppercase;