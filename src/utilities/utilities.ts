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



export default makeFirstLetterUppercase;